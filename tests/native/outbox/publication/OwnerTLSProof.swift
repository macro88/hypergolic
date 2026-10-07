import Foundation
import Network

// Host composition only; all tested lease/approval/publication implementations are production.
enum CapabilityTransport { static let leases = CapabilityLeaseRegistry() }

@main struct OwnerTLSProof {
  static func main() async throws {
    let args = CommandLine.arguments, mode = args[3], port = UInt16(args[1])!
    let fixture = try JSONSerialization.jsonObject(with: Data(contentsOf: URL(fileURLWithPath: args[4]))) as! [String: Any]
    func wire(_ value: Any) throws -> String { String(decoding: try JSONSerialization.data(withJSONObject: value), as: UTF8.self) }
    let generation = "owner-" + mode, snapshot = fixture["snapshot"] as! String
    precondition(CapabilityTransport.leases.register(generation))
    let registry = ApprovalTransport.registry
    precondition(registry.register(generation)); registry.setForeground(true); registry.setFocused(generation, active: true)
    defer { registry.revoke(generation); CapabilityTransport.leases.revoke(generation) }
    let token = registry.admit(generation, snapshot: snapshot, wireId: "native-outbox-publication", reply: { _ in })!
    precondition(registry.take(token) == snapshot)
    let plan = try wire(fixture["plan"]!)
    precondition(registry.prepareOutbox(token, raw: plan))
    precondition(registry.approve(token)); precondition(registry.isApproved(token))
    let address = PublishedPinnedHTTPS.Address(host: .ipv4(IPv4Address("127.0.0.1")!), bytes: Data([127, 0, 0, 1]))
    let owner = OutboxPublicationOwner(proofTarget: .init(url: "wss://relay.example.org:\(port)/fixture", addresses: [address],
      anchorDER: try Data(contentsOf: URL(fileURLWithPath: args[2])), beforeSend: {
        if mode == "revoke-before-send" { registry.setForeground(false) }
      }))
    let primary = fixture["primary"] as! [String: Any]
    let raw = try await owner.publish(token: token, group: "primary", event: wire(primary), relay: "wss://relay.damus.io/")
    let receipt = try JSONSerialization.jsonObject(with: Data(raw.utf8)) as! [String: String]
    precondition(Set(receipt.keys) == Set(["relay", "eventId", "status", "reason"]))
    precondition(receipt["eventId"] == primary["id"] as? String)
    precondition(receipt["relay"] == "wss://relay.damus.io/")
    let expected = mode == "accepted" || mode == "accepted-close" ? "accepted" : mode == "rejected" ? "rejected" : mode == "revoke-before-send" ? "cancelled-before-send" : "unknown"
    precondition(receipt["status"] == expected)
    print(try wire(["mode": mode, "status": "passed", "receipt": receipt, "scope": "Actual owner/WSS controlled host proof; no device, signer, guest admission or public DNS proof"]))
  }
}
