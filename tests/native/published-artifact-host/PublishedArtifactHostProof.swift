import CryptoKit
import Foundation

@main private struct PublishedArtifactHostProof {
  static func main() throws {
    var checks = 0
    func check(_ condition: Bool, _ label: String) throws {
      guard condition else { throw NSError(domain: label, code: 1) }
      checks += 1
    }
    func hash(_ data: Data) -> String {
      SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined()
    }
    let html = Data(repeating: 0x61, count: PublishedArtifactRegistry.maximumHTMLBytes)
    let htmlHash = hash(html)
    let version = hash(Data("\(htmlHash) /index.html\n".utf8))
    let publisher = String(repeating: "a", count: 64)
    let eventId = String(repeating: "b", count: 64)
    let session = "session-a"
    let appId = "test-napplet"
    let generation = UUID().uuidString.lowercased()
    let registry = PublishedArtifactRegistry()
    try check(registry.registerSession(session), "register owner session")
    let claims = PublishedArtifactRegistry.Claims(sessionId: session, publisher: publisher,
      identifier: appId, eventId: eventId, aggregateHash: version, htmlHash: htmlHash)
    let handle = registry.stage(html, claims: claims)!
    let fields: [String: Any] = ["sessionId": session, "publisher": publisher,
      "appId": appId, "eventId": eventId, "version": version, "htmlHash": htmlHash, "handle": handle]
    func json(_ object: [String: Any]) throws -> String {
      String(decoding: try JSONSerialization.data(withJSONObject: object), as: UTF8.self)
    }
    let input = PublishedArtifactHostInput(try json(fields))
    try check(input?.claims == claims && input?.handle == handle, "exact bounded prop")
    let claimed = registry.claim(input!.handle, claims: input!.claims, viewGeneration: generation)
    try check(claimed != nil, "native host claim")
    try check(registry.claim(handle, claims: claims, viewGeneration: generation) == nil, "claim replay denied")
    let reader = PublishedArtifactReadOwner(claimed: claimed!)
    var collected = Data()
    var sequence = 0
    while collected.count < html.count {
      let text = reader.read(sequence: sequence)
      try check(text != nil, "sequential read")
      let object = try JSONSerialization.jsonObject(with: Data(text!.utf8)) as! [String: Any]
      let base64 = object["base64"] as? String
      let bytes = base64.flatMap { Data(base64Encoded: $0) }
      try check(bytes != nil && bytes!.base64EncodedString() == base64, "canonical Base64")
      try check(bytes!.count >= 1 && bytes!.count <= PublishedArtifactTransfer.maximumChunkBytes,
        "48 KiB chunk ceiling")
      try check(object["type"] as? String == "artifact.chunk" && object["sessionId"] as? String == generation &&
        object["sequence"] as? Int == sequence && object["byteLength"] as? Int == bytes!.count &&
        object["totalBytes"] as? Int == html.count, "exact sequence and lengths")
      try check(object["publisher"] as? String == publisher && object["appId"] as? String == appId &&
        object["eventId"] as? String == eventId && object["version"] as? String == version &&
        object["htmlHash"] as? String == htmlHash, "immutable claims returned")
      collected.append(bytes!)
      try check(object["done"] as? Bool == (collected.count == html.count), "final marker")
      sequence += 1
    }
    try check(collected == html, "all genuine bytes delivered")
    try check(reader.read(sequence: sequence) == nil, "bytes cleared after final read")
    var extra = fields
    extra["html"] = "do not accept"
    try check(PublishedArtifactHostInput(try json(extra)) == nil, "extra prop denied")
    extra = fields
    extra["publisher"] = publisher.uppercased()
    try check(PublishedArtifactHostInput(try json(extra)) == nil, "uppercase hash denied")
    extra = fields
    extra["appId"] = String(repeating: "x", count: 256)
    try check(PublishedArtifactHostInput(try json(extra)) == nil, "long app ID denied")
    extra = fields
    extra["handle"] = "public-path"
    try check(PublishedArtifactHostInput(try json(extra)) == nil, "nonopaque handle denied")
    let second = registry.stage(html, claims: claims)!
    let skipped = PublishedArtifactReadOwner(claimed: registry.claim(second, claims: claims, viewGeneration: "view-2")!)
    try check(skipped.read(sequence: 1) == nil, "skipped read denied")
    try check(skipped.read(sequence: 0) == nil, "invalid read clears bytes")
    let third = registry.stage(html, claims: claims)!
    let duplicate = PublishedArtifactReadOwner(claimed: registry.claim(third, claims: claims, viewGeneration: "view-3")!)
    try check(duplicate.read(sequence: 0) != nil, "first read")
    try check(duplicate.read(sequence: 0) == nil, "duplicate read denied")
    try check(duplicate.read(sequence: 1) == nil, "duplicate clears bytes")
    print("{\"language\":\"Swift\",\"checks\":\(checks),\"failed\":0}")
  }
}
