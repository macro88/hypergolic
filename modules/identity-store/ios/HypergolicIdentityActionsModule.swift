import ExpoModulesCore
import ExpoModulesJSI
import HypergolicIdentityOwner

/// Trusted React Native settings only. No method is forwarded into a napplet capability bridge.
public final class HypergolicIdentityActionsModule: Module {
  private let binding = IdentityActionsBinding()
  public func definition() -> ModuleDefinition {
    let binding = self.binding
    Name("HypergolicIdentityActions")
    Function("activateIdentityActions") { () throws in
      try actionResult {
        guard let appContext, NativeIdentityOwnerContext.owns(appContext) else { throw DeletionActionFailure.unavailable }
        let runtime = try appContext.runtime
        guard runtime.isOnJavaScriptThread() else { throw DeletionActionFailure.unavailable }
        try JavaScriptActor.assumeIsolated {
          let services = try NativeIdentityAuthorizationServices.shared()
          let lease = try services.createClaimedRuntimeLease()
          do {
            guard NativeIdentityOwnerContext.registerRevocation(appContext, revoke: { lease.dispose() }) else { throw DeletionActionFailure.unavailable }
            try attachIdentityLifetime(lease, to: appContext)
            try binding.install(lease)
          } catch { lease.dispose(); throw DeletionActionFailure.unavailable }
        }
      }
    }
    AsyncFunction("beginSettingsAsync") { (selected: String, revision: Double) async throws -> String in
      try await actionResult {
        let revision = try actionRevision(revision)
        guard Receipt.isPubkey(selected) else { throw DeletionActionFailure.invalidInput }
        let services = try NativeIdentityAuthorizationServices.shared()
        await services.observeApplication()
        return try await binding.beginSettings(selected: selected, revision: revision)
      }
    }
    Function("endSettings") { (session: String) throws in
      try actionResult { try binding.endSettings(session) }
    }
    Function("cancelDeletion") { (session: String) throws in
      try actionResult { try binding.cancelDeletion(session) }
    }
    AsyncFunction("authorizeDeletionAsync") { (session: String, target: String, selected: String, revision: Double) async throws -> String in
      try await actionResult {
        let revision = try actionRevision(revision)
        guard BridgeBounds.isToken(session), Receipt.isPubkey(target), Receipt.isPubkey(selected) else { throw DeletionActionFailure.invalidInput }
        return try await binding.authorizeDeletion(session: session, target: target, selected: selected, revision: revision)
      }
    }
    Function("assertDeletionGrantActive") { (session: String, target: String, token: String) throws in
      try actionResult { try binding.assertDeletionGrant(session: session, token: token, target: target) }
    }
  }
}

private func actionRevision(_ value: Double) throws -> UInt64 {
  guard value.isFinite, value >= 1, value <= 9_007_199_254_740_991, value.rounded(.towardZero) == value else { throw DeletionActionFailure.invalidInput }
  return UInt64(value)
}
private func actionException(_ error: any Error) -> Exception {
  let code: String
  switch error as? DeletionActionFailure ?? .unavailable {
  case .unavailable: code = "ERR_IDENTITY_ACTION_UNAVAILABLE"
  case .denied: code = "ERR_IDENTITY_ACTION_DENIED"
  case .busy: code = "ERR_IDENTITY_ACTION_BUSY"
  case .staleContext: code = "ERR_IDENTITY_ACTION_STALE_CONTEXT"
  case .invalidInput: code = "ERR_IDENTITY_ACTION_INVALID_INPUT"
  }
  return Exception(name: "IdentityActionError", description: "Identity action could not be completed.", code: code)
}
private func actionResult<T>(_ operation: () throws -> T) throws -> T {
  do { return try operation() } catch { throw actionException(error) }
}
private func actionResult<T: Sendable>(_ operation: @Sendable () async throws -> T) async throws -> T {
  do { return try await operation() } catch { throw actionException(error) }
}
