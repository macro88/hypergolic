import Foundation
import LocalAuthentication

struct SystemDeviceDeletionAuthentication: DeviceDeletionAuthentication {
  @MainActor static func isAvailable() -> Bool {
    guard let description = Bundle.main.object(forInfoDictionaryKey: "NSFaceIDUsageDescription") as? String,
      !description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return false }
    let context = LAContext()
    defer { context.invalidate() }
    var error: NSError?
    return context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) && error == nil
  }
  @MainActor func authenticate(attemptID: UInt64, canPresent: @escaping @Sendable () -> Bool) async throws {
    try await DeviceAuthenticationProcess.shared.authenticate(attemptID: attemptID, canPresent: canPresent)
  }
  @MainActor func cancel(attemptID: UInt64) { DeviceAuthenticationProcess.shared.cancel(attemptID: attemptID) }
}

/// LAContext and its continuation are confined to MainActor; the system callback has no authority.
@MainActor private final class DeviceAuthenticationProcess {
  static let shared = DeviceAuthenticationProcess()
  private struct Pending {
    let id: UInt64
    let context: LAContext
    let continuation: CheckedContinuation<Void, any Error>
  }
  private var pending: Pending?
  func authenticate(attemptID: UInt64, canPresent: @escaping @Sendable () -> Bool) async throws {
    guard pending == nil else { throw DeletionActionFailure.busy }
    guard canPresent(), !Task.isCancelled else { throw DeletionActionFailure.denied }
    // Always configure this in the app bundle before exposing the feature; no Face ID crash path.
    guard let description = Bundle.main.object(forInfoDictionaryKey: "NSFaceIDUsageDescription") as? String,
      !description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { throw DeletionActionFailure.unavailable }
    let context = LAContext()
    context.localizedCancelTitle = "Cancel"
    context.interactionNotAllowed = false
    context.touchIDAuthenticationAllowableReuseDuration = 0
    var error: NSError?
    // This policy supports passcode fallback and fails when a device passcode is not enabled.
    guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error), error == nil else {
      context.invalidate(); throw DeletionActionFailure.unavailable
    }
    guard canPresent(), !Task.isCancelled else { context.invalidate(); throw DeletionActionFailure.denied }
    try await withTaskCancellationHandler {
      try await withCheckedThrowingContinuation { continuation in
        pending = Pending(id: attemptID, context: context, continuation: continuation)
        context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: "Authenticate to delete this identity.") { [weak self] success, error in
          let accepted = success && error == nil
          Task { @MainActor in self?.complete(attemptID: attemptID, accepted: accepted) }
        }
      }
    } onCancel: { [weak self] in
      Task { @MainActor in self?.cancel(attemptID: attemptID) }
    }
  }
  private func complete(attemptID: UInt64, accepted: Bool) {
    guard let pending, pending.id == attemptID else { return }
    self.pending = nil
    pending.context.invalidate()
    if accepted { pending.continuation.resume() }
    else { pending.continuation.resume(throwing: DeletionActionFailure.denied) }
  }
  func cancel(attemptID: UInt64) {
    guard let pending, pending.id == attemptID else { return }
    self.pending = nil
    pending.context.invalidate()
    pending.continuation.resume(throwing: DeletionActionFailure.denied)
  }
}
