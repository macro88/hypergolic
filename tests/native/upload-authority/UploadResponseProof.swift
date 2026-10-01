import Foundation

@main struct UploadResponseProof {
  static func main() throws {
    var checks = 0
    func check(_ value: @autoclosure () -> Bool) { checks += 1; precondition(value(), "Check \(checks)") }
    func denied(_ operation: () throws -> Void) { do { try operation(); preconditionFailure("Invalid response accepted") } catch { check(true) } }
    func wire(_ status: Int, _ headers: String, _ body: String) -> Data { Data("HTTP/1.1 \(status) Fixture\r\n\(headers)\r\n\(body)".utf8) }
    for status in [200,201] {
      let response = try PublishedHTTPResponse.parse(wire(status, "Content-Length: 2\r\n", "{}"), maximumBodyBytes: 32768, uploadProfile: true)
      check(response.status == status); check(response.body == Data("{}".utf8))
      let chunks = try PublishedHTTPResponse.parse(wire(status, "Transfer-Encoding: chunked\r\n", "2\r\n{}\r\n0\r\n\r\n"), maximumBodyBytes: 32768, uploadProfile: true)
      check(chunks.body.count == 2)
      let accumulator = try PublishedHTTPResponseAccumulator(maximumBodyBytes: 32768, uploadProfile: true)
      try accumulator.append(wire(status, "Content-Length: 2\r\n", "{}")); let complete = try accumulator.finish(); check(complete.status == status)
    }
    denied { _ = try PublishedHTTPResponse.parse(wire(201, "Content-Length: 2\r\n", "{}")) }
    denied { _ = try PublishedHTTPResponse.parse(wire(201, "Content-Length: 2\r\n", "{}"), maximumBodyBytes: 10485760, resourceProfile: true) }
    for status in [202,204,400,401,402,403,409,413,415,429,500,503] {
      do { _ = try PublishedHTTPResponse.parse(wire(status, "Content-Length: 0\r\n", ""), maximumBodyBytes: 32768, uploadProfile: true); preconditionFailure("Status accepted") }
      catch PublishedHTTPResponse.Failure.uploadStatus(let actual) { check(actual == status) }
      let accumulator = try PublishedHTTPResponseAccumulator(maximumBodyBytes: 32768, uploadProfile: true)
      denied { try accumulator.append(wire(status, "Content-Length: 0\r\n", "")) }
    }
    for status in [301,302,303,307,308] {
      denied { _ = try PublishedHTTPResponse.parse(wire(status, "Location: https://other.example.com/upload\r\nContent-Length: 0\r\n", ""), maximumBodyBytes: 32768, uploadProfile: true) }
    }
    for headers in ["Content-Length: 2\r\nContent-Length: 2\r\n", "Content-Length: 2\r\nTransfer-Encoding: chunked\r\n",
      "Content-Length: 2\r\nContent-Encoding: gzip\r\n", "Content-Length: 2\r\nLocation: https://other.example.com/upload\r\n",
      "Content-Length: 2\r\nConnection: close\r\nConnection: close\r\n", "Content-Length: 32769\r\n", "Content-Length: 3\r\n"] {
      denied { _ = try PublishedHTTPResponse.parse(wire(201, headers, "{}"), maximumBodyBytes: 32768, uploadProfile: true) }
    }
    denied { _ = try PublishedHTTPResponseAccumulator(maximumBodyBytes: 32769, uploadProfile: true) }
    denied { _ = try PublishedHTTPResponse.parse(wire(200, "Content-Length: 0\r\n", ""), maximumBodyBytes: 32768, resourceProfile: true, uploadProfile: true) }
    print("{\"language\":\"Swift\",\"uploadResponseChecks\":\(checks),\"failed\":0}")
  }
}
