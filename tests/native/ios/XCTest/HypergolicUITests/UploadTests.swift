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
}
