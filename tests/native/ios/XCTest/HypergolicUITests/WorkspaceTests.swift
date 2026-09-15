import CoreGraphics
import Foundation
import XCTest

@MainActor
final class WorkspaceTests: XCTestCase {
  private var app: XCUIApplication!
  private var checks: [[String: Any]] = []
  private var observations: [String: Any] = [:]
  private var gestures: [[String: Any]] = []
  private var complete = false
  private var scenario = ""
  private var nonce = ""
  private let placeholder = "Something you will recognise…"
  private let expected: [String: Set<String>] = [
    "identity-delete-unavailable": ["delete-exact-target", "unavailable-has-no-confirm", "cancel-keeps-workspace"],
    "state-close": ["state-close-warning", "state-reopen-shared", "state-reopen-instance"],
    "state-storage": ["state-identity", "state-storage-operations", "state-restart", "state-instance-scope", "state-owner-isolation", "state-identity-isolation"],
    "identity-switch": ["identity-settings-safe-area", "identity-cancel-retains-live-state", "identity-import-restarts-all", "identity-duplicate-and-selector", "identity-selection-after-restart"],
    "workspace-restart": ["selected-napplet-after-restart", "opening-order-after-restart", "explicit-empty-after-restart"],
    "card-cancel": ["short-card-stroke-cancel", "two-touch-card-cancel", "cancelled-card-state-retained"],
    "closing": ["seed-close-state", "gentle-overview-scroll", "rapid-swipe-warning", "keep-open-retains-state", "close-removes-only-target", "other-session-state-retained", "visible-close-controls", "quiet-empty-overview", "empty-settings-and-open"],
    "switch-state": ["seed-a", "seed-b-isolated", "edge-roundtrip-a", "two-column-overview", "overview-restore-b", "stop-at-last", "stop-at-first-and-restore-a"],
    "gestures": ["vertical-content-scroll", "horizontal-content-scroll", "marker-selection", "scroll-and-selection-retained"],
  ]

  override func setUpWithError() throws {
    continueAfterFailure = false
    let environment = ProcessInfo.processInfo.environment
    scenario = environment["HG_SCENARIO"] ?? ""
    nonce = environment["HG_NONCE"] ?? ""
    guard expected[scenario] != nil, nonce.range(of: "^[a-z0-9]{12}$", options: .regularExpression) != nil,
          let bundle = environment["HG_TARGET_BUNDLE_ID"], !bundle.isEmpty else { throw Failure.invalid("Invalid workspace configuration") }
    app = XCUIApplication(bundleIdentifier: bundle)
    observations = ["nonce": nonce, "bundleIdentifier": bundle, "appStateBeforeActivate": app.state.rawValue]
    app.activate()
  }

  override func tearDownWithError() throws {
    if app != nil { capture("final") }
    let names = Set(checks.compactMap { $0["name"] as? String })
    let allPassed = complete && names == expected[scenario] && checks.count == expected[scenario]?.count && checks.allSatisfy { $0["passed"] as? Bool == true }
    attach([
      "kind": "hypergolic-ios-workspace-v1", "scenario": scenario, "completed": complete,
      "allChecksPassed": allPassed, "checks": checks, "observations": observations, "gestures": gestures,
      "proofScope": "Public native XCTest gestures and accessibility. Temporary fixture values/scroll positions only; native generation identity and transition frame pacing are not directly observed."
    ], "workspace-report")
  }

  func testIdentityDeleteUnavailable() throws {
    guard ProcessInfo.processInfo.environment["HG_TARGET_BUNDLE_ID"] == "org.nostrocket.hypergolic.identityuifixture" else { throw Failure.invalid("Requires public identity UI fixture") }
    app.terminate()
    try until("Previous fixture process retired") { self.app.state == .notRunning }
    observations["cleanLaunchBeforeDraft"] = true
    app.launch()
    let original = try selectedIdentity(), title = currentTitle()
    try until("State Lab identity connection and editable field") {
      (try? self.web().staticTexts.matching(NSPredicate(format: "label == %@", "Identity connected")).count) == 1
        && (try? self.web().textViews.matching(NSPredicate(format: "label == %@", "String value")).firstMatch.isEnabled) == true
    }
    let field = try stateField("value")
    let marker = "NoDelete" + nonce
    field.typeText(marker)
    guard let draft = field.value as? String, draft.contains(marker) else { throw Failure.invalid("Draft input was not retained") }
    try dismissKeyboard()
    try identityPress("shell-settings")
    let other = try one(app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH %@ AND NOT label CONTAINS %@", "identity-select-", original)), "inactive saved identity")
    guard let range = other.label.range(of: "npub1[023456789acdefghjklmnpqrstuvwxyz]{58}", options: .regularExpression) else { throw Failure.invalid("Missing target public identity") }
    let target = String(other.label[range])
    let key = String(other.identifier.dropFirst("identity-select-".count))
    try identityPress("identity-delete-" + key)
    let reviewed = app.staticTexts.matching(identifier: "identity-delete-npub").firstMatch
    try until("Exact inactive identity review") { reviewed.exists && reviewed.label == target }
    record("delete-exact-target", true, ["targetNpub": target, "selectedNpub": original])
    let unavailable = app.staticTexts.matching(identifier: "identity-delete-unavailable").firstMatch
    try until("Explicit unavailable authentication fixture") { unavailable.exists && unavailable.label.contains("unavailable") }
    record("unavailable-has-no-confirm", !app.buttons.matching(identifier: "identity-delete-confirm").firstMatch.exists,
      ["scope": "Public-key fixture with explicit authentication-unavailable double; no native OS authentication or secret erasure"])
    capture("identity-delete-unavailable")
    try identityPress("identity-delete-cancel")
    try until("Unchanged two-identity inventory") { self.app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH %@", "identity-select-")).count == 2 }
    try identityPress("settings-done")
    record("cancel-keeps-workspace", try selectedIdentity() == original && currentTitle() == title && stateField("value").value as? String == draft,
      ["title": title, "selectedNpub": original, "savedIdentities": 2])
    try dismissKeyboard()
    capture("identity-delete-cancelled-live-state")
    complete = true
  }

  func testStateClose() throws {
    guard ProcessInfo.processInfo.environment["HG_TARGET_BUNDLE_ID"] == "org.nostrocket.hypergolic.identityuifixture" else { throw Failure.invalid("Requires isolated State Lab fixture") }
    let original = try selectedIdentity()
    let first = try openState("state-lab")
    let value = "Close" + nonce
    try stateField("key").typeText(nonce)
    try dismissKeyboard()
    try stateField("value").typeText(value)
    try dismissKeyboard()
    try stateAction("Write", status: "Write confirmed.")
    try stateScope(instance: true)
    try stateAction("Write", status: "Write confirmed.")
    try stateRead(value)
    try workspaceSaved()
    let title = currentTitle()
    try identityPress("handle-right")
    let close = app.buttons.matching(identifier: "overview-close-" + first).firstMatch
    try stateNativeReveal(close)
    try identityPress("overview-close-" + first)
    try until("Exact close warning") { self.app.staticTexts.matching(NSPredicate(format: "label == %@", "Close " + title + "?")).firstMatch.exists }
    capture("state-close-warning")
    record("state-close-warning", true, ["instance": first, "title": title])
    try identityPress("close-confirm")
    try until("Only target card removed") { !self.app.buttons.matching(identifier: "overview-card-" + first).firstMatch.exists }
    try workspaceSaved()
    let second = try openState("state-lab")
    guard first != second else { throw Failure.invalid("Reopened instance reused closed native ID") }
    try stateField("key").typeText(nonce)
    try dismissKeyboard()
    try stateRead(value)
    record("state-reopen-shared", try selectedIdentity() == original, ["closed": first, "opened": second, "value": value])
    try stateScope(instance: true)
    try stateAction("Read", status: "No value saved.")
    record("state-reopen-instance", true, ["closed": first, "opened": second, "oldInstanceNotInherited": true])
    capture("state-reopened-instance")
    complete = true
  }

  func testStateStorage() throws {
    guard ProcessInfo.processInfo.environment["HG_TARGET_BUNDLE_ID"] == "org.nostrocket.hypergolic.identityuifixture" else { throw Failure.invalid("State test requires the isolated public identity fixture") }
    if app.buttons.matching(identifier: "settings-done").firstMatch.isHittable { try identityPress("settings-done") }
    try dismissKeyboard()
    let original = try selectedIdentity()
    let first = try openState("state-lab")
    capture("state-open")
    let key = "sample" + nonce
    try stateField("key").typeText(nonce)
    try dismissKeyboard()
    let publicValues = try web().staticTexts.matching(NSPredicate(format: "label MATCHES %@", "[0-9a-f]{64}")).allElementsBoundByIndex
    guard publicValues.count == 1 else { throw Failure.invalid("Expected one rendered public key") }
    let publicKey = publicValues[0].label
    observations["stateIdentity"] = ["npub": original, "pubkey": publicKey]
    record("state-identity", true, ["npub": original, "pubkey": publicKey, "instance": first])
    try stateAction("Read", status: "No value saved.")
    try stateAction("Write", status: "Write confirmed.")
    try stateAction("Read", status: "Read an empty string.")
    let value = "Stored" + nonce
    try stateField("value").typeText(value)
    try dismissKeyboard()
    try stateAction("Write", status: "Write confirmed.")
    try stateRead(value)
    try stateAction("List keys", status: nil)
    try until("Saved key visible") { (try? self.stateResult().staticTexts.matching(NSPredicate(format: "label == %@", key)).count) == 1 }
    try stateAction("Remove", status: "Remove confirmed.")
    try stateAction("Read", status: "No value saved.")
    try stateAction("Write", status: "Write confirmed.")
    try stateRead(value)
    record("state-storage-operations", true, ["key": key, "value": value, "emptyDistinctFromMissing": true])
    capture("state-saved")
    try workspaceSaved()
    try restartWorkspaceApp()
    try stateReady(first)
    try stateField("key").typeText(nonce)
    try dismissKeyboard()
    try stateRead(value)
    record("state-restart", try selectedIdentity() == original, ["instance": first, "value": value])
    capture("state-restarted")
    // The rest of the journey uses the same nonce in separately opened trusted fixtures.
    try stateScope(instance: true)
    try stateAction("Read", status: "No value saved.")
    try stateField("value").typeText("Private" + nonce)
    try dismissKeyboard()
    try stateAction("Write", status: "Write confirmed.")
    let second = try openState("state-lab")
    try stateField("key").typeText(nonce)
    try dismissKeyboard()
    try stateRead(value)
    try stateScope(instance: true)
    try stateAction("Read", status: "No value saved.")
    record("state-instance-scope", first != second, ["first": first, "second": second, "shared": value])
    for variant in ["state-lab-peer", "state-lab-other-publisher"] {
      _ = try openState(variant)
      try stateField("key").typeText(nonce)
      try dismissKeyboard()
      try stateAction("Read", status: "No value saved.")
    }
    record("state-owner-isolation", true, ["key": key, "appAndPublisherIsolated": true])
    // Return to the first loaded State Lab using its persistent instance identifier.
    try stateFocus(first)
    try stateScope(instance: false)
    try stateRead(value)
    try identityPress("shell-settings")
    let other = try one(app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH %@ AND NOT label CONTAINS %@", "identity-select-", original)), "other saved identity")
    let otherID = other.identifier
    try nativeTap(other, name: "select-other-identity")
    try identityPress("identity-change-cancel")
    try identityPress("settings-done")
    try stateRead(value)
    try identityPress("shell-settings")
    try identityPress(otherID)
    try identityPress("identity-change-confirm")
    try stateReady(first)
    try stateField("key").typeText(nonce)
    try dismissKeyboard()
    try stateAction("Read", status: "No value saved.")
    try identityPress("shell-settings")
    try identityPress("identity-select-" + publicKey)
    try identityPress("identity-change-confirm")
    try stateReady(first)
    try stateField("key").typeText(nonce)
    try dismissKeyboard()
    try stateRead(value)
    record("state-identity-isolation", try selectedIdentity() == original, ["returnedValue": value, "npub": original])
    capture("state-identity-restored")
    complete = true
  }
  private func stateReady(_ id: String) throws {
    try until("State Lab native and SDK ready") {
      self.app.staticTexts.matching(identifier: "runtime-status-" + id).firstMatch.label == "Runtime connected"
        && (try? self.web().staticTexts.matching(NSPredicate(format: "label == %@", "Identity connected")).count) == 1
    }
  }
  private func openState(_ variant: String) throws -> String {
    try identityPress("shell-settings")
    let button = app.buttons.matching(identifier: "settings-open-" + variant).firstMatch
    try stateNativeReveal(button)
    try identityPress("settings-open-" + variant)
    try until("New State Lab title") { self.currentTitle().hasPrefix("State Lab") && !self.app.buttons.matching(identifier: "settings-done").firstMatch.exists }
    let statuses = app.staticTexts.matching(NSPredicate(format: "identifier BEGINSWITH %@", "runtime-status-")).allElementsBoundByIndex.filter { $0.isHittable }
    guard statuses.count == 1 else { throw Failure.invalid("Expected one focused runtime status") }
    let id = String(statuses[0].identifier.dropFirst("runtime-status-".count))
    guard id.hasPrefix(variant + "-") else { throw Failure.invalid("Wrong opened fixture") }
    try stateReady(id)
    return id
  }
  private func stateField(_ id: String) throws -> XCUIElement {
    let host = try web()
    let field = id == "key" ? host.textFields.matching(NSPredicate(format: "label == %@", "Key")).firstMatch
      : host.textViews.matching(NSPredicate(format: "label == %@", "String value")).firstMatch
    try stateReveal(field, in: host)
    try clearTap(field, within: host, name: "state-field-" + id)
    return field
  }
  private func stateReveal(_ element: XCUIElement, in host: XCUIElement) throws {
    guard element.exists else { throw Failure.invalid("Missing State Lab control") }
    for _ in 0..<8 {
      let point = CGPoint(x: element.frame.midX, y: element.frame.midY)
      if element.isHittable && host.frame.insetBy(dx: 12, dy: 20).contains(point) { return }
      let towardTop = point.y < host.frame.midY
      try contentDrag(in: host, from: CGVector(dx: 0.5, dy: towardTop ? 0.25 : 0.75),
        to: CGVector(dx: 0.5, dy: towardTop ? 0.7 : 0.3), name: "reveal-state-control")
    }
    throw Failure.invalid("Cannot reach State Lab control centre")
  }
  private func stateAction(_ title: String, status: String?) throws {
    let before = try stateRequests()
    let host = try web()
    let button = host.buttons.matching(NSPredicate(format: "label == %@", title)).firstMatch
    try stateReveal(button, in: host)
    try clearTap(button, within: host, name: "state-action-" + title)
    try until("A new SDK request") { (try? self.stateRequests()) == before + 1 }
    if let status { try until(status) { (try? self.stateResult().staticTexts.matching(NSPredicate(format: "label == %@", status)).count) == 1 } }
    else { try until("Keys response") { (try? self.stateResult().staticTexts.matching(NSPredicate(format: "label MATCHES %@", "[0-9]+ saved keys\\.")).count) == 1 } }
  }
  private func stateResult() throws -> XCUIElement {
    try one(web().otherElements.matching(NSPredicate(format: "label == %@", "Result, region")), "State Lab result region", visible: false)
  }
  private func stateRequests() throws -> Int {
    let output = try one(stateResult().otherElements.matching(NSPredicate(format: "label MATCHES %@", "[0-9]+, application status")), "SDK request counter", visible: false)
    guard let count = Int(output.label.components(separatedBy: ",")[0]) else { throw Failure.invalid("Missing SDK request counter") }
    return count
  }
  private func stateRead(_ value: String) throws {
    try stateAction("Read", status: "Read complete.")
    try until("Saved string rendered") { (try? self.stateResult().staticTexts.matching(NSPredicate(format: "label == %@", value)).count) == 1 }
  }
  private func stateScope(instance: Bool) throws {
    let host = try web()
    let menu = host.otherElements.matching(NSPredicate(format: "label == %@ AND value != nil", "Save in")).firstMatch
    try stateReveal(menu, in: host)
    try clearTap(menu, within: host, name: "state-scope")
    let label = instance ? "This instance only" : "All instances of this napplet"
    capture("scope-menu")
    let choice = app.buttons.matching(NSPredicate(format: "label == %@", label)).firstMatch
    guard choice.isHittable else { throw Failure.invalid("Unobservable storage scope option") }
    choice.tap()
    try dismissKeyboard()
  }
  private func stateNativeReveal(_ element: XCUIElement) throws {
    let scroll = app.scrollViews.firstMatch
    guard scroll.exists else { throw Failure.invalid("Missing native scroll surface") }
    for _ in 0..<10 {
      let centre = CGPoint(x: element.frame.midX, y: element.frame.midY)
      if element.isHittable && scroll.frame.insetBy(dx: 8, dy: 20).contains(centre) { return }
      if centre.y < scroll.frame.midY { scroll.swipeDown(velocity: .slow) }
      else { scroll.swipeUp(velocity: .slow) }
    }
    throw Failure.invalid("Could not reveal native control centre")
  }
  private func stateFocus(_ id: String) throws {
    try identityPress("handle-right")
    let card = app.buttons.matching(identifier: "overview-card-" + id).firstMatch
    try stateNativeReveal(card)
    try nativeTap(one(app.buttons.matching(identifier: "overview-card-" + id), "State Lab card"), name: "focus-state")
    try stateReady(id)
  }

  func testIdentitySwitch() throws {
    let environment = ProcessInfo.processInfo.environment
    guard environment["HG_TARGET_BUNDLE_ID"] == "org.nostrocket.hypergolic.identityuifixture",
          let nsec = environment["HG_PUBLIC_TEST_NSEC"], let destination = environment["HG_PUBLIC_TEST_NPUB"]
    else { throw Failure.invalid("Expected the isolated public identity UI fixture") }
    try identityFocus(1)
    let original = try selectedIdentity()
    let safeTop = try one(app.staticTexts.matching(identifier: "simulator-ui-fixture-label"), "top safe-area fixture label").frame.minY
    guard safeTop > app.frame.minY else { throw Failure.invalid("Unobservable safe-area baseline") }
    var saved: [Int: State] = [:]
    for number in 1...3 {
      try identityFocus(number)
      saved[number] = try seed(marker: "identity-" + nonce + "-\(number)", increments: number)
    }
    try identityPress("shell-settings")
    let done = try one(app.buttons.matching(identifier: "settings-done"), "Settings Done")
    record("identity-settings-safe-area", done.frame.minY >= safeTop && done.frame.height >= 44, ["safeTop": safeTop, "done": attributes(done)])
    try identityReview("invalid-nsec")
    try until("Invalid import feedback") { self.app.staticTexts.matching(identifier: "identity-import-error").firstMatch.exists }
    try identityPress("identity-import-cancel")
    try identityReview(nsec)
    try until("Reviewed public identity") { self.app.staticTexts.matching(identifier: "identity-change-npub").firstMatch.label == destination }
    capture("identity-confirmation")
    try identityPress("identity-change-cancel")
    try identityPress("settings-done")
    guard try selectedIdentity() == original else { throw Failure.invalid("Cancellation changed identity") }
    for number in 1...3 {
      try identityFocus(number)
      guard try state() == saved[number] else { throw Failure.invalid("Cancelled import changed live state") }
    }
    record("identity-cancel-retains-live-state", true, ["sessions": 3, "npub": original])
    try identityPress("shell-settings")
    try identityReview(nsec)
    try identityPress("identity-change-confirm")
    try focused(3)
    guard try selectedIdentity() == destination else { throw Failure.invalid("Import did not select reviewed identity") }
    for number in 1...3 {
      try identityFocus(number)
      let fresh = try state()
      guard fresh.counter == 0 && fresh.draft.isEmpty else { throw Failure.invalid("Accepted switch retained old live state") }
    }
    record("identity-import-restarts-all", true, ["sessions": 3, "npub": destination])
    try identityPress("shell-settings")
    try until("Two saved identities") { self.identityRows().count == 2 }
    let originalRow = try one(app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH %@ AND label CONTAINS %@", "identity-select-", original)), "original identity")
    let originalID = originalRow.identifier
    capture("identity-inventory")
    try identityReview(nsec)
    try until("Duplicate current import dismissed") { self.app.staticTexts.matching(identifier: "settings-full-npub").firstMatch.exists }
    guard !app.buttons.matching(identifier: "identity-change-confirm").firstMatch.exists && identityRows().count == 2 else { throw Failure.invalid("Duplicate import added an identity or requested a switch") }
    try identityPress(originalID)
    try identityPress("identity-change-cancel")
    guard app.staticTexts.matching(identifier: "settings-full-npub").firstMatch.label == destination else { throw Failure.invalid("Cancelled saved selector changed identity") }
    try identityPress(originalID)
    try identityPress("identity-change-confirm")
    try focused(3)
    guard try selectedIdentity() == original else { throw Failure.invalid("Saved selector did not restore original public identity") }
    record("identity-duplicate-and-selector", true, ["identities": 2, "npub": original])
    try workspaceSaved()
    try restartWorkspaceApp()
    try focused(3)
    guard try selectedIdentity() == original else { throw Failure.invalid("Selected identity did not survive restart") }
    try identityPress("shell-settings")
    try until("Retained inventory after restart") { self.identityRows().count == 2 }
    capture("identity-after-restart")
    record("identity-selection-after-restart", true, ["npub": original, "identities": identityRows().count, "scope": "Public-key-only fixture inventory; no protected key storage"])
    complete = true
  }
  private func identityRows() -> [XCUIElement] {
    app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH %@", "identity-select-")).allElementsBoundByIndex.filter { $0.exists }
  }
  private func selectedIdentity() throws -> String {
    try until("Full identity header visible") { self.app.buttons.matching(identifier: "shell-settings").firstMatch.isHittable }
    let button = try one(app.buttons.matching(identifier: "shell-settings"), "identity header")
    guard button.label.hasPrefix("Settings for npub1") else { throw Failure.invalid("Missing full selected public identity") }
    return String(button.label.dropFirst("Settings for ".count))
  }
  private func identityPress(_ identifier: String) throws {
    try until("Native identity control " + identifier) { self.app.buttons.matching(identifier: identifier).firstMatch.isHittable }
    try nativeTap(one(app.buttons.matching(identifier: identifier), identifier), name: identifier)
  }
  private func identityReview(_ input: String) throws {
    try identityPress("settings-import-identity")
    let field = try one(app.secureTextFields.matching(identifier: "identity-import-input"), "masked secret input")
    field.tap()
    field.typeText(input)
    guard !(field.value as? String ?? "").contains(input) else { throw Failure.invalid("Secret input appeared in accessibility value") }
    // Public disposable test key only. Return invokes the real trusted Continue handler.
    field.typeText("\n")
  }
  private func identityFocus(_ number: Int) throws {
    guard var current = Int(currentTitle().replacingOccurrences(of: "UX Lab ", with: "")) else { throw Failure.invalid("No focused fixture") }
    while current != number {
      let next = current + (number > current ? 1 : -1)
      try switchHandle(number > current ? "right" : "left", to: next)
      current = next
    }
    try focused(number)
  }

  func testWorkspaceRestart() throws {
    try focused(1)
    try workspaceSaved()
    try nativeTap(one(app.buttons.matching(identifier: "shell-settings"), "Settings"), name: "open-settings")
    try nativeTap(one(app.buttons.matching(identifier: "settings-open-ux-lab"), "Open UX Lab"), name: "open-fourth-fixture")
    try focused(4)
    try workspaceSaved()
    capture("before-workspace-restart")
    try restartWorkspaceApp()
    try focused(4)
    try workspaceSaved()
    record("selected-napplet-after-restart", currentTitle() == "UX Lab 4", ["title": currentTitle()])
    capture("restored-focused")
    try openOverview(expected: [1, 2, 3, 4])
    let cards = try [1, 2, 3, 4].map { number in
      try one(app.buttons.matching(identifier: "overview-card-ux-lab-\(number)"), "restored card", visible: false)
    }
    let a = cards[0].frame, b = cards[1].frame, c = cards[2].frame, d = cards[3].frame
    record("opening-order-after-restart", a.maxX < b.minX && abs(a.minY - b.minY) < 2
      && abs(c.minX - a.minX) < 2 && abs(d.minX - b.minX) < 2 && abs(c.minY - d.minY) < 2
      && c.minY > max(a.maxY, b.maxY), ["cards": cards.map(attributes)])
    capture("restored-order")
    for number in 1...4 {
      try nativeTap(one(app.buttons.matching(identifier: "overview-close-ux-lab-\(number)"), "Close first remaining fixture"), name: "close-fixture-\(number)")
      try warning(for: number)
      try nativeTap(one(app.buttons.matching(identifier: "close-confirm"), "Close anyway"), name: "confirm-close-\(number)")
      try overviewReady(Array(1...4).filter { $0 > number })
      try workspaceSaved()
    }
    guard try emptyOverview() else { throw Failure.invalid("Workspace did not become empty before restart") }
    capture("empty-before-restart")
    try restartWorkspaceApp()
    try until("Restored explicit empty workspace") { self.currentTitle() == "Hypergolic" && (try? self.emptyOverview()) == true }
    try workspaceSaved()
    record("explicit-empty-after-restart", try emptyOverview(), ["title": currentTitle(), "sessions": overviewIDs()])
    capture("empty-after-restart")
    complete = true
  }

  private func workspaceSaved() throws {
    try until("Workspace save complete") {
      self.app.descendants(matching: .any).matching(identifier: "workspace-saved").firstMatch.exists
        && !self.app.descendants(matching: .any).matching(identifier: "workspace-saving").firstMatch.exists
    }
  }
  private func restartWorkspaceApp() throws {
    app.terminate()
    try until("Target process terminated") { self.app.state == .notRunning }
    app.launch()
    try until("Target relaunched in foreground") { self.app.state == .runningForeground }
    let completed = observations["completedRestarts"] as? Int ?? 0
    observations["completedRestarts"] = completed + 1
  }

  func testSwitchState() throws {
    try focused(1)
    let a = try seed(marker: "ios-" + nonce + "-a", increments: 1)
    record("seed-a", a.draft.contains(nonce + "-a"), a.json)
    try switchHandle("right", to: 2)
    let beforeB = try state()
    guard !beforeB.draft.contains(nonce + "-a") else { throw Failure.invalid("Fresh A marker leaked into napplet B before B input") }
    let increments = beforeB.counter + 2 == a.counter ? 3 : 2
    let b = try seed(marker: "ios-" + nonce + "-b", increments: increments)
    record("seed-b-isolated", b.counter != a.counter && b.draft != a.draft && !b.draft.contains(nonce + "-a"), ["a": a.json, "b": b.json, "beforeB": beforeB.json])
    try switchHandle("left", to: 1)
    record("edge-roundtrip-a", try state() == a, ["expected": a.json, "actual": try state().json])
    capture("edge-return-a")

    let overviewHandle = try handle("right")
    gestures.append(["name": "open-overview", "input": "XCUICoordinate.tap", "point": pointJSON(CGPoint(x: overviewHandle.frame.midX, y: overviewHandle.frame.midY)), "handle": attributes(overviewHandle)])
    overviewHandle.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
    try until("Overview controls") { let card = self.app.buttons.matching(identifier: "overview-card-ux-lab-1").firstMatch; return card.exists && card.isHittable }
    let cardA = try one(app.buttons.matching(identifier: "overview-card-ux-lab-1"), "first overview card")
    let cardB = try one(app.buttons.matching(identifier: "overview-card-ux-lab-2"), "second overview card")
    let cardC = try one(app.buttons.matching(identifier: "overview-card-ux-lab-3"), "third overview card", visible: false)
    let leafCount = visibleLeaves().count
    let handles = app.buttons.matching(NSPredicate(format: "identifier == %@ OR identifier == %@", "handle-left", "handle-right")).allElementsBoundByIndex.filter { $0.exists && $0.isHittable }
    record("two-column-overview", cardA.frame.maxX < cardB.frame.minX && abs(cardA.frame.minY - cardB.frame.minY) < 2
           && abs(cardA.frame.width - cardB.frame.width) < 2 && abs(cardA.frame.width - cardC.frame.width) < 2
           && abs(cardC.frame.minX - cardA.frame.minX) < 2 && cardC.frame.minY > max(cardA.frame.maxY, cardB.frame.maxY)
           && leafCount == 0 && handles.isEmpty,
           ["a": attributes(cardA), "b": attributes(cardB), "c": attributes(cardC), "visibleLeafWebViews": leafCount, "visibleHandles": handles.count])
    capture("two-column-overview")
    cardB.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
    try focused(2)
    record("overview-restore-b", try state() == b, ["expected": b.json, "actual": try state().json])

    try switchHandle("right", to: 3)
    let c = try state()
    try switchHandle("right", to: 3)
    record("stop-at-last", try state() == c && currentTitle() == "UX Lab 3", ["expected": c.json, "actual": try state().json])
    capture("last-end-stop")
    try switchHandle("left", to: 2)
    guard try state() == b else { throw Failure.invalid("B state changed during end-stop route") }
    try switchHandle("left", to: 1)
    try switchHandle("left", to: 1)
    record("stop-at-first-and-restore-a", try state() == a && currentTitle() == "UX Lab 1", ["expected": a.json, "actual": try state().json])
    capture("first-end-stop")
    complete = true
  }

  func testGestures() throws {
    try focused(1)
    try dismissKeyboard()
    let host = try web()
    let anchor = try one(host.buttons.matching(NSPredicate(format: "label == %@", "Left edge at marker 01")), "vertical fixture anchor", visible: false)
    let beforeY = anchor.frame.minY
    try contentDrag(in: host, from: CGVector(dx: 0.5, dy: 0.92), to: CGVector(dx: 0.5, dy: 0.35), name: "vertical-content")
    try until("Vertical content movement") { abs(anchor.frame.minY - beforeY) > 40 }
    record("vertical-content-scroll", currentTitle() == "UX Lab 1" && beforeY - anchor.frame.minY > 40, ["anchorBeforeY": beforeY, "anchorAfterY": anchor.frame.minY])

    let railQuery = host.otherElements.matching(NSPredicate(format: "label == %@", "Horizontal marker strip, region"))
    var rail = try one(railQuery, "horizontal fixture strip", visible: false)
    for _ in 0..<6 {
      let visible = rail.frame.intersection(host.frame)
      if rail.isHittable && visible.height > 90 { break }
      let down = rail.frame.midY < host.frame.midY
      try contentDrag(in: host, from: CGVector(dx: 0.5, dy: down ? 0.25 : 0.85), to: CGVector(dx: 0.5, dy: down ? 0.65 : 0.35), name: "reveal-horizontal-strip")
      rail = try one(railQuery, "horizontal fixture strip", visible: false)
    }
    guard rail.isHittable, rail.frame.intersection(host.frame).height > 90 else { throw Failure.invalid("Horizontal strip not sufficiently visible") }
    let marker = try one(rail.switches.matching(NSPredicate(format: "label == %@", "Select marker 04")), "fourth strip marker", visible: false)
    let beforeX = marker.frame.minX
    let railVisible = rail.frame.intersection(host.frame)
    let start = CGPoint(x: max(host.frame.minX + host.frame.width * 0.72, railVisible.midX), y: railVisible.midY)
    let end = CGPoint(x: host.frame.minX + host.frame.width * 0.22, y: railVisible.midY)
    try drag(in: host, start: start, end: end, name: "horizontal-content", avoidHandles: true)
    try until("Horizontal strip movement") { beforeX - marker.frame.minX > 40 }
    record("horizontal-content-scroll", currentTitle() == "UX Lab 1" && beforeX - marker.frame.minX > 40,
           ["markerBeforeX": beforeX, "markerAfterX": marker.frame.minX, "strip": attributes(rail)])
    guard marker.isHittable else { throw Failure.invalid("Fourth marker is not visible after horizontal gesture") }
    try clearTap(marker, within: host, name: "select-fourth-marker")
    try until("Marker selected") { (marker.value as? String) == "1" }
    record("marker-selection", (marker.value as? String) == "1", attributes(marker))
    let saved = try state()
    let savedX = marker.frame.minX
    let savedY = anchor.frame.minY
    capture("scrolled-selected-a")
    try switchHandle("right", to: 2)
    try switchHandle("left", to: 1)
    let returned = try web()
    let returnedMarker = try one(returned.switches.matching(NSPredicate(format: "label == %@", "Select marker 04")), "returned fourth marker", visible: false)
    let returnedAnchor = try one(returned.buttons.matching(NSPredicate(format: "label == %@", "Left edge at marker 01")), "returned vertical anchor", visible: false)
    record("scroll-and-selection-retained", try state() == saved && abs(returnedMarker.frame.minX - savedX) < 4 && abs(returnedAnchor.frame.minY - savedY) < 4 && (returnedMarker.value as? String) == "1",
           ["savedState": saved.json, "actualState": try state().json, "savedMarkerX": savedX, "returnedMarkerX": returnedMarker.frame.minX, "savedAnchorY": savedY, "returnedAnchorY": returnedAnchor.frame.minY])
    capture("scrolled-return-a")
    complete = true
  }

  func testCardCancellation() throws {
    try focused(1)
    try dismissKeyboard()
    let saved = try state()
    try openOverview(expected: [1, 2, 3])
    let scroller = try one(app.scrollViews, "overview scroll surface")
    let card = try overviewCard(1)
    let initial = card.frame
    guard initial.intersection(scroller.frame).height >= initial.height - 2 else { throw Failure.invalid("Card must be fully visible for bounded cancellation inputs") }
    let start = CGPoint(x: initial.midX, y: initial.minY + initial.height * 0.6)
    let end = CGPoint(x: start.x, y: start.y - 20)
    try nativeDrag(in: scroller, start: start, end: end, velocity: 1500, name: "short-card-stroke")
    try until("Short card stroke returned to overview") {
      self.overviewIDs() == ["ux-lab-1", "ux-lab-2", "ux-lab-3"] && !self.closePromptVisible()
        && abs(card.frame.minY - initial.minY) < 2
    }
    record("short-card-stroke-cancel", !closePromptVisible() && overviewIDs().count == 3,
      ["requestedTravelPixels": 20, "requestedVelocityPixelsPerSecond": 1500, "before": rectJSON(initial), "after": attributes(card)])
    capture("short-card-stroke-cancel")

    let target = attributes(card)
    observations["twoTouchTarget"] = target
    gestures.append(["name": "two-touch-card", "input": "XCUIElement.pinch", "scale": 0.75, "velocityScalePerSecond": -1,
      "target": target, "scope": "Two simultaneous touches from gesture start; adding a finger after active drag is not claimed."])
    card.pinch(withScale: 0.75, velocity: -1)
    try until("Two-touch gesture returned to overview") {
      self.overviewIDs() == ["ux-lab-1", "ux-lab-2", "ux-lab-3"] && !self.closePromptVisible()
        && abs(card.frame.minY - initial.minY) < 2
    }
    record("two-touch-card-cancel", !closePromptVisible() && overviewIDs().count == 3,
      ["before": target, "after": attributes(card), "inputProof": "Launcher must separately validate two simultaneous archived touch paths inside this observed target."])
    capture("two-touch-card-cancel")
    try nativeTap(overviewCard(1), name: "return-to-cancelled-card")
    try focused(1)
    record("cancelled-card-state-retained", try state() == saved, ["before": saved.json, "after": try state().json])
    capture("cancelled-card-state-retained")
    complete = true
  }

  private func rectJSON(_ rect: CGRect) -> [String: CGFloat] {
    ["x": rect.minX, "y": rect.minY, "width": rect.width, "height": rect.height]
  }

  func testClosing() throws {
    try focused(1)
    let a = try seed(marker: "ios-" + nonce + "-close-a", increments: 1)
    let selectedA = try selectedMarkers()
    guard selectedA.count == 1 else { throw Failure.invalid("Closing requires one selected marker in UX Lab 1; run gestures first") }
    try switchHandle("right", to: 2)
    let beforeB = try state()
    let b = try seed(marker: "ios-" + nonce + "-close-b", increments: beforeB.counter + 2 == a.counter ? 3 : 2)
    try switchHandle("left", to: 1)
    record("seed-close-state", try state() == a && a.counter != b.counter && a.draft != b.draft,
           ["a": a.json, "b": b.json, "selectedA": selectedA])
    try openOverview(expected: [1, 2, 3])

    let scroller = try one(app.scrollViews, "overview scroll surface")
    let first = try overviewCard(1)
    let beforeY = first.frame.minY
    try overviewDrag(first, within: scroller, from: 0.78, to: 0.23, velocity: 250, name: "gentle-overview-scroll")
    try until("Overview list moved gently") { beforeY - first.frame.minY > 40 }
    record("gentle-overview-scroll", overviewIDs() == ["ux-lab-1", "ux-lab-2", "ux-lab-3"] && !closePromptVisible(),
           ["cardBeforeY": beforeY, "cardAfterY": first.frame.minY, "requestedVelocityPixelsPerSecond": 250])
    capture("gentle-overview-scroll")
    // A downward gesture cannot satisfy the upward-close classifier; return the first card into clear view.
    let gutter = CGPoint(x: scroller.frame.midX, y: scroller.frame.minY + scroller.frame.height * 0.25)
    try nativeDrag(in: scroller, start: gutter, end: CGPoint(x: gutter.x, y: scroller.frame.minY + scroller.frame.height * 0.8), velocity: 250, name: "restore-overview-scroll")
    try until("First card fully available for swipe") {
      first.frame.intersection(scroller.frame).height > first.frame.height * 0.9
    }
    try rapidCloseSwipe(1)
    try warning(for: 1)
    record("rapid-swipe-warning", closePromptVisible(), ["title": "Close UX Lab 1?", "warning": warningText])
    capture("unknown-state-warning")
    try nativeTap(one(app.buttons.matching(identifier: "close-keep-open"), "Keep open"), name: "keep-open")
    try overviewReady([1, 2, 3])
    try nativeTap(overviewCard(1), name: "return-to-kept-a")
    try focused(1)
    record("keep-open-retains-state", try state() == a && selectedMarkers() == selectedA,
           ["expected": a.json, "actual": try state().json, "expectedSelected": selectedA, "actualSelected": try selectedMarkers()])
    capture("kept-a-state")

    try openOverview(expected: [1, 2, 3])
    try rapidCloseSwipe(1)
    try warning(for: 1)
    try nativeTap(one(app.buttons.matching(identifier: "close-confirm"), "Close anyway"), name: "confirm-close-a")
    try overviewReady([2, 3])
    record("close-removes-only-target", overviewIDs() == ["ux-lab-2", "ux-lab-3"] && visibleLeaves().isEmpty,
           ["remainingCards": overviewIDs(), "removedCardExists": app.buttons.matching(identifier: "overview-card-ux-lab-1").firstMatch.exists])
    capture("a-closed-overview")
    try nativeTap(overviewCard(2), name: "return-to-retained-b")
    try focused(2)
    record("other-session-state-retained", try state() == b, ["expected": b.json, "actual": try state().json])
    capture("retained-b-state")
    try openOverview(expected: [2, 3])
    for number in [2, 3] {
      try nativeTap(one(app.buttons.matching(identifier: "overview-close-ux-lab-\(number)"), "visible close control"), name: "visible-close-\(number)")
      try warning(for: number)
      capture("close-warning-\(number)")
      try nativeTap(one(app.buttons.matching(identifier: "close-confirm"), "Close anyway"), name: "confirm-close-\(number)")
      try overviewReady(number == 2 ? [3] : [])
    }
    record("visible-close-controls", overviewIDs().isEmpty, ["remainingCards": overviewIDs()])
    record("quiet-empty-overview", try emptyOverview(), ["visibleLeafWebViews": visibleLeaves().count, "remainingCards": overviewIDs()])
    capture("quiet-empty-overview")
    for target in ["shell-settings", "overview-open", "empty-open-napplet"] {
      try nativeTap(one(app.buttons.matching(identifier: target), "empty overview entry point"), name: "empty-" + target)
      try until("Settings opened from empty overview") { self.app.buttons.matching(identifier: "settings-done").firstMatch.isHittable }
      capture("empty-settings-" + target)
      try nativeTap(one(app.buttons.matching(identifier: "settings-done"), "Settings Done"), name: "settings-done")
      try overviewReady([])
      guard try emptyOverview() else { throw Failure.invalid("Empty overview did not survive Settings roundtrip") }
    }
    record("empty-settings-and-open", try emptyOverview(), ["testedEntryPoints": ["shell-settings", "overview-open", "empty-open-napplet"]])
    capture("empty-after-settings")
    complete = true
  }

  private let warningText = "Unsaved work may be lost. Saved data will remain available when you open it again."
  private func selectedMarkers() throws -> [String] {
    let markers = try web().switches.matching(NSPredicate(format: "label BEGINSWITH %@", "Select marker ")).allElementsBoundByIndex
    guard markers.count == 10, markers.allSatisfy({ ["0", "1"].contains($0.value as? String ?? "") }) else { throw Failure.invalid("Marker selection is not observable") }
    return markers.filter { ($0.value as? String) == "1" }.map { $0.label }.sorted()
  }
  private func overviewIDs() -> [String] {
    app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH %@", "overview-card-")).allElementsBoundByIndex
      .filter { $0.exists }.map { String($0.identifier.dropFirst("overview-card-".count)) }.sorted()
  }
  private func overviewCard(_ number: Int) throws -> XCUIElement {
    try one(app.buttons.matching(identifier: "overview-card-ux-lab-\(number)"), "overview card \(number)")
  }
  private func overviewReady(_ numbers: [Int]) throws {
    let wanted = numbers.map { "ux-lab-\($0)" }.sorted()
    try until("Expected overview cards") {
      self.overviewIDs() == wanted && self.visibleLeaves().isEmpty && !self.closePromptVisible()
        && self.app.buttons.matching(identifier: "overview-open").firstMatch.exists
    }
  }
  private func openOverview(expected: [Int]) throws {
    try dismissKeyboard()
    try nativeTap(handle("right"), name: "open-overview")
    try overviewReady(expected)
  }
  private func closePromptVisible() -> Bool {
    let button = app.buttons.matching(identifier: "close-confirm").firstMatch
    return button.exists && button.isHittable
  }
  private func warning(for number: Int) throws {
    try until("Unknown-state warning for UX Lab \(number)") {
      self.closePromptVisible() && self.app.buttons.matching(identifier: "close-keep-open").firstMatch.isHittable
        && self.app.staticTexts.matching(NSPredicate(format: "label == %@", "Close UX Lab \(number)?")).firstMatch.exists
        && self.app.staticTexts.matching(NSPredicate(format: "label == %@", self.warningText)).firstMatch.exists
    }
  }
  private func rapidCloseSwipe(_ number: Int) throws {
    let scroller = try one(app.scrollViews, "overview scroll surface")
    try overviewDrag(overviewCard(number), within: scroller, from: 0.8, to: 0.35, velocity: 1500, name: "rapid-close-\(number)")
  }
  private func overviewDrag(_ card: XCUIElement, within scroller: XCUIElement, from: CGFloat, to: CGFloat, velocity: CGFloat, name: String) throws {
    let start = CGPoint(x: card.frame.midX, y: card.frame.minY + card.frame.height * from)
    let end = CGPoint(x: card.frame.midX, y: card.frame.minY + card.frame.height * to)
    guard card.frame.contains(start), card.frame.contains(end) else { throw Failure.invalid("Gesture outside observed card") }
    gestures.append(["name": name + "-target", "card": attributes(card)])
    try nativeDrag(in: scroller, start: start, end: end, velocity: velocity, name: name)
  }
  private func nativeDrag(in element: XCUIElement, start: CGPoint, end: CGPoint, velocity: CGFloat, name: String) throws {
    guard element.frame.contains(start), element.frame.contains(end) else { throw Failure.invalid("Gesture outside observed native surface") }
    gestures.append(["name": name, "input": "XCUICoordinate.press-and-drag", "start": pointJSON(start), "end": pointJSON(end),
                     "requestedVelocityPixelsPerSecond": velocity, "initialHoldSeconds": 0, "finalHoldSeconds": 0, "surface": attributes(element)])
    let origin = element.coordinate(withNormalizedOffset: .zero)
    origin.withOffset(CGVector(dx: start.x - element.frame.minX, dy: start.y - element.frame.minY)).press(forDuration: 0,
      thenDragTo: origin.withOffset(CGVector(dx: end.x - element.frame.minX, dy: end.y - element.frame.minY)),
      withVelocity: XCUIGestureVelocity(rawValue: velocity), thenHoldForDuration: 0)
  }
  private func nativeTap(_ element: XCUIElement, name: String) throws {
    let point = CGPoint(x: element.frame.midX, y: element.frame.midY)
    guard element.exists, element.isHittable, app.frame.contains(point) else { throw Failure.invalid("Native tap target is not visible") }
    gestures.append(["name": name, "input": "XCUICoordinate.tap", "point": pointJSON(point), "target": attributes(element)])
    element.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
  }
  private func emptyOverview() throws -> Bool {
    let handles = app.buttons.matching(NSPredicate(format: "identifier == %@ OR identifier == %@", "handle-left", "handle-right")).allElementsBoundByIndex.filter { $0.exists && $0.isHittable }
    return overviewIDs().isEmpty && visibleLeaves().isEmpty && handles.isEmpty
      && app.staticTexts.matching(NSPredicate(format: "label == %@", "Nothing open")).firstMatch.exists
      && app.buttons.matching(identifier: "empty-open-napplet").firstMatch.isHittable
      && app.buttons.matching(identifier: "overview-open").firstMatch.isHittable
      && app.buttons.matching(identifier: "shell-settings").firstMatch.isHittable
  }

  private struct State: Equatable {
    let counter: Int
    let draft: String
    var json: [String: Any] { ["counter": counter, "draft": draft] }
  }
  private func state() throws -> State {
    let host = try web()
    let container = try one(host.otherElements.matching(NSPredicate(format: "label == %@", "Counter, application status")), "counter", visible: false)
    let values = container.staticTexts.allElementsBoundByIndex.compactMap { Int($0.label) }
    let draft = try one(host.textViews.matching(NSPredicate(format: "label == %@", "Your temporary note")), "draft", visible: false)
    guard values.count == 1, let value = draft.value as? String else { throw Failure.invalid("Unobservable counter/draft") }
    return State(counter: values[0], draft: value == placeholder ? "" : value)
  }
  private func seed(marker: String, increments: Int) throws -> State {
    try dismissKeyboard()
    let host = try web()
    let add = try one(host.buttons.matching(NSPredicate(format: "label == %@", "Add one")), "increment", visible: false)
    for _ in 0..<8 where !add.isHittable {
      try contentDrag(in: host, from: CGVector(dx: 0.5, dy: 0.25), to: CGVector(dx: 0.5, dy: 0.7), name: "reveal-counter")
    }
    guard add.isHittable else { throw Failure.invalid("Could not reveal counter input") }
    let before = try state()
    for _ in 0..<increments { add.tap() }
    let draft = try one(host.textViews.matching(NSPredicate(format: "label == %@", "Your temporary note")), "draft", visible: false)
    for _ in 0..<4 where !draft.isHittable {
      try contentDrag(in: host, from: CGVector(dx: 0.5, dy: 0.9), to: CGVector(dx: 0.5, dy: 0.45), name: "reveal-draft")
    }
    guard before.draft.count + marker.count < 2000 else { throw Failure.invalid("Draft capacity exceeded; existing text is not cleared") }
    try clearTap(draft, within: host, name: "focus-draft")
    draft.typeText(marker)
    try dismissKeyboard()
    let seeded = try state()
    guard seeded.counter == before.counter + increments, seeded.draft.contains(marker),
          seeded.draft.replacingOccurrences(of: marker, with: "") == before.draft
    else { throw Failure.invalid("Fixture input did not produce the expected counter/draft while preserving prior text") }
    capture("seed-" + marker.suffix(1))
    return seeded
  }
  private func dismissKeyboard() throws {
    if app.keyboards.count == 0 { return }
    let done = try one(app.toolbars.buttons.matching(NSPredicate(format: "label == %@", "Done")), "native input toolbar Done")
    observations["nativeKeyboardDismissedWithDone"] = true
    done.tap()
    try until("Native keyboard dismissed") { self.app.keyboards.count == 0 }
  }
  private func currentTitle() -> String { let title = app.staticTexts.matching(identifier: "focused-napplet-name").firstMatch; return title.exists ? title.label : "" }
  private func focused(_ number: Int) throws {
    try until("Focused UX Lab \(number) ready") {
      let status = self.app.staticTexts.matching(identifier: "runtime-status-ux-lab-\(number)").firstMatch
      guard self.currentTitle() == "UX Lab \(number)", status.exists, status.label == "Runtime connected" else { return false }
      let leaves = self.visibleLeaves()
      guard leaves.count == 1 else { return false }
      // A newly activated WK tree may initially expose only its wrapper. Native
      // readiness alone does not prove that fixture controls are queryable yet.
      return leaves[0].staticTexts.matching(NSPredicate(format: "label BEGINSWITH %@", "Ready ·")).count == 1
        && leaves[0].staticTexts.matching(NSPredicate(format: "label == %@", "Host colors")).count == 1
    }
  }
  private func visibleLeaves() -> [XCUIElement] {
    app.webViews.allElementsBoundByIndex.filter { $0.exists && $0.isHittable && $0.descendants(matching: .webView).count == 0 }
  }
  private func web() throws -> XCUIElement {
    var found = visibleLeaves()
    // WK accessibility can expand its nested tree between enumeration and descendant queries after cold launch.
    if found.isEmpty {
      try until("Active WebView accessibility tree") {
        found = self.visibleLeaves()
        return !found.isEmpty
      }
    }
    guard found.count == 1 else { throw Failure.invalid("Expected one active leaf WebView, got \(found.count)") }
    return found[0]
  }
  private func handle(_ side: String) throws -> XCUIElement { try one(app.buttons.matching(identifier: "handle-" + side), side + " handle") }
  private func switchHandle(_ side: String, to number: Int) throws {
    try dismissKeyboard()
    let host = try web()
    let grip = try handle(side)
    let start = CGPoint(x: grip.frame.midX, y: grip.frame.midY)
    let end = CGPoint(x: host.frame.midX, y: grip.frame.midY)
    try drag(in: host, start: start, end: end, name: "edge-" + side, avoidHandles: false)
    try focused(number)
    // A same-title end-stop must also finish its transition and remain out of overview.
    try until("Handles restored") { self.app.buttons.matching(identifier: "handle-" + side).firstMatch.isHittable }
  }
  private func clearTap(_ element: XCUIElement, within host: XCUIElement, name: String) throws {
    let point = CGPoint(x: element.frame.midX, y: element.frame.midY)
    try verifyClear(point, within: host)
    gestures.append(["name": name, "input": "XCUICoordinate.tap", "point": pointJSON(point), "element": attributes(element), "handles": handleAttributes()])
    element.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
  }
  private func contentDrag(in host: XCUIElement, from start: CGVector, to end: CGVector, name: String) throws {
    try drag(in: host, start: CGPoint(x: host.frame.minX + host.frame.width * start.dx, y: host.frame.minY + host.frame.height * start.dy),
             end: CGPoint(x: host.frame.minX + host.frame.width * end.dx, y: host.frame.minY + host.frame.height * end.dy), name: name, avoidHandles: true)
  }
  private func drag(in host: XCUIElement, start: CGPoint, end: CGPoint, name: String, avoidHandles: Bool) throws {
    guard host.frame.contains(start), host.frame.contains(end) else { throw Failure.invalid("Gesture point outside observed host") }
    if avoidHandles { try verifyClear(start, within: host); try verifyClear(end, within: host) }
    let origin = host.coordinate(withNormalizedOffset: .zero)
    gestures.append(["name": name, "input": "XCUICoordinate.press-and-drag", "start": pointJSON(start), "end": pointJSON(end), "host": attributes(host), "handles": handleAttributes()])
    origin.withOffset(CGVector(dx: start.x - host.frame.minX, dy: start.y - host.frame.minY)).press(forDuration: 0.05,
      thenDragTo: origin.withOffset(CGVector(dx: end.x - host.frame.minX, dy: end.y - host.frame.minY)), withVelocity: .slow, thenHoldForDuration: 0.05)
  }
  private func verifyClear(_ point: CGPoint, within host: XCUIElement) throws {
    let grips = try [handle("left"), handle("right")]
    guard host.frame.contains(point), !grips.contains(where: { $0.frame.contains(point) }),
          !app.keyboards.allElementsBoundByIndex.contains(where: { $0.exists && $0.frame.contains(point) }) else { throw Failure.invalid("No clear gesture point away from handles/keyboard") }
  }
  private func handleAttributes() -> [[String: Any]] { app.buttons.matching(NSPredicate(format: "identifier == %@ OR identifier == %@", "handle-left", "handle-right")).allElementsBoundByIndex.filter { $0.exists }.map(attributes) }
  private func pointJSON(_ point: CGPoint) -> [String: Double] { ["x": point.x, "y": point.y] }
  private func one(_ query: XCUIElementQuery, _ description: String, visible: Bool = true) throws -> XCUIElement {
    let found = query.allElementsBoundByIndex.filter { $0.exists && (!visible || $0.isHittable) }
    guard found.count == 1 else { throw Failure.invalid("\(description): expected one element, observed \(found.count)") }
    return found[0]
  }
  private func until(_ description: String, _ condition: () -> Bool) throws {
    let deadline = Date().addingTimeInterval(10)
    repeat { if condition() { return }; RunLoop.current.run(until: Date().addingTimeInterval(0.2)) } while Date() < deadline
    throw Failure.invalid("Timed out: " + description)
  }
  private func record(_ name: String, _ passed: Bool, _ detail: [String: Any]) {
    checks.append(["name": name, "passed": passed, "details": detail])
    XCTAssertTrue(passed, name)
  }
  private func attributes(_ element: XCUIElement) -> [String: Any] {
    ["identifier": element.identifier, "label": element.label, "value": element.value as Any? ?? NSNull(), "hittable": element.isHittable,
     "bounds": ["x": element.frame.minX, "y": element.frame.minY, "width": element.frame.width, "height": element.frame.height]]
  }
  private func capture(_ name: String) {
    let shot = XCTAttachment(screenshot: app.screenshot()); shot.name = name + ".png"; shot.lifetime = .keepAlways; add(shot)
    let tree = XCTAttachment(string: app.debugDescription); tree.name = name + "-hierarchy.txt"; tree.lifetime = .keepAlways; add(tree)
  }
  private func attach(_ json: [String: Any], _ name: String) {
    do {
      let attachment = XCTAttachment(data: try JSONSerialization.data(withJSONObject: json, options: [.prettyPrinted, .sortedKeys]), uniformTypeIdentifier: "public.json")
      attachment.name = name + ".json"; attachment.lifetime = .keepAlways; add(attachment)
    } catch { XCTFail("Could not serialize workspace evidence: \(error)") }
  }
  private enum Failure: Error { case invalid(String) }
}
