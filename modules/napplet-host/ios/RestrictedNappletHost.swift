import CryptoKit
import UIKit
import WebKit

/// One native generation, one bundled host, one opaque napplet frame.
/// The iOS 18.4 deployment candidate enables public file-picker denial.
@MainActor
final class RestrictedNappletHost: UIView, WKNavigationDelegate, WKUIDelegate {
  var onEvent: (@MainActor ([String: Any]) -> Void)?
  // Native-only observation, absent in production. Never exposed through Expo.
  private let onWebViewCreated: (@MainActor (WKWebView) -> Void)?
  private let generation = UUID().uuidString.lowercased()
  private let bridgeWorld = WKContentWorld.world(name: "org.nostrocket.hypergolic.diagnostics.v1")
  private let bridgeName = "HypergolicDiagnostic"
  private var sessionId: String?
  private var expectedURL: URL?
  private var webView: WKWebView?
  private var receiver: DiagnosticReceiver?
  private var deadline: DispatchWorkItem?
  private var live = false
  private var ready = false
  private var loaded = false
  private var initialNavigationAllowed = false
  private var disposed = false
  private var active = true

  init(onWebViewCreated: (@MainActor (WKWebView) -> Void)? = nil) {
    self.onWebViewCreated = onWebViewCreated
    super.init(frame: .zero)
    clipsToBounds = true
    backgroundColor = UIColor(red: 18/255, green: 14/255, blue: 10/255, alpha: 1)
  }

  @available(*, unavailable)
  required init?(coder: NSCoder) { fatalError("Use init(onWebViewCreated:)") }

  override func layoutSubviews() {
    super.layoutSubviews()
    webView?.frame = bounds
  }

  override func willMove(toSuperview newSuperview: UIView?) {
    // Loaded napplets must stay mounted when merely backgrounded/overviewed.
    // Actual unmount is destruction; this view is never recycled as a new session.
    if superview != nil && newSuperview == nil { destroySession() }
    super.willMove(toSuperview: newSuperview)
  }

  func setActive(_ isActive: Bool) {
    active = isActive
    // Dismiss only this retained view's editor. Do not reload, inject script,
    // or send a global resign-first-responder action affecting another napplet.
    if !isActive { webView?.endEditing(true) }
  }

  func startSession(_ id: String) {
    guard !disposed else { return }
    if sessionId == id { return }
    guard sessionId == nil else { fail("session-reuse-blocked"); return }
    sessionId = id
    guard id.range(of: "^[A-Za-z0-9_-]{1,80}$", options: .regularExpression) != nil else {
      fail("invalid-session"); return
    }
    do {
      let assets = try verifiedAssets()
      var components = URLComponents(url: assets.index, resolvingAgainstBaseURL: false)!
      components.queryItems = [URLQueryItem(name: "sessionId", value: generation)]
      guard let url = components.url else { fail("invalid-session"); return }
      expectedURL = url
      live = true
      let timeout = DispatchWorkItem { [weak self] in
        guard let self, self.live, !self.ready else { return }
        self.fail("readiness-timeout")
      }
      deadline = timeout
      DispatchQueue.main.asyncAfter(deadline: .now() + 15, execute: timeout)
      let rules = try resourceRules(index: url, script: assets.script)
      let ruleIdentifier = "hypergolic-host-v1-" + generation
      WKContentRuleListStore.default().compileContentRuleList(
        forIdentifier: ruleIdentifier,
        encodedContentRuleList: rules
      ) { [weak self] list, error in
        guard let self, !self.disposed, self.live else {
          WKContentRuleListStore.default().removeContentRuleList(forIdentifier: ruleIdentifier) { _ in }
          return
        }
        guard error == nil, let list else { self.fail("content-rules-unavailable"); return }
        self.mount(url: url, readAccess: assets.directory, rules: list)
      }
    } catch {
      fail("bundled-runtime-integrity")
    }
  }

  private func verifiedAssets() throws -> (index: URL, script: URL, directory: URL) {
    enum AssetError: Error { case missing, mismatch }
    let moduleBundle = Bundle(for: RestrictedNappletHost.self)
    guard let resourceURL = moduleBundle.url(forResource: "HypergolicNappletHostAssets", withExtension: "bundle")
      ?? Bundle.main.url(forResource: "HypergolicNappletHostAssets", withExtension: "bundle"),
      let bundle = Bundle(url: resourceURL),
      let index = bundle.url(forResource: "index", withExtension: "html"),
      let script = bundle.url(forResource: "host", withExtension: "js"),
      let manifestURL = bundle.url(forResource: "assets-manifest", withExtension: "json"),
      let manifest = try JSONSerialization.jsonObject(with: Data(contentsOf: manifestURL)) as? [String: Any],
      let assets = manifest["assets"] as? [String: [String: Any]],
      Set(assets.keys) == Set(["index.html", "host.js"]) else { throw AssetError.missing }
    for (name, url) in [("index.html", index), ("host.js", script)] {
      let data = try Data(contentsOf: url)
      let digest = SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined()
      guard let record = assets[name], record["sha256"] as? String == digest,
        (record["bytes"] as? NSNumber)?.intValue == data.count else { throw AssetError.mismatch }
    }
    let directory = index.deletingLastPathComponent().resolvingSymlinksInPath()
    guard script.deletingLastPathComponent().resolvingSymlinksInPath() == directory else { throw AssetError.mismatch }
    return (index, script, directory)
  }

  private func resourceRules(index: URL, script: URL) throws -> String {
    func exact(_ url: URL) -> String { "^" + NSRegularExpression.escapedPattern(for: url.absoluteString) + "$" }
    let rules: [[String: Any]] = [
      ["trigger": ["url-filter": ".*"], "action": ["type": "block"]],
      ["trigger": ["url-filter": exact(index), "url-filter-is-case-sensitive": true, "resource-type": ["document"]], "action": ["type": "ignore-previous-rules"]],
      ["trigger": ["url-filter": exact(script), "url-filter-is-case-sensitive": true, "resource-type": ["script"]], "action": ["type": "ignore-previous-rules"]],
      ["trigger": ["url-filter": "^about:blank$", "resource-type": ["document"]], "action": ["type": "ignore-previous-rules"]],
      ["trigger": ["url-filter": "^about:srcdoc$", "resource-type": ["document"]], "action": ["type": "ignore-previous-rules"]],
      ["trigger": ["url-filter": "^data:", "resource-type": ["image"]], "action": ["type": "ignore-previous-rules"]],
      ["trigger": ["url-filter": "^blob:", "resource-type": ["image"]], "action": ["type": "ignore-previous-rules"]],
      ["trigger": ["url-filter": ".*"], "action": ["type": "block-cookies"]]
    ]
    return String(decoding: try JSONSerialization.data(withJSONObject: rules), as: UTF8.self)
  }

  private func mount(url: URL, readAccess: URL, rules: WKContentRuleList) {
    guard live, !disposed, webView == nil else { return }
    let configuration = WKWebViewConfiguration()
    configuration.websiteDataStore = .nonPersistent()
    configuration.preferences.javaScriptCanOpenWindowsAutomatically = false
    configuration.defaultWebpagePreferences.allowsContentJavaScript = true
    configuration.mediaTypesRequiringUserActionForPlayback = .all
    configuration.allowsInlineMediaPlayback = false
    configuration.allowsAirPlayForMediaPlayback = false
    configuration.allowsPictureInPictureMediaPlayback = false
    configuration.dataDetectorTypes = []
    let controller = configuration.userContentController
    controller.add(rules)
    let receiver = DiagnosticReceiver(owner: self)
    self.receiver = receiver
    controller.addScriptMessageHandler(receiver, contentWorld: bridgeWorld, name: bridgeName)
    controller.addUserScript(WKUserScript(source: isolatedDiagnosticSource(url: url),
      injectionTime: .atDocumentStart, forMainFrameOnly: true, in: bridgeWorld))
    controller.addUserScript(WKUserScript(source: pageDiagnosticSource(url: url),
      injectionTime: .atDocumentStart, forMainFrameOnly: true, in: .page))
    let view = WKWebView(frame: bounds, configuration: configuration)
    view.navigationDelegate = self
    view.uiDelegate = self
    view.isOpaque = false
    view.backgroundColor = backgroundColor
    view.scrollView.backgroundColor = backgroundColor
    view.allowsBackForwardNavigationGestures = false
    view.allowsLinkPreview = false
    #if DEBUG
    view.isInspectable = true
    #endif
    webView = view
    addSubview(view)
    if !active { view.endEditing(true) }
    onWebViewCreated?(view)
    view.loadFileURL(url, allowingReadAccessTo: readAccess)
  }

  private func jsString(_ text: String) -> String {
    // JSON literal, never source interpolation of a raw path or user value.
    let data = try! JSONSerialization.data(withJSONObject: [text])
    let array = String(decoding: data, as: UTF8.self)
    return String(array.dropFirst().dropLast())
  }

  private func isolatedDiagnosticSource(url: URL) -> String {
    """
    (() => {
      'use strict';
      if (window !== window.top || location.href !== \(jsString(url.absoluteString))) return;
      const native = window.webkit.messageHandlers.HypergolicDiagnostic;
      window.addEventListener('message', event => {
        if (!event.isTrusted || event.source !== window || location.href !== \(jsString(url.absoluteString))) return;
        const value = event.data;
        if (!value || typeof value !== 'object' || Array.isArray(value) ||
            Object.keys(value).length !== 2 || value.type !== 'hypergolic.native-diagnostic' ||
            typeof value.message !== 'string' || new TextEncoder().encode(value.message).length > 2048) return;
        void native.postMessage(value.message).catch(() => {});
      });
    })();
    """
  }

  private func pageDiagnosticSource(url: URL) -> String {
    """
    (() => {
      'use strict';
      if (window !== window.top || location.href !== \(jsString(url.absoluteString))) return;
      const post = window.postMessage.bind(window);
      const adapter = Object.freeze({postMessage(message) {
        if (typeof message !== 'string' || new TextEncoder().encode(message).length > 2048) return;
        post({type:'hypergolic.native-diagnostic',message}, '*');
      }});
      Object.defineProperty(window, 'HypergolicHost', {value:adapter,writable:false,configurable:false});
      if (!window.isSecureContext || !window.crypto || typeof crypto.getRandomValues !== 'function' ||
          !crypto.subtle || typeof crypto.subtle.digest !== 'function') {
        adapter.postMessage(JSON.stringify({type:'error',sessionId:\(jsString(generation)),code:'webcrypto-unavailable'}));
      }
    })();
    """
  }

  fileprivate func receive(_ message: WKScriptMessage, reply: @escaping @MainActor @Sendable (Any?, String?) -> Void) {
    guard live, !disposed, message.name == bridgeName, message.world.name == bridgeWorld.name,
      message.webView === webView, message.frameInfo.webView === webView,
      message.frameInfo.isMainFrame, let expectedURL,
      message.frameInfo.request.url?.absoluteString == expectedURL.absoluteString,
      webView?.url?.absoluteString == expectedURL.absoluteString,
      message.frameInfo.securityOrigin.protocol == "file",
      message.frameInfo.securityOrigin.host.isEmpty, message.frameInfo.securityOrigin.port == 0,
      let text = message.body as? String, text.utf8.count <= 2048,
      let data = text.data(using: .utf8),
      let value = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
      value["sessionId"] as? String == generation else { reply(nil, "Diagnostic rejected"); return }
    switch value["type"] as? String {
    case "ready" where value.count == 2 && !ready:
      ready = true
      deadline?.cancel()
      reply(nil, nil)
      emit("ready")
    case "error" where value.count == 3:
      guard let code = value["code"] as? String,
        code.range(of: "^[a-z-]{1,80}$", options: .regularExpression) != nil else {
        reply(nil, "Diagnostic rejected"); return
      }
      reply(nil, nil)
      fail(code)
    default:
      reply(nil, "Diagnostic rejected")
    }
  }

  private func emit(_ type: String, code: String? = nil) {
    var event: [String: Any] = ["type": type, "sessionId": sessionId ?? ""]
    if let code { event["code"] = code }
    onEvent?(event)
  }

  private func fail(_ code: String) {
    guard !disposed else { return }
    live = false
    emit("error", code: code)
    destroySession()
  }

  func destroySession() {
    guard !disposed else { return }
    disposed = true
    live = false
    deadline?.cancel()
    deadline = nil
    receiver?.owner = nil
    receiver = nil
    WKContentRuleListStore.default().removeContentRuleList(forIdentifier: "hypergolic-host-v1-" + generation) { _ in }
    guard let view = webView else { return }
    view.configuration.userContentController.removeScriptMessageHandler(forName: bridgeName, contentWorld: bridgeWorld)
    view.configuration.userContentController.removeAllUserScripts()
    view.stopLoading()
    view.navigationDelegate = nil
    view.uiDelegate = nil
    view.removeFromSuperview()
    webView = nil
    // Keep content rules attached until this WKWebView is released. Revoking a
    // session must never create an unfiltered interval in a surviving renderer.
  }

  func webView(_ view: WKWebView, decidePolicyFor action: WKNavigationAction,
               decisionHandler: @escaping @MainActor @Sendable (WKNavigationActionPolicy) -> Void) {
    guard view === webView, live, !disposed, let url = action.request.url,
      let frame = action.targetFrame else { decisionHandler(.cancel); return }
    if frame.isMainFrame {
      guard !initialNavigationAllowed, action.navigationType == .other,
        url.absoluteString == expectedURL?.absoluteString,
        action.request.httpMethod == nil || action.request.httpMethod == "GET" else {
        decisionHandler(.cancel); fail("navigation-blocked"); return
      }
      initialNavigationAllowed = true
      decisionHandler(.allow)
    } else if !ready && action.navigationType == .other && ["about:blank", "about:srcdoc"].contains(url.absoluteString) {
      decisionHandler(.allow)
    } else {
      decisionHandler(.cancel)
      // Any later attempted document navigation ends this bound generation.
      if ready { fail("frame-navigation") }
    }
  }

  func webView(_ view: WKWebView, decidePolicyFor response: WKNavigationResponse,
               decisionHandler: @escaping @MainActor @Sendable (WKNavigationResponsePolicy) -> Void) {
    guard view === webView, live, response.canShowMIMEType else { decisionHandler(.cancel); return }
    if response.isForMainFrame && response.response.url?.absoluteString != expectedURL?.absoluteString {
      decisionHandler(.cancel); fail("navigation-blocked"); return
    }
    decisionHandler(.allow)
  }

  func webView(_ view: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
    if view !== webView || !live || loaded { fail("navigation-blocked") }
  }
  func webView(_ view: WKWebView, didFinish navigation: WKNavigation!) {
    guard view === webView, live, view.url?.absoluteString == expectedURL?.absoluteString else { return }
    loaded = true
  }
  func webView(_ view: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
    if view === webView && live { fail("host-load-failed") }
  }
  func webView(_ view: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
    if view === webView && live { fail("host-load-failed") }
  }
  func webViewWebContentProcessDidTerminate(_ view: WKWebView) {
    if view === webView { fail("renderer-stopped") }
  }
  func webView(_ view: WKWebView, didReceive challenge: URLAuthenticationChallenge,
               completionHandler: @escaping @MainActor @Sendable (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
    completionHandler(.cancelAuthenticationChallenge, nil)
  }
  func webView(_ view: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
               for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? { nil }
  func webViewDidClose(_ view: WKWebView) { if view === webView { fail("window-closed") } }
  func webView(_ view: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
               initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping @MainActor @Sendable () -> Void) { completionHandler() }
  func webView(_ view: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
               initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping @MainActor @Sendable (Bool) -> Void) { completionHandler(false) }
  func webView(_ view: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String,
               defaultText: String?, initiatedByFrame frame: WKFrameInfo,
               completionHandler: @escaping @MainActor @Sendable (String?) -> Void) { completionHandler(nil) }
  func webView(_ view: WKWebView, requestMediaCapturePermissionFor origin: WKSecurityOrigin,
               initiatedByFrame frame: WKFrameInfo, type: WKMediaCaptureType,
               decisionHandler: @escaping @MainActor @Sendable (WKPermissionDecision) -> Void) { decisionHandler(.deny) }
  func webView(_ view: WKWebView, requestDeviceOrientationAndMotionPermissionFor origin: WKSecurityOrigin,
               initiatedByFrame frame: WKFrameInfo, decisionHandler: @escaping @MainActor @Sendable (WKPermissionDecision) -> Void) { decisionHandler(.deny) }
  @available(iOS 18.4, *)
  func webView(_ view: WKWebView, runOpenPanelWith parameters: WKOpenPanelParameters,
               initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping @MainActor @Sendable ([URL]?) -> Void) { completionHandler(nil) }
}

@MainActor
private final class DiagnosticReceiver: NSObject, WKScriptMessageHandlerWithReply {
  weak var owner: RestrictedNappletHost?
  init(owner: RestrictedNappletHost) { self.owner = owner }
  func userContentController(_ userContentController: WKUserContentController,
                             didReceive message: WKScriptMessage,
                             replyHandler: @escaping @MainActor @Sendable (Any?, String?) -> Void) {
    guard let owner else { replyHandler(nil, "Session unavailable"); return }
    owner.receive(message, reply: replyHandler)
  }
}
