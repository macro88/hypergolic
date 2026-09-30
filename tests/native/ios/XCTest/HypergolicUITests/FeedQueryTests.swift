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
