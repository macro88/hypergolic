import Foundation
import CryptoKit

// Composition stub only for the static facade; tested registries receive the actual native lease core.
enum CapabilityTransport { static let leases = CapabilityLeaseRegistry() }

@MainActor @main struct PlanProof {
  static var assertions = 0
  static func check(_ value: Bool) { assertions += 1; precondition(value, "Plan assertion \(assertions)") }
  static func denied(_ work: () throws -> Void) { assertions += 1; do { try work() } catch { return }; preconditionFailure("Expected denial") }
  static func wire(_ value: Any) throws -> String { String(decoding: try JSONSerialization.data(withJSONObject: value), as: UTF8.self) }
  static func main() throws {
    let data = try Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1]))
    let fixture = try JSONSerialization.jsonObject(with: data) as! [String: Any]
    let snapshot = fixture["snapshot"] as! String, raw = try wire(fixture["plan"]!)
    let primary = try wire(fixture["primary"]!), list = try wire(fixture["list"]!)
    let plan = try NativeOutboxPlan.capture(snapshot: snapshot, raw: raw)
    check(plan.destinations.count == 2); let relay = plan.destinations[0]
    let send = try plan.reserve(group: "primary", wire: primary, relay: relay)
    check(send.eventId == (fixture["primary"] as! [String: Any])["id"] as! String)
    check(send.frame.hasPrefix("[\"EVENT\",")); check(!send.wasAttempted)
    denied { _ = try plan.reserve(group: "primary", wire: primary, relay: relay) }
    check(try plan.reserve(group: "relay-list", wire: list, relay: relay).eventId == (fixture["list"] as! [String: Any])["id"] as! String)
    denied { _ = try plan.reserve(group: "relay-list", wire: list, relay: relay) }
    denied { _ = try plan.reserve(group: "primary", wire: primary, relay: "wss://elsewhere.org/") }
    denied { _ = try plan.reserve(group: "unknown", wire: primary, relay: plan.destinations[1]) }
    var changed = fixture["primary"] as! [String: Any]; changed["content"] = "changed"
    denied { _ = try plan.reserve(group: "primary", wire: wire(changed), relay: plan.destinations[1]) }
    changed = fixture["primary"] as! [String: Any]; changed["sig"] = String(repeating: "0", count: 128)
    denied { _ = try plan.reserve(group: "primary", wire: wire(changed), relay: plan.destinations[1]) }
    check(try plan.reserve(group: "primary", wire: primary, relay: plan.destinations[1]).deadline == send.deadline)
    for key in ["selectedPubkey", "hash"] {
      var mutation = fixture["plan"] as! [String: Any]; var event = mutation["event"] as! [String: Any]
      event[key] = String(repeating: "0", count: 64); mutation["event"] = event
      denied { _ = try NativeOutboxPlan.capture(snapshot: snapshot, raw: wire(mutation)) }
    }
    var noGrant = try JSONSerialization.jsonObject(with: Data(snapshot.utf8)) as! [String: Any]
    var registration = noGrant["registration"] as! [String: Any]; registration["domains"] = ["relay"]; noGrant["registration"] = registration
    denied { _ = try NativeOutboxPlan.capture(snapshot: wire(noGrant), raw: raw) }
    denied { _ = try NativeOutboxPlan.capture(snapshot: snapshot, raw: String(repeating: "[", count: 30) + "0" + String(repeating: "]", count: 30)) }
    let leases = CapabilityLeaseRegistry(); check(leases.register("owner-a"))
    let registry = ApprovalTransportRegistry(leases: leases, schedule: { _, _ in })
    check(registry.register("owner-a")); registry.setForeground(true); registry.setFocused("owner-a", active: true)
    let token = registry.admit("owner-a", snapshot: snapshot, wireId: "native-outbox-publication", reply: { _ in })!
    check(registry.take(token) == snapshot); check(!registry.mayReview(token)); check(!registry.approve(token))
    check(registry.prepareOutbox(token, raw: raw)); check(!registry.prepareOutbox(token, raw: raw))
    check(registry.mayReview(token)); check(registry.approve(token)); check(!registry.prepareOutbox(token, raw: raw))
    let operation = try registry.reserveOutbox(token, group: "primary", wire: primary, relay: relay)
    var sends = 0
    denied { try registry.sendOutbox(token, operation: send) { sends += 1 } }; check(sends == 0)
    try registry.sendOutbox(token, operation: operation) { sends += 1 }; check(sends == 1)
    denied { try registry.sendOutbox(token, operation: operation) { sends += 1 } }; check(sends == 1)
    let next = try registry.reserveOutbox(token, group: "primary", wire: primary, relay: plan.destinations[1])
    registry.setForeground(false)
    denied { try registry.sendOutbox(token, operation: next) { sends += 1 } }; check(sends == 1)
    registry.setForeground(true); registry.resume()
    denied { try registry.sendOutbox(token, operation: next) { sends += 1 } }; check(sends == 1)
    var tooLarge = fixture["plan"] as! [String: Any], largeEvent = (tooLarge["event"] as! [String: Any])["event"] as! [String: Any]
    largeEvent["content"] = String(repeating: "x", count: 8192)
    let canonical: [Any] = [0, (fixture["primary"] as! [String: Any])["pubkey"]!, largeEvent["created_at"]!, largeEvent["kind"]!, largeEvent["tags"]!, largeEvent["content"]!]
    let largeHash = SHA256.hash(data: try JSONSerialization.data(withJSONObject: canonical, options: [.withoutEscapingSlashes])).map { String(format: "%02x", $0) }.joined()
    var largeCaptured = tooLarge["event"] as! [String: Any]; largeCaptured["event"] = largeEvent; largeCaptured["hash"] = largeHash; tooLarge["event"] = largeCaptured
    var largeSnapshot = try JSONSerialization.jsonObject(with: Data(snapshot.utf8)) as! [String: Any]
    var largeRequest = try JSONSerialization.jsonObject(with: Data((largeSnapshot["request"] as! String).utf8)) as! [String: Any]; largeRequest["event"] = largeEvent; largeSnapshot["request"] = try wire(largeRequest)
    denied { _ = try NativeOutboxPlan.capture(snapshot: wire(largeSnapshot), raw: wire(tooLarge)) }
    let ack = OutboxAcknowledgement(send.eventId)
    check(try ack.classify("[\"NOTICE\",\"ordinary\"]") == .other); check(ack.result == nil)
    check(try ack.classify("[\"OK\",\"wrong-id\",true,\"other\"]") == .other); check(ack.result == nil)
    denied { _ = try ack.classify("[\"OK\",\"\(send.eventId)\",1,\"bad\"]") }; check(ack.result == nil)
    check(try ack.classify("[\"OK\",\"\(send.eventId)\",true,\"accepted\"]") == .eose)
    check(ack.result?.accepted == true); check(ack.result?.reason == "accepted")
    denied { _ = try ack.classify("invalid JSON") }; check(ack.result?.accepted == true)
    _ = try ack.classify("[\"OK\",\"\(send.eventId)\",false,\"later contradictory response\"]"); check(ack.result?.accepted == true)
    let rejected = OutboxAcknowledgement(send.eventId)
    _ = try rejected.classify("[\"OK\",\"\(send.eventId)\",false,\"blocked\"]")
    check(rejected.result?.accepted == false); check(rejected.result?.reason == "blocked")
    print("{\"status\":\"passed\",\"assertions\":\(assertions),\"scope\":\"native plan and approval core only\"}")
  }
}
