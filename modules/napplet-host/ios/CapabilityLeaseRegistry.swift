import Foundation

/// Synchronous native authority. All mutable state is protected by the same lock;
/// no UIKit/WebKit reference or user key is stored here.
final class CapabilityLeaseRegistry: @unchecked Sendable {
  static let maxBytes = 2 * 1024 * 1024
  private struct Session { var sequence: UInt64 = 0 }
  private struct Request {
    let generation: String
    let snapshot: String
    let expires: ContinuousClock.Instant
    var claimed = false
  }
  private let lock = NSLock()
  private let now: @Sendable () -> ContinuousClock.Instant
  private var sessions: [String: Session] = [:]
  private var requests: [String: Request] = [:]

  init(now: @escaping @Sendable () -> ContinuousClock.Instant = { ContinuousClock.now }) {
    self.now = now
  }
  func register(_ generation: String) -> Bool {
    lock.withLock {
      guard generation.range(of: "^[A-Za-z0-9_-]{1,80}$", options: .regularExpression) != nil,
        sessions[generation] == nil, sessions.count < 64 else { return false }
      sessions[generation] = Session()
      return true
    }
  }
  func sessionActive(_ generation: String) -> Bool { lock.withLock { sessions[generation] != nil } }
  func revoke(_ generation: String) {
    lock.withLock {
      sessions.removeValue(forKey: generation)
      requests = requests.filter { $0.value.generation != generation }
    }
  }
  /// Snapshot is complete JSON constructed by the host from native registration and the original serialized request.
  func admit(_ generation: String, sequence: UInt64, snapshot: String) -> String? {
    lock.withLock {
      prune()
      guard var session = sessions[generation], sequence > 0,
        sequence <= 9_007_199_254_740_991, sequence == session.sequence + 1 else { return nil }
      // Overload consumes its transport sequence; a dropped request cannot become a later replay.
      session.sequence = sequence
      sessions[generation] = session
      guard snapshot.utf8.count <= Self.maxBytes, requests.count < 8,
        requests.values.filter({ $0.generation == generation }).count < 4 else { return nil }
      let token = UUID().uuidString.lowercased()
      requests[token] = Request(generation: generation, snapshot: snapshot, expires: now().advanced(by: .seconds(25)))
      return token
    }
  }
  func take(_ token: String) -> String? {
    lock.withLock {
      prune()
      guard var request = requests[token], !request.claimed, sessions[request.generation] != nil else { return nil }
      request.claimed = true
      requests[token] = request
      return request.snapshot
    }
  }
  func isActive(_ token: String) -> Bool {
    lock.withLock {
      prune()
      guard let request = requests[token] else { return false }
      return request.claimed && sessions[request.generation] != nil
    }
  }
  /// Consumes exactly this request. Delivery must still recheck its generation on the main actor.
  func finish(_ token: String) -> Bool {
    lock.withLock {
      prune()
      guard let request = requests.removeValue(forKey: token) else { return false }
      return request.claimed && sessions[request.generation] != nil
    }
  }
  private func prune() {
    let current = now()
    requests = requests.filter { current < $0.value.expires && sessions[$0.value.generation] != nil }
  }
}
