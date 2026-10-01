import Foundation

@main struct UploadPngProof {
  static func main() throws {
    let root = URL(fileURLWithPath: CommandLine.arguments[1]); var checks = 0
    func check(_ value: Bool) {checks += 1; precondition(value, "PNG check \(checks)")}
    let accepted = ["valid","color"]
    let rejected = ["signature","truncated","crc","text","exif","icc","animation","unknown","duplicate-header","duplicate-color","late-color","interlaced","huge","bad-filter","short-pixels","extra-pixels","compressed-trailer","after-end","jpeg"]
    for name in accepted {let bytes = try Data(contentsOf: root.appendingPathComponent(name + ".png")); check(UploadPngProfile.prepare(bytes) == bytes)}
    for name in rejected {check(UploadPngProfile.prepare(try Data(contentsOf: root.appendingPathComponent(name + ".png"))) == nil)}
    let authority = NativeUploadAuthority(clock: {0}), session = authority.register("png-session", identity: String(repeating: "11", count: 32))!
    authority.setForeground(true); authority.focus(session)
    var bytes = try Data(contentsOf: root.appendingPathComponent("valid.png")); let original = bytes
    let request = authority.admit(session, length: bytes.count, destination: "https://files.example.org", mimeType: "text/plain")!
    check(authority.append(request, offset: 0, chunk: bytes)); bytes.resetBytes(in: 0..<bytes.count)
    let review = authority.sealPreparedPng(request); check(review != nil); check(review?.mimeType == "image/png")
    check(authority.preview(request, expected: review!) == original); check(authority.sealPreparedPng(request) == nil)
    authority.cancel(request)
    let metadata = try Data(contentsOf: root.appendingPathComponent("text.png"))
    let denied = authority.admit(session, length: metadata.count, destination: "https://files.example.org", mimeType: "image/png")!
    check(authority.append(denied, offset: 0, chunk: metadata)); check(authority.sealPreparedPng(denied) == nil); check(!authority.contains(denied))
    print("{\"language\":\"Swift\",\"uploadPngChecks\":\(checks),\"failed\":0}")
  }
}
