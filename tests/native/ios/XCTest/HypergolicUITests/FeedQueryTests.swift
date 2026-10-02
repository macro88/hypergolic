import XCTest

final class FeedQueryTests: XCTestCase {
  func testQuery() throws {
    continueAfterFailure = false
    let environment = ProcessInfo.processInfo.environment
    guard let id = environment["HG_QUERY_EVENT_ID"], id.count == 64 else { XCTFail("Missing independently verified query sample"); return }
    let app = XCUIApplication(bundleIdentifier: "org.nostrocket.hypergolic.feedqueryfixture")
    app.terminate(); app.launch()
    let ready = app.staticTexts["Native host connected"]
    XCTAssertTrue(ready.waitForExistence(timeout: 30), app.debugDescription)
    let field = app.textViews.firstMatch
    XCTAssertTrue(field.waitForExistence(timeout: 10), app.debugDescription)
    func input(_ value: String) {
      field.tap()
      field.press(forDuration: 1.2)
      let selectAll = app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", "Select All")).firstMatch
      XCTAssertTrue(selectAll.waitForExistence(timeout: 3), app.debugDescription)
      selectAll.tap()
      field.typeText(value)
      XCTAssertEqual(field.value as? String, value, "Native input did not replace exact query filters")
      let done = app.buttons["Done"]
      if done.exists { done.tap() }
    }
    func capture(_ name: String) {
      let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
    }
    input("[{\"ids\":[\"" + id + "\"],\"limit\":1}]")
    app.buttons["Query notes"].tap()
    XCTAssertTrue(app.staticTexts["Received 1 signed note."].waitForExistence(timeout: 25), app.debugDescription)
    XCTAssertTrue(app.staticTexts[id].exists, app.debugDescription)
    capture("query-exact-event")
    app.buttons["Query empty sample"].tap()
    XCTAssertTrue(app.staticTexts["Query completed. No matching notes."].waitForExistence(timeout: 25), app.debugDescription)
    capture("query-empty")
    input("[{\"authors\":[\"partial\"]}]")
    app.buttons["Query notes"].tap()
    XCTAssertTrue(app.staticTexts["Query failed: invalid relay query"].waitForExistence(timeout: 10), app.debugDescription)
    capture("query-invalid-denial")
    app.buttons["Close Feed Lab"].tap()
    XCTAssertTrue(app.buttons["Open Feed Lab"].waitForExistence(timeout: 10))
    XCTAssertFalse(field.exists)
    app.buttons["Open Feed Lab"].tap()
    XCTAssertTrue(ready.waitForExistence(timeout: 20), app.debugDescription)
    app.buttons["Query empty sample"].tap()
    XCTAssertTrue(app.staticTexts["Query completed. No matching notes."].waitForExistence(timeout: 25), app.debugDescription)
    capture("query-reopened")
    app.terminate(); app.launch()
    XCTAssertTrue(ready.waitForExistence(timeout: 20), app.debugDescription)
    app.buttons["Query empty sample"].tap()
    XCTAssertTrue(app.staticTexts["Query completed. No matching notes."].waitForExistence(timeout: 25), app.debugDescription)
    capture("query-cold-restart")
    let report: [String: Any] = ["kind":"hypergolic-ios-relay-query-v1", "eventId":id,
      "checks":["exact-signed-event","empty-eose","invalid-filter-denial","close-reopen","cold-restart"],
      "allChecksPassed":true,"scope":"Actual standalone Simulator SDK/native/WSS journey with independently verified public relay event; no physical identity or published-napplets claim."]
    let data = try JSONSerialization.data(withJSONObject: report, options: [.sortedKeys])
    let attachment = XCTAttachment(data: data, uniformTypeIdentifier: "public.json");attachment.name="feed-query-report";attachment.lifetime = .keepAlways;add(attachment)
  }
  func testQueryFaultMatrix() throws {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "org.nostrocket.hypergolic.feedqueryfixture")
    app.terminate(); app.launch()
    XCTAssertTrue(app.buttons["Controlled query faults"].waitForExistence(timeout: 30))
    app.buttons["Controlled query faults"].tap()
    let cases = ["signed", "empty", "bad-signature", "wrong-filter", "missing-eose", "event-flood", "frame-flood", "timeout", "close", "owner-epoch"]
    for name in cases {
      XCTAssertTrue(app.staticTexts["Controlled query · " + name].waitForExistence(timeout: 20), app.debugDescription)
      XCTAssertTrue(app.staticTexts["Ready to query."].waitForExistence(timeout: 20), app.debugDescription)
      app.buttons["Query notes"].tap()
      let delayed = ["timeout", "close", "owner-epoch"].contains(name)
      let revoked = ["close", "owner-epoch"].contains(name)
      let receipt = "PASS " + name + ": calls 1, cancel " + (delayed ? "1" : "0") + ", late " + (delayed ? "1" : "0") + ", replies " + (revoked ? "0" : "1") + ", denied " + (revoked ? "1" : "0")
      XCTAssertTrue(app.staticTexts[receipt].waitForExistence(timeout: 10), app.debugDescription)
      if name == "signed" {
        XCTAssertTrue(app.staticTexts["Received 1 signed note."].exists, app.debugDescription)
        XCTAssertTrue(app.staticTexts["Native query acceptance fixture"].exists, app.debugDescription)
      } else if name == "empty" {
        XCTAssertTrue(app.staticTexts["Query completed. No matching notes."].exists, app.debugDescription)
      } else if !revoked {
        XCTAssertTrue(app.staticTexts["Query failed: relay query failed"].exists, app.debugDescription)
        XCTAssertFalse(app.staticTexts["Native query acceptance fixture"].exists)
      }
      if name == "close" { XCTAssertFalse(app.webViews.firstMatch.exists) }
      if name == "owner-epoch" {
        XCTAssertTrue(app.staticTexts["Query failed: operation failed"].exists, app.debugDescription)
        XCTAssertFalse(app.staticTexts["Native query acceptance fixture"].exists)
      }
      let image = XCTAttachment(screenshot: app.screenshot()); image.name = "query-matrix-" + name; image.lifetime = .keepAlways; add(image)
      if name != cases.last { app.buttons["Next query case"].tap() }
    }
    let report: [String: Any] = ["kind":"hypergolic-ios-query-fault-matrix-v1", "checks":cases, "allChecksPassed":true,
      "scope":"Real SDK/Kehto/native leases/broker/validators; diagnostic frames, short deadline and owner-epoch revocation, not full identity UI or WSS faults."]
    let data = try JSONSerialization.data(withJSONObject: report, options: [.sortedKeys])
    let attachment = XCTAttachment(data: data, uniformTypeIdentifier: "public.json");attachment.name="feed-query-matrix-report";attachment.lifetime = .keepAlways;add(attachment)
  }

}

/// Public profile tracer, independent of Feed Lab query acceptance.
final class IdentityProfileTests: XCTestCase {
  func testProfile() throws {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "org.nostrocket.hypergolic.identityfixture")
    let raw = ProcessInfo.processInfo.environment["HG_IDENTITY_PROFILE"] ?? ""
    let expected = try JSONSerialization.jsonObject(with: Data(raw.utf8)) as! NSDictionary
    func wait(_ text: String) {XCTAssertTrue(app.staticTexts[text].waitForExistence(timeout: 30), app.debugDescription)}
    func button(_ text: String) {let element = app.buttons[text]; XCTAssertTrue(element.waitForExistence(timeout: 15)); XCTAssertTrue(element.isEnabled); element.tap()}
    func capture(_ name: String) {let shot = XCTAttachment(screenshot: app.screenshot()); shot.name = name; shot.lifetime = .keepAlways; add(shot)
      let tree = XCTAttachment(string: app.debugDescription); tree.name = name + "-hierarchy"; tree.lifetime = .keepAlways; add(tree)}
    func receipt(_ attempts: Int, _ frames: Int, _ reply: String, _ cancelled: Int = 0) {wait("Profile receipt: attempts \(attempts); frames \(frames); cancelled \(cancelled); reply \(reply)")}
    func profile(_ value: NSDictionary?) throws {
      let predicate = NSPredicate(format: "label BEGINSWITH '{' OR label == 'null'")
      let candidates = app.staticTexts.matching(predicate)
      XCTAssertTrue(candidates.firstMatch.waitForExistence(timeout: 15), app.debugDescription)
      var found = false
      for element in candidates.allElementsBoundByIndex {
        guard let json = try? JSONSerialization.jsonObject(with: Data(element.label.utf8), options: .fragmentsAllowed) else {continue}
        if let value {if let actual = json as? NSDictionary, actual == value {found = true; print("IDENTITY_SDK_PROFILE:" + element.label)}}
        else if json is NSNull {found = true}
      }
      XCTAssertTrue(found, "SDK profile differs from independent signed source: " + app.debugDescription)
    }
    func launch() {app.terminate(); app.launch(); wait("Native profile host connected"); wait("Identity connected")}
    func next(_ name: String) {button("Next profile case"); wait("Profile case: " + name); wait("Identity connected")}
    func passed(_ name: String) {capture(name); print("IDENTITY_CHECK:" + name)}
    launch(); button("Read profile"); wait("Profile read complete."); try profile(expected); receipt(1, 0, "success"); passed("actual-wss-profile")
    launch(); button("Read profile"); wait("Profile read complete."); try profile(expected); receipt(0, 0, "success"); passed("cold-sqlite-cache")
    button("Close Profile Lab"); XCTAssertFalse(app.webViews.firstMatch.exists); button("Open Profile Lab"); wait("Identity connected"); button("Read profile"); wait("Profile read complete."); try profile(expected); receipt(0, 0, "success"); passed("close-reopen-cache")
    next("offline"); button("Read profile"); wait("Profile read complete."); try profile(expected); receipt(1, 0, "success"); passed("older-cache-controlled-offline")
    next("empty"); button("Read profile"); wait("No public profile found."); try profile(nil); receipt(1, 1, "success"); passed("controlled-empty-eose")
    next("uncached"); button("Read profile"); wait("Profile read failed: identity data unavailable"); receipt(1, 0, "error"); passed("uncached-other-user-offline-error")
    next("revoked"); button("Read profile"); receipt(1, 1, "denied", 1); XCTAssertFalse(app.webViews.firstMatch.exists); passed("pending-owner-native-revocation")
    next("owner-epoch"); button("Read profile"); receipt(1, 1, "denied", 1); wait("Profile read failed: identity request denied"); XCTAssertFalse(app.staticTexts["Profile read complete."].exists); passed("pending-trusted-identity-epoch-revocation")
    next("tampered"); button("Read profile"); wait("Profile read failed: invalid identity data"); receipt(0, 0, "error"); passed("native-disk-signature-reverification")
    app.terminate()
  }
}

final class IdentityListsTests: XCTestCase {
 func testLists() throws {
  continueAfterFailure = false
  let app = XCUIApplication(bundleIdentifier: "org.nostrocket.hypergolic.identitylistsfixture")
  let raw = ProcessInfo.processInfo.environment["HG_IDENTITY_LISTS"] ?? ""
  let expected = try JSONSerialization.jsonObject(with: Data(raw.utf8)) as! NSDictionary
  func wait(_ text: String) {XCTAssertTrue(app.staticTexts[text].waitForExistence(timeout: 25), app.debugDescription)}
  func button(_ text: String) {let control = app.buttons[text]; XCTAssertTrue(control.waitForExistence(timeout: 15), app.debugDescription); XCTAssertTrue(control.isHittable, app.debugDescription); control.tap()}
  var pendingCount = 0
  func count() -> Int {let text = app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH 'Identity request count: '")).firstMatch; XCTAssertTrue(text.waitForExistence(timeout: 10)); return Int(text.label.replacingOccurrences(of: "Identity request count: ", with: ""))!}
  func delivered() {wait("Identity request count: \(pendingCount + 1)")}
  func guest(_ text: String) {
   if ["Read relay preferences", "Read follows", "Read mutes", "Read accepted badges", "Read selected list", "Check blocks support", "Check zaps support"].contains(text) {pendingCount = count()}
   XCTAssertTrue(app.webViews.firstMatch.waitForExistence(timeout: 10), app.debugDescription)
   let control = app.buttons[text]
   for _ in 0..<12 {if control.exists && control.isHittable {control.tap(); return}; app.webViews.firstMatch.swipeUp()}
   for _ in 0..<12 {if control.exists && control.isHittable {control.tap(); return}; app.webViews.firstMatch.swipeDown()}
   XCTFail("Guest control not exposed: " + text + app.debugDescription)
  }
  func capture(_ name: String) {let shot = XCTAttachment(screenshot: app.screenshot()); shot.name = name; shot.lifetime = .keepAlways; add(shot)
   let tree = XCTAttachment(string: app.debugDescription); tree.name = name + "-hierarchy"; tree.lifetime = .keepAlways; add(tree)}
  func passed(_ name: String) {capture(name); print("IDENTITY_LIST_CHECK:" + name); fflush(stdout)}
  func value(_ key: String) throws {
   let wanted = expected[key]!
   var found = false
   for _ in 0..<8 {
    for element in app.staticTexts.allElementsBoundByIndex {
     guard let data = element.label.data(using: .utf8), let json = try? JSONSerialization.jsonObject(with: data) as? NSObject else {continue}
     if json.isEqual(wanted) {found = true; print("IDENTITY_LIST_SDK:" + key + ":" + element.label); fflush(stdout); break}
    }
    if found {break}; app.webViews.firstMatch.swipeUp()
   }
   XCTAssertTrue(found, "Original SDK value differs from signed fixture: " + app.debugDescription); delivered()
  }
  func success(_ label: String, _ kind: String, _ key: String) throws {guest(label); wait("Public " + kind + " read complete."); try value(key)}
  func error(_ kind: String, _ message: String) {wait("Public " + kind + " read failed: " + message); delivered()}
  func review(_ allow: Bool) {wait("Allow public list access?"); wait("Reviewed bundled fixture"); wait("Publisher namespace"); capture("trusted-review"); button(allow ? "Allow public lists" : "Decline public lists")}
  func launch() {app.terminate(); app.launch(); wait("Native public lists connected"); wait("Identity connected")}
  func next(_ name: String) {button("Next public lists case"); wait("Public lists case: " + name); wait("Native public lists connected"); wait("Identity connected")}
  func category(_ name: String) {
   let field = app.descendants(matching: .any).matching(NSPredicate(format: "identifier == 'list-type' OR label == 'Global list category' OR value == 'Bookmarks' OR value == 'Pins' OR value == 'Interests'")).firstMatch
   for _ in 0..<8 {if field.exists && field.isHittable {break}; app.webViews.firstMatch.swipeUp()}
   XCTAssertTrue(field.exists, app.debugDescription); field.tap()
   let wheel = app.pickerWheels.firstMatch
   if wheel.waitForExistence(timeout: 3) {wheel.adjust(toPickerWheelValue: name); let done = app.buttons["Done"]; if done.exists {done.tap()}}
   else {let item = app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", name)).firstMatch; XCTAssertTrue(item.waitForExistence(timeout: 5), app.debugDescription); item.tap()}
  }
  launch()
  try success("Read relay preferences", "relays", "relays"); passed("signed-relay-preferences-data-only")
  try success("Read follows", "follows", "follows"); passed("signed-follows")
  guest("Read mutes"); review(false); error("mutes", "identity request denied"); passed("trusted-decline-no-list-data")
  guest("Read mutes"); review(true); wait("Public mutes read complete."); try value("mutes"); passed("trusted-approve-public-mutes")
  try success("Read selected list", "list", "bookmarks"); passed("global-bookmarks-public-references")
  category("Pins"); try success("Read selected list", "list", "pins"); passed("global-pins-exact-mapping")
  category("Interests"); try success("Read selected list", "list", "interests"); passed("global-interests-literal")
  category("Unsupported category"); guest("Read selected list"); error("list", "identity list type unsupported"); passed("unknown-category-explicit-error")
  try success("Read accepted badges", "badges", "badges"); passed("accepted-badge-exact-signed-join")
  guest("Check blocks support"); error("blocked", "identity block list unsupported"); guest("Check zaps support"); error("zaps", "identity zaps deferred"); passed("unsupported-blocks-deferred-zaps")
  launch(); try success("Read mutes", "mutes", "mutes"); wait("Identity receipt: identity.getMutes; calls 0; frames 0; cancelled 0; reply success"); passed("cold-native-permission-and-cache")
  button("Public list Settings"); wait("Public list permissions"); button("Revoke public lists for state-lab"); wait("No remembered public list access."); capture("settings-revoked"); button("Close public list Settings")
  guest("Read mutes"); review(false); error("mutes", "identity request denied"); passed("settings-revocation-blocks-fresh-cache")
  guest("Read mutes"); review(true); wait("Public mutes read complete."); try value("mutes")
  next("offline"); try success("Read mutes", "mutes", "mutes"); wait("Identity receipt: identity.getMutes; calls 1; frames 0; cancelled 0; reply success"); passed("older-validated-list-controlled-offline")
  next("other-app"); guest("Read mutes"); review(false); error("mutes", "identity request denied"); passed("permission-app-isolation")
  next("other-publisher"); guest("Read mutes"); review(false); error("mutes", "identity request denied"); passed("permission-publisher-isolation")
  next("other-user"); guest("Read mutes"); review(false); error("mutes", "identity request denied"); passed("permission-account-isolation")
  next("bad-badge"); guest("Read accepted badges"); error("badges", "accepted badge evidence unavailable"); passed("invalid-accepted-badge-no-cache-fallback")
  next("bad-signature"); guest("Read accepted badges"); error("badges", "identity data unavailable"); passed("invalid-native-frames-no-cache-fallback")
  next("queued-regrant"); guest("Read mutes"); review(true); wait("Queued native delivery after revoke and reapproval"); error("mutes", "identity request denied"); passed("native-queued-revoke-regrant-denial")
  try success("Read mutes", "mutes", "mutes"); passed("new-read-after-reapproval")
  next("owner-epoch"); guest("Read follows"); error("follows", "identity request denied"); passed("pending-owner-epoch-denial")
  next("background"); guest("Read follows"); wait("Background identity query pending"); XCUIDevice.shared.press(.home); Thread.sleep(forTimeInterval: 2.5); app.activate(); error("follows", "identity request denied"); passed("actual-background-pending-denial")
  app.terminate()
 }
}

final class IdentityPublishedTests: XCTestCase {
 func testAdmission() throws {
  continueAfterFailure=false
  let app=XCUIApplication(bundleIdentifier:"org.nostrocket.hypergolic.identitypublishedfixture")
  let raw=ProcessInfo.processInfo.environment["HG_IDENTITY_FIXTURE"] ?? ""
  let fixture=try JSONSerialization.jsonObject(with:Data(raw.utf8)) as! NSDictionary
  let expected=fixture["expected"] as! NSDictionary,user=fixture["user"] as! String,other=fixture["other"] as! String
  func wait(_ value:String){XCTAssertTrue(app.staticTexts[value].waitForExistence(timeout:25),app.debugDescription)}
  func capture(_ name:String){let shot=XCTAttachment(screenshot:app.screenshot());shot.name=name;shot.lifetime = .keepAlways;add(shot);let tree=XCTAttachment(string:app.debugDescription);tree.name=name+"-hierarchy";tree.lifetime = .keepAlways;add(tree)}
  func passed(_ name:String){capture(name);print("IDENTITY_PUBLISHED_CHECK:"+name);fflush(stdout)}
  func button(_ name:String){let control=app.buttons[name];XCTAssertTrue(control.waitForExistence(timeout:15),app.debugDescription);XCTAssertTrue(control.isHittable,app.debugDescription);control.tap()}
  func settings(_ element:XCUIElement){
   for _ in 0..<20 {if element.isHittable{return};let scroll=app.scrollViews.firstMatch
    if element.exists && element.frame.midY < scroll.frame.minY {scroll.swipeDown()}else{scroll.swipeUp()}}
   XCTFail("Settings control unavailable: "+app.debugDescription)
  }
  func settingsButton(_ name:String){let control=app.buttons[name];settings(control);control.tap()}
  func stats()->[Int]{
   let text=app.staticTexts.matching(NSPredicate(format:"label BEGINSWITH 'Identity request count: '")).firstMatch
   XCTAssertTrue(text.waitForExistence(timeout:15),app.debugDescription)
   return text.label.split(separator:";").map{Int($0.split(separator:" ").last!)!}
  }
  var baseline=[Int]()
  func host()->XCUIElement{XCTAssertTrue(app.webViews.firstMatch.waitForExistence(timeout:15),app.debugDescription)
   let views=app.webViews.allElementsBoundByIndex.filter{$0.frame.intersects(app.frame)&&$0.frame.height>1&&$0.frame.width>1}
   XCTAssertFalse(views.isEmpty,app.debugDescription)
   // WK exposes three nested WebView nodes for one native host. Distinct frames must still agree.
   XCTAssertTrue(views.allSatisfy{$0.frame==views[0].frame},app.debugDescription);return views[0]
  }
  func guest(_ name:String){baseline=stats();let view=host(),control=view.buttons[name]
   for direction in [true,false] {for _ in 0..<16 {if control.isHittable {control.tap();return}
    let high=view.coordinate(withNormalizedOffset:CGVector(dx:0.5,dy:0.15)),low=view.coordinate(withNormalizedOffset:CGVector(dx:0.5,dy:0.5))
    (direction ? low:high).press(forDuration:0.05,thenDragTo:direction ? high:low)}}
   XCTFail("Guest control unavailable: "+app.debugDescription)
  }
  func delivered(){let wanted=baseline[0]+1
   let predicate=NSPredicate{_,_ in self.appCount(app)==wanted}
   XCTAssertEqual(XCTWaiter.wait(for:[XCTNSPredicateExpectation(predicate:predicate,object:app)],timeout:15),.completed,app.debugDescription)
  }
  func value(_ key:String,_ wanted:NSObject?=nil)throws {
   let target=wanted ?? expected[key] as! NSObject
   var found=false
   for _ in 0..<16 {for element in host().staticTexts.allElementsBoundByIndex {
    guard let data=element.label.data(using:.utf8),let json=try? JSONSerialization.jsonObject(with:data) as? NSObject else{continue}
    if json.isEqual(target){found=true;print("IDENTITY_PUBLISHED_SDK:"+key+":"+element.label);fflush(stdout);break}}
    if found{break};host().swipeUp()}
   XCTAssertTrue(found,app.debugDescription);delivered()
  }
  func success(_ name:String,_ kind:String,_ key:String,_ wanted:NSObject?=nil)throws{guest(name);wait("Public "+kind+" read complete.");try value(key,wanted)}
  func review(_ allow:Bool){wait("Allow public list access?");wait("Publisher");XCTAssertFalse(app.staticTexts["Reviewed bundled fixture"].exists);capture("separate-list-review");button(allow ? "Allow public lists":"Decline public lists")}
  func error(){wait("Public mutes read failed: identity request denied");delivered()}
  func openSigned(_ role:String,_ reject:Bool=false){
   let address=app.staticTexts["signed-"+role+"-address"];XCTAssertTrue(address.waitForExistence(timeout:30),app.debugDescription);let link=address.label;XCTAssertTrue(link.hasPrefix("naddr1"))
   button("shell-settings");let input=app.textFields["settings-napplet-address"];settings(input);input.tap();input.typeText(link+"\n")
   let consent=app.staticTexts["Allow this napplet?"].firstMatch;XCTAssertTrue(consent.waitForExistence(timeout:30),app.debugDescription);settings(consent)
   wait("Requested access: identity, "+(role=="state" ? "storage":"relay"));capture(role+"-domain-consent")
   if reject{settingsButton("settings-napplet-reject");settingsButton("settings-open-napplet");XCTAssertTrue(consent.waitForExistence(timeout:30),app.debugDescription)}
   settingsButton("settings-napplet-approve");wait(role=="state" ? "Identity connected":"Ready to query.");passed("signed-"+role+"-normal-admission");if reject {XCTAssertEqual(Array(stats()[1...2]),[0,0]);passed("domain-consent-decline-no-identity-query")}
  }
  app.terminate();app.launch();openSigned("state",true)
  try success("Read follows","follows","follows");passed("signed-state-selected-follows")
  guest("Read mutes");review(false);error();passed("separate-list-decline")
  guest("Read mutes");review(true);wait("Public mutes read complete.");try value("mutes");passed("separate-list-approval-exact-source")
  try success("Read selected list","list","bookmarks");passed("remembered-same-app-list-access")
  button("Use controlled offline cache");app.terminate();app.launch();wait("Identity connected");XCTAssertEqual(Array(stats()[1...2]),[0,0])
  try success("Read mutes","mutes","mutes");XCTAssertEqual(Array(stats()[1...3]),[1,0,0]);passed("cold-signed-grant-and-older-offline-cache")
  button("Use online diagnostic frames");try success("Read mutes","mutes","mutes");XCTAssertEqual(stats()[2],1);passed("stale-cache-bounded-refresh")
  button("shell-settings");settingsButton("Revoke public lists for signed-identity-state-lab");settings(app.staticTexts["No remembered public list access."].firstMatch);capture("normal-settings-revocation");button("settings-done")
  guest("Read mutes");review(false);error();passed("normal-settings-revoke-blocks-cache")
  guest("Read mutes");review(true);wait("Public mutes read complete.");try value("mutes")
  button("shell-settings");settingsButton("identity-select-"+other);settingsButton("identity-change-confirm");wait("Open this napplet?");wait("Access: identity, storage");capture("new-user-domain-consent");button("Allow and open");wait("Identity connected")
  guest("Read mutes");review(false);error();passed("normal-confirmed-identity-isolates-permission")
  try success("Read follows","follows","other-follows",NSArray());passed("normal-confirmed-identity-isolates-source")
  button("shell-settings");settingsButton("identity-select-"+user);settingsButton("identity-change-confirm");wait("Identity connected")
  try success("Read mutes","mutes","mutes");passed("return-to-identity-restores-own-permission")
  openSigned("feed");let before=stats();guest("Read follows");wait("Follows read complete.");try value("follows");XCTAssertEqual(Array(stats()[1...2]),[before[1]+1,before[2]+1]);passed("signed-feed-explicit-follows-no-routing-change")
  app.terminate()
 }
 private func appCount(_ app:XCUIApplication)->Int{let text=app.staticTexts.matching(NSPredicate(format:"label BEGINSWITH 'Identity request count: '")).firstMatch;guard text.exists else{return -1};return Int(text.label.split(separator:";")[0].split(separator:" ").last!) ?? -1}
}
