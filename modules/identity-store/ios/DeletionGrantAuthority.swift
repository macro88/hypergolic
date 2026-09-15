import Foundation
import Synchronization

public struct NativeVaultInventory: Equatable, Sendable {
  let vaultID: String
  let revision: UInt64
  let selectedPubkey: String
  let receiptDigest: Data
  let identityDigests: [String: Data]
}
public protocol NativeVaultStateObserver: Sendable {
  func validatedInventory(_ value: NativeVaultInventory)
  func willMutateVault()
}
protocol DeletionClock: Sendable { func now() -> Duration }
struct ContinuousDeletionClock: DeletionClock {
  private let origin = ContinuousClock.now
  func now() -> Duration { origin.duration(to: .now) }
}
protocol DeviceDeletionAuthentication: Sendable {
  @MainActor func authenticate(attemptID: UInt64, canPresent: @escaping @Sendable () -> Bool) async throws
  @MainActor func cancel(attemptID: UInt64)
}

enum DeletionActionFailure: String, Error, Sendable {
  case unavailable, denied, busy, staleContext, invalidInput
}

/// Native-only state: callers can request a target, but cannot assert its selection, existence or epoch.
/// The synchronous consume port is called by the file actor after a fresh native inventory validation.
final class DeletionGrantAuthority: NativeIdentityGrantOwner, NativeVaultStateObserver, Sendable {
  typealias InventoryReader = @Sendable () async throws -> NativeVaultInventory
  private struct Binding: Equatable, Sendable {
    let runtime: String
    let epoch: UInt64
    let inventory: NativeVaultInventory
  }
  private struct Attempt: Sendable {
    let id: UInt64
    let binding: Binding
    let settings: String
    let target: String
    let deadline: Duration
  }
  private struct Grant: Sendable {
    let attempt: Attempt
    let token: String
    let deadline: Duration
  }
  private struct State: Sendable {
    var runtime: String?
    var epoch: UInt64 = 0
    var nextAttempt: UInt64 = 0
    var foreground = false
    var protectedData = false
    var inventory: NativeVaultInventory?
    var binding: Binding?
    var settings: String?
    var attempt: Attempt?
    var grant: Grant?
  }
  private let state = Mutex(State())
  private let readInventory: InventoryReader
  private let authentication: any DeviceDeletionAuthentication
  private let clock: any DeletionClock
  private let entropy: any EntropySource
  private let authenticationLifetime: Duration = .seconds(60)
  private let grantLifetime: Duration = .seconds(15)

  init(readInventory: @escaping InventoryReader, authentication: any DeviceDeletionAuthentication,
    clock: any DeletionClock = ContinuousDeletionClock(), entropy: any EntropySource = SystemEntropy()) {
    self.readInventory = readInventory; self.authentication = authentication; self.clock = clock; self.entropy = entropy
  }
  private func invalidate(_ value: inout State, clearInventory: Bool = false) -> UInt64? {
    let attemptID = value.attempt?.id
    // Exhaustion stays permanently unavailable; never wrap an epoch and revive an old binding.
    if value.epoch < UInt64.max { value.epoch += 1 }
    value.binding = nil; value.settings = nil; value.attempt = nil; value.grant = nil
    if clearInventory { value.inventory = nil }
    return attemptID
  }
  private func cancelPrompt(_ id: UInt64?) {
    guard let id else { return }
    Task { @MainActor [authentication] in authentication.cancel(attemptID: id) }
  }
  private func opaqueToken(using source: any EntropySource) throws -> String {
    var bytes: Data
    do { bytes = try source.bytes(count: 32) } catch { throw DeletionActionFailure.unavailable }
    defer { bytes.resetBytes(in: 0..<bytes.count) }
    guard bytes.count == 32 else { throw DeletionActionFailure.unavailable }
    return bytes.map { String(format: "%02x", $0) }.joined()
  }
  private func owns(_ value: State, runtime: String) -> Bool {
    value.runtime == runtime && value.epoch < UInt64.max && value.foreground && value.protectedData
  }
  private func matches(_ attempt: Attempt, _ value: State) -> Bool {
    owns(value, runtime: attempt.binding.runtime) && value.binding == attempt.binding
      && value.inventory == attempt.binding.inventory && value.settings == attempt.settings
  }
  func reserveRuntimeReplacement(entropy: any EntropySource) throws -> String {
    let (epoch, cancelled) = state.withLock { state -> (UInt64, UInt64?) in
      let old = invalidate(&state); state.runtime = nil; return (state.epoch, old)
    }
    cancelPrompt(cancelled)
    let runtime = try opaqueToken(using: entropy)
    return try state.withLock { state in
      // Another replacement or invalidation can start while native entropy is obtained.
      // An older reservation must never overwrite the newer owner when it finishes late.
      guard state.epoch == epoch, epoch < UInt64.max, state.runtime == nil else { throw DeletionActionFailure.staleContext }
      state.runtime = runtime
      return runtime
    }
  }
  /// IDs originate from the native factory lease; no JS method accepts an owner identity.
  func replaceRuntime(_ runtime: String) throws {
    guard BridgeBounds.isToken(runtime) else { throw DeletionActionFailure.invalidInput }
    let cancelled = state.withLock { state in
      let old = invalidate(&state); state.runtime = runtime; return old
    }
    cancelPrompt(cancelled)
  }
  func disposeRuntime(_ runtime: String) {
    let cancelled = state.withLock { state -> UInt64? in
      guard state.runtime == runtime else { return nil }
      let old = invalidate(&state); state.runtime = nil; return old
    }
    cancelPrompt(cancelled)
  }
  /// Driven only by UIApplication state/notifications. Inactive does not mean background.
  func updateApplication(foreground: Bool, protectedData: Bool) {
    let cancelled = state.withLock { state -> UInt64? in
      state.foreground = foreground; state.protectedData = protectedData
      return foreground && protectedData ? nil : invalidate(&state)
    }
    cancelPrompt(cancelled)
  }
  func willMutateVault() {
    let cancelled = state.withLock { invalidate(&$0, clearInventory: true) }
    cancelPrompt(cancelled)
  }
  func validatedInventory(_ value: NativeVaultInventory) {
    let cancelled = state.withLock { state -> UInt64? in
      let changed = state.inventory != nil && state.inventory != value
      let old = changed ? invalidate(&state) : nil
      state.inventory = value
      return old
    }
    cancelPrompt(cancelled)
  }
  func setContext(runtime: String, expectedSelected: String, expectedRevision: UInt64) async throws {
    guard Receipt.isPubkey(expectedSelected), expectedRevision > 0,
      expectedRevision <= 9_007_199_254_740_991 else { throw DeletionActionFailure.invalidInput }
    let (epoch, cancelled) = try state.withLock { state -> (UInt64, UInt64?) in
      guard owns(state, runtime: runtime) else { throw DeletionActionFailure.staleContext }
      let old = invalidate(&state); return (state.epoch, old)
    }
    cancelPrompt(cancelled)
    let inventory: NativeVaultInventory
    do { inventory = try await readInventory() } catch { throw DeletionActionFailure.unavailable }
    try state.withLock { state in
      guard owns(state, runtime: runtime), state.epoch == epoch, state.inventory == inventory,
        inventory.selectedPubkey == expectedSelected, inventory.revision == expectedRevision else { throw DeletionActionFailure.staleContext }
      state.binding = Binding(runtime: runtime, epoch: epoch, inventory: inventory)
    }
  }
  func beginSettings(runtime: String) throws -> String {
    let session = try opaqueToken(using: entropy)
    let cancelled = try state.withLock { state -> UInt64? in
      guard owns(state, runtime: runtime), let binding = state.binding,
        binding.epoch == state.epoch, binding.inventory == state.inventory else { throw DeletionActionFailure.staleContext }
      let old = state.attempt?.id
      state.settings = session; state.attempt = nil; state.grant = nil
      return old
    }
    cancelPrompt(cancelled)
    return session
  }
  func dismissSettings(runtime: String, settings: String) {
    let cancelled = state.withLock { state -> UInt64? in
      guard state.runtime == runtime, state.settings == settings else { return nil }
      let old = state.attempt?.id; state.settings = nil; state.attempt = nil; state.grant = nil; return old
    }
    cancelPrompt(cancelled)
  }
  func cancelDeletion(runtime: String, settings: String) {
    let cancelled = state.withLock { state -> UInt64? in
      guard state.runtime == runtime, state.settings == settings else { return nil }
      let old = state.attempt?.id; state.attempt = nil; state.grant = nil; return old
    }
    cancelPrompt(cancelled)
  }
  func assertExpectedContext(runtime: String, settings: String, selected: String, revision: UInt64) throws {
    guard Receipt.isPubkey(selected), revision > 0, revision <= 9_007_199_254_740_991 else { throw DeletionActionFailure.invalidInput }
    try state.withLock { state in
      guard owns(state, runtime: runtime), state.settings == settings, let binding = state.binding,
        binding.epoch == state.epoch, binding.inventory == state.inventory,
        binding.inventory.selectedPubkey == selected, binding.inventory.revision == revision else { throw DeletionActionFailure.staleContext }
    }
  }
  func assertDeletionGrant(runtime: String, settings: String, token: String, target: String) throws {
    guard BridgeBounds.isToken(settings), BridgeBounds.isToken(token), Receipt.isPubkey(target) else { throw DeletionActionFailure.invalidInput }
    try state.withLock { state in
      guard let grant = state.grant, grant.token == token, grant.attempt.target == target,
        grant.attempt.binding.runtime == runtime, grant.attempt.settings == settings,
        matches(grant.attempt, state), clock.now() < grant.deadline else { throw DeletionActionFailure.denied }
    }
  }
  private func currentAttempt(_ id: UInt64) -> Bool {
    state.withLock { state in
      guard let attempt = state.attempt, attempt.id == id else { return false }
      return matches(attempt, state) && clock.now() < attempt.deadline
    }
  }
  private func cancelAttempt(_ id: UInt64) {
    let cancelled = state.withLock { state -> UInt64? in
      if state.grant?.attempt.id == id { state.grant = nil }
      guard state.attempt?.id == id else { return nil }
      state.attempt = nil; return id
    }
    cancelPrompt(cancelled)
  }
  func authorizeDeletion(runtime: String, settings: String, target: String) async throws -> String {
    guard BridgeBounds.isToken(settings), Receipt.isPubkey(target) else { throw DeletionActionFailure.invalidInput }
    let attempt = try state.withLock { state -> Attempt in
      if let grant = state.grant, clock.now() >= grant.deadline { state.grant = nil }
      guard owns(state, runtime: runtime), let binding = state.binding, state.settings == settings,
        binding.inventory == state.inventory, binding.epoch == state.epoch else { throw DeletionActionFailure.staleContext }
      guard binding.inventory.identityDigests.count >= 2, binding.inventory.selectedPubkey != target,
        binding.inventory.identityDigests[target] != nil else { throw DeletionActionFailure.denied }
      guard state.attempt == nil, state.grant == nil else { throw DeletionActionFailure.busy }
      guard state.nextAttempt < UInt64.max else { throw DeletionActionFailure.unavailable }
      state.nextAttempt += 1
      let value = Attempt(id: state.nextAttempt, binding: binding, settings: settings, target: target,
        deadline: clock.now() + authenticationLifetime)
      state.attempt = value; return value
    }
    let timeout = Task { [weak self] in
      do { try await Task.sleep(for: .seconds(60)) } catch { return }
      self?.cancelAttempt(attempt.id)
    }
    defer {
      timeout.cancel()
      state.withLock { if $0.attempt?.id == attempt.id { $0.attempt = nil } }
    }
    return try await withTaskCancellationHandler {
      do {
        let initial = try await readInventory()
        guard initial == attempt.binding.inventory, currentAttempt(attempt.id), !Task.isCancelled else { throw DeletionActionFailure.denied }
        try await authentication.authenticate(attemptID: attempt.id) { [weak self] in self?.currentAttempt(attempt.id) == true }
        guard currentAttempt(attempt.id), !Task.isCancelled else { throw DeletionActionFailure.denied }
        let refreshed = try await readInventory()
        guard refreshed == attempt.binding.inventory else { throw DeletionActionFailure.denied }
        let token = try opaqueToken(using: entropy)
        return try state.withLock { state in
          guard state.attempt?.id == attempt.id, matches(attempt, state), clock.now() < attempt.deadline,
            !Task.isCancelled else { throw DeletionActionFailure.denied }
          state.grant = Grant(attempt: attempt, token: token, deadline: clock.now() + grantLifetime)
          state.attempt = nil
          return token
        }
      } catch {
        cancelAttempt(attempt.id)
        throw error as? DeletionActionFailure ?? .denied
      }
    } onCancel: { [weak self] in self?.cancelAttempt(attempt.id) }
  }
  func consumeDeletionGrant(token: String, targetPubkey: String) throws {
    try state.withLock { state in
      guard let grant = state.grant, grant.token == token, grant.attempt.target == targetPubkey,
        matches(grant.attempt, state), clock.now() < grant.deadline else { throw DeletionActionFailure.denied }
      state.grant = nil // Linearization point: exact grant consumed once before the file actor erases.
    }
  }
}
