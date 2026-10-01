import XCTest
import Darwin
final class UploadTests: XCTestCase {
  func testReviewRejectApprove() throws {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "org.nostrocket.hypergolic.uploadfixture")
    func capture(_ name: String) {
      let attachment = XCTAttachment(screenshot: app.screenshot())
      attachment.name = name; attachment.lifetime = .keepAlways; add(attachment)
      let tree = XCTAttachment(string: app.debugDescription)
      tree.name = name + "-accessibility"; tree.lifetime = .keepAlways; add(tree)
    }
    func review() {
      app.buttons["Request PNG upload"].tap()
      XCTAssertTrue(app.staticTexts["Approve file upload"].waitForExistence(timeout: 15), app.debugDescription)
      XCTAssertTrue(app.images["Exact photo selected for upload"].exists, app.debugDescription)
      let approve = app.buttons["Approve once"]
      XCTAssertTrue(approve.waitForExistence(timeout: 10), app.debugDescription)
      XCTAssertTrue(approve.isEnabled, app.debugDescription)
      capture("upload-trusted-review")
    }
    app.terminate(); app.launch()
    XCTAssertTrue(app.staticTexts["Native host connected"].waitForExistence(timeout: 30), app.debugDescription)
    XCTAssertTrue(app.staticTexts["Ready to request a PNG upload."].waitForExistence(timeout: 15), app.debugDescription)
    capture("upload-sdk-ready"); review()
    app.buttons["Reject upload"].tap()
    XCTAssertTrue(app.staticTexts["Upload cancelled."].waitForExistence(timeout: 10), app.debugDescription)
    capture("upload-rejected"); print("UPLOAD_REJECT_CHECKPOINT"); fflush(stdout)
    // The external observer records wall-clock counts between these native inputs.
    Thread.sleep(forTimeInterval: 3)
    app.buttons["upload-outcome"].tap(); review(); app.buttons["Approve once"].tap()
    XCTAssertTrue(app.staticTexts["Upload complete."].waitForExistence(timeout: 20), app.debugDescription)
    XCTAssertEqual(app.buttons["upload-outcome"].label, "Upload confirmed by server.")
    capture("upload-confirmed"); app.buttons["upload-outcome"].tap(); app.buttons["Read upload status"].tap()
    let receipt = app.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", "5a852fbaaaecaf4cd14c01e150c7f881c5c5894b0a1e3c53be7e007c58374ee6")).firstMatch
    XCTAssertTrue(receipt.waitForExistence(timeout: 10), app.debugDescription)
    XCTAssertTrue(receipt.label.contains("complete")); XCTAssertTrue(receipt.label.contains("71")); capture("upload-sdk-final-status")
    app.terminate(); app.launch()
    XCTAssertTrue(app.staticTexts["Ready to request a PNG upload."].waitForExistence(timeout: 30), app.debugDescription)
    capture("upload-cold-launch")
    let report: [String: Any] = ["kind": "hypergolic-ios-upload-v1", "nativeChecksPassed": true,
      "checks": ["decoded-trusted-review", "native-reject", "native-approved-completion", "original-sdk-final-receipt", "cold-launch"],
      "scope": "Actual isolated SDK/Kehto/native Simulator journey with disposable identity. Independent TLS observer verification is required separately; no picker or protected-device identity acceptance."]
    let attachment = XCTAttachment(data: try JSONSerialization.data(withJSONObject: report, options: [.sortedKeys]), uniformTypeIdentifier: "public.json")
    attachment.name = "upload-native-report"; attachment.lifetime = .keepAlways; add(attachment)
  }
  func testSelectedPhotoRejectApprove() throws {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "org.nostrocket.hypergolic.uploadfixture")
    let hash = "5a852fbaaaecaf4cd14c01e150c7f881c5c5894b0a1e3c53be7e007c58374ee6"
    func capture(_ name: String) {
      let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
      let tree = XCTAttachment(string: app.debugDescription); tree.name = name + "-accessibility"; tree.lifetime = .keepAlways; add(tree)
    }
    func selected() -> XCUIElement {app.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", "Selected bytes: 71; SHA-256: " + hash)).firstMatch}
    func tap(_ element: XCUIElement) {
      for _ in 0..<4 {if element.isHittable {break}; app.webViews.firstMatch.swipeUp()}
      XCTAssertTrue(element.isHittable, app.debugDescription); element.tap()
    }
    func review() {
      tap(app.buttons["Request selected upload"])
      XCTAssertTrue(app.staticTexts["Approve file upload"].waitForExistence(timeout: 15), app.debugDescription)
      XCTAssertTrue(app.images["Exact photo selected for upload"].exists, app.debugDescription)
      XCTAssertTrue(app.buttons["Approve once"].isEnabled, app.debugDescription); capture("picker-trusted-review")
    }
    app.terminate(); app.launch()
    XCTAssertTrue(app.staticTexts["Ready to request a PNG upload."].waitForExistence(timeout: 30), app.debugDescription)
    tap(app.buttons["Select a file"])
    XCTAssertTrue(app.buttons["Choose photo"].waitForExistence(timeout: 10), app.debugDescription)
    app.buttons["Choose photo"].tap()
    let photo = app.images.matching(NSPredicate(format: "label CONTAINS %@", "Private fixture location/date/device")).firstMatch
    XCTAssertTrue(photo.waitForExistence(timeout: 10), app.debugDescription); capture("system-photo-selection")
    // Photos exposes this remote grid image without a hittability flag; use its observed native bounds.
    photo.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
    XCTAssertTrue(selected().waitForExistence(timeout: 15), app.debugDescription)
    XCTAssertTrue(selected().label.contains("type: image/png")); XCTAssertTrue(selected().label.hasSuffix("relative path:")); capture("sanitized-guest-handoff")
    review(); app.buttons["Reject upload"].tap()
    XCTAssertTrue(app.staticTexts["Upload cancelled."].waitForExistence(timeout: 10), app.debugDescription)
    print("UPLOAD_PICKER_REJECT_CHECKPOINT"); fflush(stdout); Thread.sleep(forTimeInterval: 3)
    app.buttons["upload-outcome"].tap(); tap(app.buttons["Read selected file"])
    XCTAssertTrue(selected().waitForExistence(timeout: 10), app.debugDescription); capture("guest-read-after-rejection")
    review(); app.buttons["Approve once"].tap()
    XCTAssertTrue(app.staticTexts["Upload complete."].waitForExistence(timeout: 20), app.debugDescription)
    XCTAssertEqual(app.buttons["upload-outcome"].label, "Upload confirmed by server."); capture("selected-upload-confirmed")
  }

  func testSelectedAttachmentsRejectApprove() throws {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "org.nostrocket.hypergolic.uploadfixture")
    func capture(_ name: String) {
      let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
      let tree = XCTAttachment(string: app.debugDescription); tree.name = name + "-accessibility"; tree.lifetime = .keepAlways; add(tree)
    }
    func tapGuest(_ element: XCUIElement) {
      for _ in 0..<5 {if element.isHittable {break}; app.webViews.firstMatch.swipeUp()}
      XCTAssertTrue(element.isHittable, app.debugDescription); element.tap()
    }
    func named(_ value: String) -> XCUIElement {app.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", value)).firstMatch}
    app.terminate(); app.launch()
    XCTAssertTrue(app.staticTexts["Ready to request a PNG upload."].waitForExistence(timeout: 30), app.debugDescription)
    for ext in ["wav","mp4","pdf","zip","txt"] {
      tapGuest(app.buttons["Select a file"])
      XCTAssertTrue(app.buttons["Choose file"].waitForExistence(timeout: 10), app.debugDescription); app.buttons["Choose file"].tap()
      XCTAssertTrue(app.navigationBars.firstMatch.waitForExistence(timeout: 10), app.debugDescription)
      if app.buttons["Browse"].exists {app.buttons["Browse"].tap()}
      if named("On My iPhone").exists {named("On My iPhone").tap()}
      let container = app.cells["Hypergolic, Container"]
      if container.waitForExistence(timeout: 3) {container.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.25)).tap()}
      let folder = app.cells["UploadLab, Folder"]
      if folder.waitForExistence(timeout: 3) {
        // Tap the observed folder icon area; the title label is not its open control.
        folder.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.25)).tap()
      }
      let file = app.cells.matching(NSPredicate(format: "label BEGINSWITH %@", "proof-" + ext)).firstMatch
      XCTAssertTrue(file.waitForExistence(timeout: 10), app.debugDescription); capture(ext + "-system-file-selection")
      file.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.25)).tap()
      let selected = app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH %@", "Selected bytes:")).firstMatch
      XCTAssertTrue(selected.waitForExistence(timeout: 15), app.debugDescription)
      print("UPLOAD_ATTACHMENT_SELECTED:" + ext + ":" + selected.label); fflush(stdout); capture(ext + "-guest-handoff")
      func review() {
        tapGuest(app.buttons["Request selected upload"])
        XCTAssertTrue(app.staticTexts["Approve file upload"].waitForExistence(timeout: 15), app.debugDescription)
        XCTAssertTrue(app.staticTexts["upload-attachment-inspection"].exists, app.debugDescription)
        XCTAssertTrue(app.buttons["Approve once"].isEnabled, app.debugDescription); capture(ext + "-trusted-file-review")
      }
      review(); app.buttons["Reject upload"].tap()
      XCTAssertTrue(app.staticTexts["Upload cancelled."].waitForExistence(timeout: 10), app.debugDescription)
      print("UPLOAD_ATTACHMENT_REJECT:" + ext); fflush(stdout); Thread.sleep(forTimeInterval: 3)
      app.buttons["upload-outcome"].tap(); tapGuest(app.buttons["Read selected file"])
      XCTAssertTrue(selected.waitForExistence(timeout: 10), app.debugDescription)
      print("UPLOAD_ATTACHMENT_READ:" + ext + ":" + selected.label); fflush(stdout); capture(ext + "-guest-read-after-rejection")
      review(); app.buttons["Approve once"].tap()
      XCTAssertTrue(app.staticTexts["Upload complete."].waitForExistence(timeout: 20), app.debugDescription)
      XCTAssertEqual(app.buttons["upload-outcome"].label, "Upload confirmed by server."); capture(ext + "-confirmed")
      app.buttons["upload-outcome"].tap()
    }
  }

  func testSelectedPhotosRejectApprove() throws {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "org.nostrocket.hypergolic.uploadfixture")
    func capture(_ name: String) {
      let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
      let tree = XCTAttachment(string: app.debugDescription); tree.name = name + "-accessibility"; tree.lifetime = .keepAlways; add(tree)
    }
    func tapGuest(_ element: XCUIElement) {
      for _ in 0..<5 {if element.isHittable {break}; app.webViews.firstMatch.swipeUp()}
      XCTAssertTrue(element.isHittable, app.debugDescription); element.tap()
    }
    func named(_ value: String) -> XCUIElement {app.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", value)).firstMatch}
    app.terminate(); app.launch()
    XCTAssertTrue(app.staticTexts["Ready to request a PNG upload."].waitForExistence(timeout: 30), app.debugDescription)
    for index in 1...14 {
      let ext = String(format: "photo-%02d", index)
      tapGuest(app.buttons["Select a file"])
      XCTAssertTrue(app.buttons["Choose file"].waitForExistence(timeout: 10), app.debugDescription); app.buttons["Choose file"].tap()
      XCTAssertTrue(app.navigationBars.firstMatch.waitForExistence(timeout: 10), app.debugDescription)
      if app.buttons["Browse"].exists {app.buttons["Browse"].tap()}
      if named("On My iPhone").exists {named("On My iPhone").tap()}
      let container = app.cells["Hypergolic, Container"]
      if container.waitForExistence(timeout: 3) {container.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.25)).tap()}
      let folder = app.cells["UploadPhotos, Folder"]
      if folder.waitForExistence(timeout: 3) {
        // Tap the observed folder icon area; the title label is not its open control.
        folder.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.25)).tap()
      }
      let file = app.cells.matching(NSPredicate(format: "label BEGINSWITH %@", ext)).firstMatch
      func activeList() throws -> XCUIElement {
        // Bind the live query to this folder's observed photo cells, not a transient index.
        let lists = app.collectionViews.matching(identifier: "File View").containing(NSPredicate(format: "label BEGINSWITH %@", "photo-"))
        XCTAssertTrue(lists.firstMatch.waitForExistence(timeout: 5), app.debugDescription)
        XCTAssertEqual(lists.count, 1, app.debugDescription); return lists.firstMatch
      }
      if !file.exists || !file.isHittable {
        // Files restores its prior viewport, including after cold app launch.
        let first = app.cells.matching(NSPredicate(format: "label BEGINSWITH %@", "photo-01,")).firstMatch
        for _ in 0..<8 {if first.exists && first.isHittable {break}; try activeList().swipeDown()}
      }
      for _ in 0..<8 {if file.exists && file.isHittable {break}; try activeList().swipeUp()}
      XCTAssertTrue(file.waitForExistence(timeout: 10), app.debugDescription)
      XCTAssertTrue(file.isHittable, app.debugDescription); capture(ext + "-system-file-selection")
      file.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.25)).tap()
      let selected = app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH %@", "Selected bytes:")).firstMatch
      XCTAssertTrue(selected.waitForExistence(timeout: 15), app.debugDescription)
      print("UPLOAD_PHOTO_SELECTED:" + ext + ":" + selected.label); fflush(stdout); capture(ext + "-guest-handoff")
      func review() {
        tapGuest(app.buttons["Request selected upload"])
        XCTAssertTrue(app.staticTexts["Approve file upload"].waitForExistence(timeout: 15), app.debugDescription)
        XCTAssertTrue(app.images["Exact photo selected for upload"].exists, app.debugDescription)
        XCTAssertTrue(app.buttons["Approve once"].isEnabled, app.debugDescription); capture(ext + "-trusted-file-review")
      }
      review(); app.buttons["Reject upload"].tap()
      XCTAssertTrue(app.staticTexts["Upload cancelled."].waitForExistence(timeout: 10), app.debugDescription)
      print("UPLOAD_PHOTO_REJECT:" + ext); fflush(stdout); Thread.sleep(forTimeInterval: 3)
      app.buttons["upload-outcome"].tap(); tapGuest(app.buttons["Read selected file"])
      XCTAssertTrue(selected.waitForExistence(timeout: 10), app.debugDescription)
      print("UPLOAD_PHOTO_READ:" + ext + ":" + selected.label); fflush(stdout); capture(ext + "-guest-read-after-rejection")
      review(); app.buttons["Approve once"].tap()
      XCTAssertTrue(app.staticTexts["Upload complete."].waitForExistence(timeout: 20), app.debugDescription)
      XCTAssertEqual(app.buttons["upload-outcome"].label, "Upload confirmed by server."); capture(ext + "-confirmed")
      app.buttons["upload-outcome"].tap()
    }
  }

  func testSelectedHEICPhotoRejectApprove() throws {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "org.nostrocket.hypergolic.uploadfixture")
    func capture(_ name: String) {
      let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
      let tree = XCTAttachment(string: app.debugDescription); tree.name = name + "-accessibility"; tree.lifetime = .keepAlways; add(tree)
    }
    func tapGuest(_ element: XCUIElement) {
      for _ in 0..<5 {if element.isHittable {break}; app.webViews.firstMatch.swipeUp()}
      XCTAssertTrue(element.isHittable, app.debugDescription); element.tap()
    }
    app.terminate(); app.launch()
    XCTAssertTrue(app.staticTexts["Ready to request a PNG upload."].waitForExistence(timeout: 30), app.debugDescription)
    tapGuest(app.buttons["Select a file"])
    XCTAssertTrue(app.buttons["Choose photo"].waitForExistence(timeout: 10), app.debugDescription); app.buttons["Choose photo"].tap()
    let photo = app.images.matching(NSPredicate(format: "label CONTAINS %@", "Public photo picker HEIC proof")).firstMatch
    XCTAssertTrue(photo.waitForExistence(timeout: 10), app.debugDescription); capture("heic-library-selection")
    photo.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
    let selected = app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH %@", "Selected bytes:")).firstMatch
    XCTAssertTrue(selected.waitForExistence(timeout: 15), app.debugDescription)
    print("UPLOAD_PHOTO_SELECTED:photo-01:" + selected.label); fflush(stdout); capture("heic-library-guest-handoff")
    func review() {
      tapGuest(app.buttons["Request selected upload"])
      XCTAssertTrue(app.staticTexts["Approve file upload"].waitForExistence(timeout: 15), app.debugDescription)
      XCTAssertTrue(app.images["Exact photo selected for upload"].exists, app.debugDescription)
      XCTAssertTrue(app.buttons["Approve once"].isEnabled, app.debugDescription); capture("heic-library-trusted-review")
    }
    review(); app.buttons["Reject upload"].tap()
    XCTAssertTrue(app.staticTexts["Upload cancelled."].waitForExistence(timeout: 10), app.debugDescription)
    print("UPLOAD_PHOTO_REJECT:photo-01"); fflush(stdout); Thread.sleep(forTimeInterval: 3)
    app.buttons["upload-outcome"].tap(); tapGuest(app.buttons["Read selected file"])
    XCTAssertTrue(selected.waitForExistence(timeout: 10), app.debugDescription)
    print("UPLOAD_PHOTO_READ:photo-01:" + selected.label); fflush(stdout); capture("heic-library-read-after-reject")
    review(); app.buttons["Approve once"].tap()
    XCTAssertTrue(app.staticTexts["Upload complete."].waitForExistence(timeout: 20), app.debugDescription)
    XCTAssertEqual(app.buttons["upload-outcome"].label, "Upload confirmed by server."); capture("heic-library-confirmed")
    app.buttons["upload-outcome"].tap()
  }
  func testOriginalPhotosRejectApprove() throws {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "org.nostrocket.hypergolic.uploadfixture")
    func capture(_ name: String) {
      let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
      let tree = XCTAttachment(string: app.debugDescription); tree.name = name + "-accessibility"; tree.lifetime = .keepAlways; add(tree)
    }
    func tapGuest(_ label: String) {
      let button = app.buttons[label]
      for _ in 0..<10 {if button.isHittable {break}; app.webViews.firstMatch.swipeDown()}
      for _ in 0..<10 {if button.isHittable {break}; app.webViews.firstMatch.swipeUp()}
      XCTAssertTrue(button.isHittable, app.debugDescription);button.tap()
    }
    app.terminate(); app.launch()
    XCTAssertTrue(app.staticTexts["Ready to request a PNG upload."].waitForExistence(timeout: 30), app.debugDescription)
    for kind in ["JPEG", "HEIC"] {
      func review() {
        tapGuest("Request original " + kind)
        XCTAssertTrue(app.staticTexts["Approve file upload"].waitForExistence(timeout: 15), app.debugDescription)
        XCTAssertTrue(app.images["Exact photo selected for upload"].exists, app.debugDescription)
        XCTAssertTrue(app.buttons["Approve once"].isEnabled, app.debugDescription); capture(kind + "-trusted-native-prepared-review")
      }
      review(); app.buttons["Reject upload"].tap()
      XCTAssertTrue(app.staticTexts["Upload cancelled."].waitForExistence(timeout: 10), app.debugDescription)
      print("UPLOAD_ORIGINAL_REJECT:" + kind); fflush(stdout); Thread.sleep(forTimeInterval: 3)
      app.buttons["upload-outcome"].tap()
      let input = app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH %@", "Original " + kind + " input:")).firstMatch
      for _ in 0..<10 {if input.exists {break}; app.webViews.firstMatch.swipeUp()}
      XCTAssertTrue(input.exists, app.debugDescription);capture(kind + "-original-input-after-reject")
      print("UPLOAD_ORIGINAL_INPUT:" + kind + ":" + input.label);fflush(stdout)
      review();app.buttons["Approve once"].tap()
      XCTAssertTrue(app.staticTexts["Upload complete."].waitForExistence(timeout: 20), app.debugDescription)
      XCTAssertEqual(app.buttons["upload-outcome"].label, "Upload confirmed by server.");capture(kind + "-confirmed")
      app.buttons["upload-outcome"].tap();tapGuest("Read upload status")
      let receipt = app.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", "\"status\": \"complete\"")).firstMatch
      XCTAssertTrue(receipt.waitForExistence(timeout: 10), app.debugDescription);capture(kind + "-sdk-receipt")
      print("UPLOAD_ORIGINAL_RECEIPT:" + kind + ":" + receipt.label.replacingOccurrences(of: "\n", with: " "));fflush(stdout)
    }
  }

  func testPickerRecipientFaults() throws {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "org.nostrocket.hypergolic.uploadfixture")
    func capture(_ name: String) {
      let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
      let tree = XCTAttachment(string: app.debugDescription); tree.name = name + "-accessibility"; tree.lifetime = .keepAlways; add(tree)
    }
    func openFiles() {
      let select = app.buttons["Select a file"]
      for _ in 0..<5 {if select.isHittable {break}; app.webViews.firstMatch.swipeUp()}
      XCTAssertTrue(select.isHittable, app.debugDescription); select.tap()
      XCTAssertTrue(app.buttons["Choose file"].waitForExistence(timeout: 10), app.debugDescription); app.buttons["Choose file"].tap()
      XCTAssertTrue(app.buttons["Cancel"].waitForExistence(timeout: 10), app.debugDescription)
    }
    func noFile(_ name: String) {
      XCTAssertFalse(app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH %@", "Selected bytes:")).firstMatch.exists, app.debugDescription)
      XCTAssertFalse(app.buttons["Request selected upload"].isEnabled, app.debugDescription)
      capture(name); print("UPLOAD_PICKER_DENIED:" + name); fflush(stdout); Thread.sleep(forTimeInterval: 2)
    }
    for action in ["close", "replace", "identity", "renderer"] {
      app.terminate(); app.launch()
      XCTAssertTrue(app.staticTexts["Ready to request a PNG upload."].waitForExistence(timeout: 30), app.debugDescription)
      app.buttons["Arm picker " + action].tap(); openFiles(); capture(action + "-pending-system-picker")
      let code = action == "close" ? "proof-close" : action == "renderer" ? "renderer-stopped" : "session-reuse-blocked"
      XCTAssertTrue(app.staticTexts["Native host failed: " + code].waitForExistence(timeout: 20), app.debugDescription)
      let removed = [app.webViews.firstMatch, app.buttons["Cancel"]].map {
        XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == false"), object: $0)
      }
      XCTAssertEqual(XCTWaiter.wait(for: removed, timeout: 5), .completed, app.debugDescription)
      capture(action + "-native-revoked"); app.buttons["Open Upload Lab"].tap()
      XCTAssertTrue(app.staticTexts["Ready to request a PNG upload."].waitForExistence(timeout: 20), app.debugDescription)
      noFile(action + "-fresh-recipient-no-late-file")
    }
    openFiles()
    if app.buttons["Browse"].exists {app.buttons["Browse"].tap()}
    let phone = app.cells.matching(NSPredicate(format: "label CONTAINS %@", "On My iPhone")).firstMatch
    if phone.exists {phone.tap()}
    let folder = app.cells.matching(NSPredicate(format: "label BEGINSWITH %@", "Hypergolic")).firstMatch
    if folder.exists {folder.coordinate(withNormalizedOffset: CGVector(dx: 0.4, dy: 0.24)).tap()}
    let file = app.cells.matching(NSPredicate(format: "label BEGINSWITH %@", "photo-00-denied")).firstMatch
    let listing = app.collectionViews.matching(identifier: "File View").containing(NSPredicate(format: "label BEGINSWITH %@", "photo-")).firstMatch
    for _ in 0..<16 {if file.exists {break}; XCTAssertTrue(listing.exists, app.debugDescription); listing.swipeDown()}
    XCTAssertTrue(file.waitForExistence(timeout: 10), app.debugDescription); capture("malformed-photo-before-selection")
    file.coordinate(withNormalizedOffset: CGVector(dx: 0.18, dy: 0.32)).tap()
    if app.buttons["OK"].waitForExistence(timeout: 5) {app.buttons["OK"].tap()}
    XCTAssertTrue(app.buttons["Select a file"].waitForExistence(timeout: 10), app.debugDescription); noFile("malformed-photo-denied")
  }

  func testPickerCancellationAndBackground() throws {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "org.nostrocket.hypergolic.uploadfixture")
    func capture(_ name: String) {
      let image = XCTAttachment(screenshot: app.screenshot()); image.name = name; image.lifetime = .keepAlways; add(image)
      let tree = XCTAttachment(string: app.debugDescription); tree.name = name + "-accessibility"; tree.lifetime = .keepAlways; add(tree)
    }
    func openMenu() {
      let select = app.buttons["Select a file"]
      for _ in 0..<5 {if select.isHittable {break}; app.webViews.firstMatch.swipeUp()}
      XCTAssertTrue(select.isHittable, app.debugDescription); select.tap()
      XCTAssertTrue(app.buttons["Choose photo"].waitForExistence(timeout: 10), app.debugDescription)
    }
    func noFile(_ name: String) {
      XCTAssertFalse(app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH %@", "Selected bytes:")).firstMatch.exists, app.debugDescription)
      XCTAssertFalse(app.buttons["Request selected upload"].isEnabled, app.debugDescription)
      capture(name); print("UPLOAD_PICKER_DENIED:" + name); fflush(stdout); Thread.sleep(forTimeInterval: 2)
    }
    app.terminate(); app.launch()
    XCTAssertTrue(app.staticTexts["Ready to request a PNG upload."].waitForExistence(timeout: 30), app.debugDescription)
    openMenu(); app.buttons["Cancel"].tap(); noFile("menu-cancel")
    openMenu(); app.buttons["Choose photo"].tap()
    XCTAssertTrue(app.buttons["Cancel"].waitForExistence(timeout: 10), app.debugDescription); app.buttons["Cancel"].tap(); noFile("photo-cancel")
    openMenu(); app.buttons["Choose file"].tap()
    XCTAssertTrue(app.buttons["Cancel"].waitForExistence(timeout: 10), app.debugDescription); app.buttons["Cancel"].tap(); noFile("file-cancel")
    openMenu(); app.buttons["Choose photo"].tap()
    XCTAssertTrue(app.buttons["Cancel"].waitForExistence(timeout: 10), app.debugDescription); capture("photo-before-background")
    XCUIDevice.shared.press(.home); Thread.sleep(forTimeInterval: 2); app.activate()
    XCTAssertTrue(app.buttons["Select a file"].waitForExistence(timeout: 10), app.debugDescription)
    XCTAssertFalse(app.buttons["Choose photo"].exists, app.debugDescription); noFile("photo-background-revoked")
    openMenu(); app.buttons["Choose file"].tap()
    XCTAssertTrue(app.buttons["Cancel"].waitForExistence(timeout: 10), app.debugDescription); capture("file-before-background")
    XCUIDevice.shared.press(.home); Thread.sleep(forTimeInterval: 2); app.activate()
    XCTAssertTrue(app.buttons["Select a file"].waitForExistence(timeout: 10), app.debugDescription)
    XCTAssertFalse(app.buttons["Choose file"].exists, app.debugDescription); noFile("file-background-revoked")
    openMenu(); app.buttons["Cancel"].tap(); noFile("fresh-menu-after-revocation")
  }

}
