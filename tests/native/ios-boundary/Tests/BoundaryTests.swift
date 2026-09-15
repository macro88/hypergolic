import Foundation
import UIKit
import WebKit
import XCTest
@testable import BoundaryProbe

/// Native script injection supplies the attack stimulus. DOM/CSP/native responses are actual WK behavior.
@MainActor
final class BoundaryTests: XCTestCase {
  private var probe: Probe?

  override func tearDown() async throws {
    if let probe { try probe.attach(to: self, name: name); probe.close() }
    probe = nil
    try await super.tearDown()
  }

  private func makeReady() async throws -> Probe {
    let value = Probe(); probe = value
    try await value.ready()
    return value
  }

  // Transport-only admission; this theme-only fixture confers no storage permission.
  // Genuine SDK authorization and SQLite are exercised in the owning-app journey.
  private func configured() async throws -> Probe {
    let p = Probe(); probe = p
    let config: [String: Any] = ["sessionId": p.session, "epoch": 3,
      "user": String(repeating: "1", count: 64), "publisher": String(repeating: "2", count: 64),
      "appId": "ux-lab", "version": String(repeating: "3", count: 64),
      "instanceId": "native-probe-instance", "fixture": "ux-lab", "domains": ["theme"]]
    try await p.ready(configuration: String(decoding: JSONSerialization.data(withJSONObject: config), as: UTF8.self))
    return p
  }

  private func request(_ p: Probe, sequence: Int = 1) async throws -> String {
    let generation = try p.generation
    _ = try await p.json("""
      window.capabilityReply = null;
      window.addEventListener('message', event => {
        if (event.isTrusted && event.source === window && event.data?.type === 'hypergolic.native-response') {
          window.capabilityReply = JSON.parse(event.data.message);
        }
      });
      HypergolicHost.postMessage(JSON.stringify({type:'capability',sessionId:'\(generation)',sequence:\(sequence),
        message:JSON.stringify({type:'storage.set',id:'native-probe',key:'literal',value:'string value'})}));
      return {sent:true};
      """, frame: p.main)
    try await p.until("native capability token") { p.events.contains { $0["type"] as? String == "capability" } }
    return try XCTUnwrap(p.events.last?["token"] as? String)
  }

  func testCapabilityNativeSnapshotOneUseAndOriginalReply() async throws {
    let p = try await configured()
    let token = try await request(p)
    let raw = try XCTUnwrap(CapabilityTransport.leases.take(token))
    XCTAssertNil(CapabilityTransport.leases.take(token))
    XCTAssertTrue(CapabilityTransport.leases.isActive(token))
    let snapshot = try XCTUnwrap(JSONSerialization.jsonObject(with: Data(raw.utf8)) as? [String: Any])
    let registration = try XCTUnwrap(snapshot["registration"] as? [String: Any])
    XCTAssertEqual(registration["generation"] as? String, try p.generation)
    XCTAssertEqual(registration["sessionId"] as? String, p.session)
    XCTAssertEqual(registration["user"] as? String, String(repeating: "1", count: 64))
    XCTAssertEqual(registration["publisher"] as? String, String(repeating: "2", count: 64))
    XCTAssertEqual(registration["domains"] as? [String], ["theme"])
    let payload = try XCTUnwrap(snapshot["request"] as? String)
    XCTAssertEqual(try JSONSerialization.jsonObject(with: Data(payload.utf8)) as? [String: String],
      ["type":"storage.set","id":"native-probe","key":"literal","value":"string value"])
    CapabilityTransport.finish(token, response: "{\"type\":\"storage.set.result\",\"id\":\"native-probe\"}")
    let result = try await p.json("""
      return await new Promise((resolve,reject)=>{
        const deadline=performance.now()+3000;
        const read=()=>{if(window.capabilityReply)resolve(window.capabilityReply);
          else if(performance.now()>deadline)reject(Error('No native reply'));else setTimeout(read,10);}; read();
      });
      """, frame: p.main)
    XCTAssertEqual(result["sequence"] as? Int, 1)
    XCTAssertEqual(result["sessionId"] as? String, try p.generation)
    XCTAssertEqual(result["response"] as? String, "{\"type\":\"storage.set.result\",\"id\":\"native-probe\"}")
    XCTAssertFalse(CapabilityTransport.leases.isActive(token))
  }

  func testCapabilityGuestSyntheticWrongFrameAndGenerationCannotAdmit() async throws {
    let p = try await configured()
    let generation = try p.generation
    let payload = "{\"type\":\"capability\",\"sessionId\":\"\(generation)\",\"sequence\":1,\"message\":\"{}\"}"
    let encoded = String(decoding: try JSONSerialization.data(withJSONObject: [payload]), as: UTF8.self)
    for frame in [p.guest, p.main] {
      let source = frame?.isMainFrame == true ? "window.dispatchEvent(new MessageEvent('message',{source:window,data:value}));" : "parent.postMessage(value,'*');"
      _ = try await p.json("const value={type:'hypergolic.native-diagnostic',message:\(encoded)[0]};\(source)return {sent:true};",frame:frame)
    }
    let child = try await p.diagnostic(payload, frame: p.guest)
    XCTAssertEqual(child["accepted"] as? Bool, false)
    let foreign = try await p.diagnostic(payload.replacingOccurrences(of: generation, with: "foreign-generation"), frame: p.main)
    XCTAssertEqual(foreign["accepted"] as? Bool, false)
    try await p.barrier()
    XCTAssertEqual(p.events.count, 1)
  }

  func testCapabilityCloseRevokesClaimedAndQueuedWork() async throws {
    let p = try await configured()
    let token = try await request(p)
    XCTAssertNotNil(CapabilityTransport.leases.take(token))
    p.close()
    XCTAssertFalse(CapabilityTransport.leases.isActive(token))
    XCTAssertFalse(CapabilityTransport.leases.sessionActive(try p.generation))
    CapabilityTransport.finish(token, response: "must-not-deliver")
    XCTAssertNil(CapabilityTransport.leases.take(token))
  }

  func testCapabilityFrameNavigationRevokesBeforeReplacement() async throws {
    let p = try await configured()
    let token = try await request(p)
    XCTAssertNotNil(CapabilityTransport.leases.take(token))
    _ = try? await p.json("location.href='about:blank';return {attempted:true};",frame:p.guest)
    try await p.until("native frame revocation") { !CapabilityTransport.leases.isActive(token) }
    XCTAssertEqual(p.events.last?["type"] as? String, "error")
    XCTAssertTrue(p.host.subviews.isEmpty)
    XCTAssertNil(CapabilityTransport.leases.take(token))
  }

  func testGenuineKehtoHandshakeAndThemeWithVerifiedResources() async throws {
    let p = try await makeReady()
    let value = try await p.json("""
      return {environment:await napplet.shell.ready(),domains:Object.keys(napplet),
        theme:napplet.shell.supports('theme'),relay:napplet.shell.supports('relay')};
      """, frame: p.guest)
    XCTAssertEqual(value["domains"] as? [String], ["shell","theme"])
    XCTAssertEqual(value["theme"] as? Bool, true)
    XCTAssertEqual(value["relay"] as? Bool, false)
    let environment = try XCTUnwrap(value["environment"] as? [String: Any])
    XCTAssertEqual(environment["services"] as? [String], ["theme"])
    XCTAssertEqual((environment["capabilities"] as? [String: Any])?["domains"] as? [String], ["theme"])
    XCTAssertFalse(try XCTUnwrap(p.webView).configuration.websiteDataStore.isPersistent)
    let main = try await p.json("return {sandbox:document.querySelector('#napplet').getAttribute('sandbox'),count:document.querySelectorAll('iframe').length};",frame:p.main)
    XCTAssertEqual(main["sandbox"] as? String, "allow-scripts")
    XCTAssertEqual(main["count"] as? Int, 1)
    XCTAssertNotEqual(try p.generation, p.session)
    XCTAssertNotNil(UUID(uuidString: try p.generation))
  }

  func testOpaqueGuestCannotReadParentNativeOrStorage() async throws {
    let p = try await makeReady()
    let value = try await p.json("""
      const access={};
      for(const [name,fn] of Object.entries({parent:()=>parent.document.body,parentBridge:()=>parent.HypergolicHost,
        localStorage:()=>localStorage.getItem('x'),sessionStorage:()=>sessionStorage.getItem('x'),indexedDB:()=>indexedDB.open('x')})) {
        try{ fn(); access[name]=true; }catch{access[name]=false;}
      }
      return {access,ownBridge:typeof HypergolicHost,legacyBridge:typeof ReactNativeWebView,nostr:typeof nostr,
        diagnostic:typeof window.webkit?.messageHandlers?.HypergolicDiagnostic};
      """, frame:p.guest)
    XCTAssertEqual(value["access"] as? [String: Bool], ["parent":false,"parentBridge":false,"localStorage":false,"sessionStorage":false,"indexedDB":false])
    for key in ["ownBridge","legacyBridge","nostr","diagnostic"] { XCTAssertEqual(value[key] as? String,"undefined",key) }
    try await p.barrier()
  }

  func testActualGuestSourceCannotForgeTopDiagnostic() async throws {
    let p = try await makeReady()
    let generation = try p.generation
    _ = try await p.json("""
      parent.postMessage({type:'hypergolic.native-diagnostic',message:JSON.stringify({type:'error',sessionId:'\(generation)',code:'forged-guest'})},'*');
      return {sent:true};
      """,frame:p.guest)
    try await p.barrier()
    XCTAssertEqual(p.events.count,1)
  }

  func testSyntheticEventCannotForgeTrustedDiagnostic() async throws {
    let p = try await makeReady()
    let generation = try p.generation
    let result = try await p.json("""
      const event=new MessageEvent('message',{source:window,data:{type:'hypergolic.native-diagnostic',message:JSON.stringify({type:'error',sessionId:'\(generation)',code:'forged-synthetic'})}});
      window.dispatchEvent(event); return {trusted:event.isTrusted};
      """,frame:p.main)
    XCTAssertEqual(result["trusted"] as? Bool,false)
    try await p.barrier()
  }

  func testPrivilegedInjectionWrongWorldHasNoDiagnosticHandler() async throws {
    let p = try await makeReady()
    for world in [WKContentWorld.page,p.world] {
      let value = try await p.json("return {handler:typeof window.webkit?.messageHandlers?.HypergolicDiagnostic};",frame:p.main,world:world)
      XCTAssertEqual(value["handler"] as? String,"undefined")
    }
    try await p.barrier()
  }

  func testPrivilegedInjectionActualChildFrameIsRejectedByNative() async throws {
    let p = try await makeReady()
    let payload = String(decoding:try JSONSerialization.data(withJSONObject:["type":"error","sessionId":try p.generation,"code":"wrong-frame"]),as:UTF8.self)
    let value = try await p.diagnostic(payload,frame:p.guest)
    XCTAssertEqual(value["accepted"] as? Bool,false)
    XCTAssertTrue((value["error"] as? String)?.contains("Diagnostic rejected") == true)
    try await p.barrier()
  }

  func testPrivilegedInjectionNativeSchemaGenerationAndSizeDenials() async throws {
    let p = try await makeReady()
    let generation = try p.generation
    let values:[Any] = [42, ["type":"ready","sessionId":generation], "invalid-json", "[]",
      String(repeating:"x",count:2049), String(repeating:"é",count:1025),
      "{\"type\":\"error\",\"sessionId\":\"wrong-generation\",\"code\":\"wrong-generation\"}",
      "{\"type\":\"ready\",\"sessionId\":\"\(generation)\"}",
      "{\"type\":\"error\",\"sessionId\":\"\(generation)\",\"code\":\"UPPER\"}",
      "{\"type\":\"error\",\"sessionId\":\"\(generation)\",\"code\":\"extra-field\",\"extra\":true}"]
    for value in values {
      let result=try await p.diagnostic(value,frame:p.main)
      XCTAssertEqual(result["accepted"] as? Bool,false)
      XCTAssertTrue((result["error"] as? String)?.contains("Diagnostic rejected") == true)
    }
    try await p.barrier()
  }

  func testPrivilegedInjectionAdmittedMainDiagnosticDestroysGeneration() async throws {
    let p=try await makeReady()
    let view=try XCTUnwrap(p.webView)
    let payload=String(decoding:try JSONSerialization.data(withJSONObject:["type":"error","sessionId":try p.generation,"code":"native-admission-probe"]),as:UTF8.self)
    // Destruction may invalidate this outstanding native evaluation; admission is proved by the actual event + teardown.
    _ = try? await p.diagnostic(payload,frame:p.main)
    try await p.until("admitted error event") { p.events.count==2 }
    XCTAssertEqual(p.events.last?["code"] as? String,"native-admission-probe")
    XCTAssertEqual(p.events.last?["sessionId"] as? String,p.session)
    XCTAssertNil(view.superview)
    XCTAssertNil(view.navigationDelegate)
    XCTAssertNil(view.uiDelegate)
    XCTAssertTrue(p.host.subviews.isEmpty)
  }

  func testGuestNetworkEffectsProduceActualCSPDenials() async throws {
    let p=try await makeReady()
    let value=try await p.json("""
      const violations=[];addEventListener('securitypolicyviolation',e=>violations.push({directive:e.effectiveDirective,uri:e.blockedURI}));
      const denied={};
      try {await fetch('https://fetch.boundary.invalid/probe');denied.fetch=false;} catch{denied.fetch=true;}
      const outcome=(start)=>new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('No denial observed')),2000);start(v=>{clearTimeout(t);resolve(v)});});
      denied.socket=await outcome(done=>{try{const s=new WebSocket('wss://socket.boundary.invalid/probe');s.onopen=()=>{s.close();done(false)};s.onerror=()=>done(true);}catch{done(true)}});
      denied.image=await outcome(done=>{const i=new Image();i.onload=()=>done(false);i.onerror=()=>done(true);i.src='https://image.boundary.invalid/probe';});
      denied.script=await outcome(done=>{const s=document.createElement('script');s.onload=()=>done(false);s.onerror=()=>done(true);s.src='https://script.boundary.invalid/probe.js';document.head.append(s);});
      const blob=URL.createObjectURL(new Blob(['postMessage(1)'],{type:'text/javascript'}));
      denied.worker=await outcome(done=>{try{const w=new Worker(blob);w.onmessage=()=>{w.terminate();done(false)};w.onerror=e=>{e.preventDefault();w.terminate();done(true)};}catch{done(true)}});URL.revokeObjectURL(blob);
      await new Promise(resolve=>setTimeout(resolve,100));return {denied,violations};
      """,frame:p.guest)
    XCTAssertEqual(value["denied"] as? [String:Bool],["fetch":true,"socket":true,"image":true,"script":true,"worker":true])
    let violations=try XCTUnwrap(value["violations"] as? [[String:String]])
    // Unique hosts preserve attribution even if WebKit redacts the URL path.
    for (host,directives) in [("fetch.boundary.invalid",["connect-src"]),
      ("socket.boundary.invalid",["connect-src"]),("image.boundary.invalid",["img-src"]),
      ("script.boundary.invalid",["script-src","script-src-elem"])] {
      XCTAssertTrue(violations.contains { item in
        directives.contains(item["directive"] ?? "") && URL(string:item["uri"] ?? "")?.host == host
      }, "Missing attributed CSP denial: " + host)
    }
    XCTAssertTrue(violations.contains { $0["directive"] == "worker-src" && ($0["uri"] == "blob" || $0["uri"]?.hasPrefix("blob:") == true) })
    try await p.barrier()
  }

  func testGuestTopNavigationIsDeniedWithoutChangingMainURL() async throws {
    let p=try await makeReady()
    let before=p.webView?.url
    let value=try await p.json("try {top.location.href='https://example.invalid/top';return {denied:false};}catch(e){return {denied:true,name:e.name};}",frame:p.guest)
    XCTAssertEqual(value["denied"] as? Bool,true)
    try await p.barrier()
    XCTAssertEqual(p.webView?.url,before)
  }

  func testGuestSelfNavigationRevokesTheNativeGeneration() async throws {
    let p=try await makeReady()
    let view=try XCTUnwrap(p.webView)
    _ = try? await p.json("location.href='about:blank';return {attempted:true};",frame:p.guest)
    try await p.until("native revokes child navigation") { p.events.contains { $0["code"] as? String == "frame-navigation" } }
    XCTAssertEqual(p.events.count,2)
    XCTAssertNil(view.superview)
    XCTAssertNil(view.navigationDelegate)
    XCTAssertTrue(p.host.subviews.isEmpty)
  }

  func testActualCoreUnmountRevokesAndNeverReusesGeneration() async throws {
    let p=try await makeReady()
    let view=try XCTUnwrap(p.webView)
    p.host.removeFromSuperview()
    XCTAssertNil(view.superview)
    XCTAssertNil(view.navigationDelegate)
    XCTAssertNil(view.uiDelegate)
    XCTAssertTrue(view.configuration.userContentController.userScripts.isEmpty)
    p.host.startSession("attempted-reuse")
    XCTAssertTrue(p.host.subviews.isEmpty)
    XCTAssertEqual(p.events.count,1)
    let result = try await p.json("return {handler:typeof window.webkit?.messageHandlers?.HypergolicDiagnostic};",frame:p.main,world:p.diagnosticWorld)
    XCTAssertEqual(result["handler"] as? String,"undefined")
  }

  func testInvalidAndReusedSessionFailClosed() async throws {
    let p=Probe();probe=p
    try p.start("bad<session>")
    XCTAssertNil(p.webView)
    XCTAssertEqual(p.events.count,1)
    XCTAssertEqual(p.events.first?["code"] as? String,"invalid-session")
    try p.attach(to:self,name:name + "-invalid")
    p.close()
    let other=try await makeReady()
    let view=try XCTUnwrap(other.webView)
    other.host.startSession("different-session")
    XCTAssertEqual(other.events.last?["code"] as? String,"session-reuse-blocked")
    XCTAssertNil(view.superview)
  }
}
