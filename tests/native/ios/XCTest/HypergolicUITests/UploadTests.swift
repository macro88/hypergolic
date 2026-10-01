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

}
