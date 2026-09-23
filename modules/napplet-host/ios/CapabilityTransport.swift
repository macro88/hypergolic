import Foundation
import CoreFoundation

/// React Native owns this immutable configuration. Requests cannot supply namespace fields.
struct CapabilityConfiguration {
  let snapshot: String
  let sessionId: String
  let fixture: String
  let domains: Set<String>
  init(_ raw: String, generation: String) throws {
    enum Invalid: Error { case configuration }
    guard raw.utf8.count <= 8192, let bytes = raw.data(using: .utf8),
      var value = try JSONSerialization.jsonObject(with: bytes) as? [String: Any],
      Set(value.keys) == Set(["sessionId", "epoch", "user", "publisher", "appId", "version", "instanceId", "fixture", "domains"])
      else { throw Invalid.configuration }
    for name in ["sessionId", "instanceId", "fixture"] {
      guard let text = value[name] as? String, text.range(of: "^[A-Za-z0-9_-]{1,80}$", options: .regularExpression) != nil else { throw Invalid.configuration }
    }
    for name in ["user", "publisher", "version"] {
      guard let text = value[name] as? String, text.range(of: "^[0-9a-f]{64}$", options: .regularExpression) != nil else { throw Invalid.configuration }
    }
    guard let appId = value["appId"] as? String, (1...1024).contains(appId.utf8.count),
      let epoch = value["epoch"] as? NSNumber, CFGetTypeID(epoch) != CFBooleanGetTypeID(),
      epoch.doubleValue.isFinite, epoch.doubleValue >= 0, epoch.doubleValue <= 9_007_199_254_740_991,
      epoch.doubleValue.rounded(.towardZero) == epoch.doubleValue,
      let domains = value["domains"] as? [String], domains.count == Set(domains).count,
      let fixture = value["fixture"] as? String, let sessionId = value["sessionId"] as? String else { throw Invalid.configuration }
    let expected: Set<String>
    switch fixture {
    case "ux-lab": expected = ["theme"]
    case "state-lab", "state-lab-peer": expected = ["identity", "storage", "theme"]
    case "approval-lab": expected = ["identity", "relay", "theme"]
    default: throw Invalid.configuration
    }
    guard Set(domains) == expected else { throw Invalid.configuration }
    value["generation"] = generation
    self.snapshot = String(decoding: try JSONSerialization.data(withJSONObject: value), as: UTF8.self)
    self.sessionId = sessionId
    self.fixture = fixture
    self.domains = expected
  }
  func request(_ message: String) throws -> String {
    let value = ["registration": try JSONSerialization.jsonObject(with: Data(snapshot.utf8)), "request": message] as [String: Any]
    return String(decoding: try JSONSerialization.data(withJSONObject: value), as: UTF8.self)
  }
  /// Recognition is deliberately narrow. Event validation and signing remain outside this transport.
  func approvalWireId(_ message: String) -> (recognized: Bool, wireId: String?) {
    guard domains.contains("relay"), let data = message.data(using: .utf8),
      let value = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
      value["type"] as? String == "relay.publish" else { return (false, nil) }
    guard let id = value["id"] as? String, (1...128).contains(id.utf8.count) else { return (true, nil) }
    return (true, id)
  }
}

/// Lease queries are synchronous across threads; WebKit reply closures remain main-actor isolated.
@MainActor
enum CapabilityTransport {
  nonisolated static let leases = CapabilityLeaseRegistry()
  private struct Pending {
    let generation: String
    let reply: @MainActor @Sendable (String?) -> Void
  }
  private static var pending: [String: Pending] = [:]
  static func admit(_ generation: String, sequence: UInt64, snapshot: String,
                    reply: @escaping @MainActor @Sendable (String?) -> Void) -> String? {
    guard let token = leases.admit(generation, sequence: sequence, snapshot: snapshot) else { return nil }
    pending[token] = Pending(generation: generation, reply: reply)
    DispatchQueue.main.asyncAfter(deadline: .now() + 25) {
      // ContinuousClock in the registry, not this cleanup timer, controls expiry during sleep.
      if !leases.isActive(token) { pending.removeValue(forKey: token)?.reply(nil) }
    }
    return token
  }
  nonisolated static func finish(_ token: String, response: String?) {
    let bounded = response.flatMap { $0.utf8.count <= CapabilityLeaseRegistry.maxBytes ? $0 : nil }
    Task { @MainActor in
      let admitted = leases.finish(token)
      guard let request = pending.removeValue(forKey: token) else { return }
      request.reply(admitted && leases.sessionActive(request.generation) ? bounded : nil)
    }
  }
  static func revoke(_ generation: String) {
    leases.revoke(generation)
    for token in pending.filter({ $0.value.generation == generation }).keys {
      pending.removeValue(forKey: token)?.reply(nil)
    }
  }
}
