import ExpoModulesCore

/// These functions are available only to the trusted React Native shell, never forwarded to NAP.
public final class HypergolicIdentityStoreModule: Module {
  public func definition() -> ModuleDefinition {
    Name("HypergolicIdentityStore")
    // Preflight only. The Simulator cannot satisfy the required file-protection policy.
    AsyncFunction("isAvailableAsync") { () -> Bool in IdentityStoreAvailability.isSupportedEnvironment }
    AsyncFunction("readInventoryAsync") { () async throws -> String? in
      try await bridgeResult { try await IdentityStoreProcess.owner.readInventory() }
    }
    AsyncFunction("writeInventoryAsync") { (value: String) async throws in
      try await bridgeResult { try await IdentityStoreProcess.owner.writeInventory(value) }
    }
    AsyncFunction("readStageAsync") { () async throws -> String? in
      try await bridgeResult { try await IdentityStoreProcess.owner.readStage() }
    }
    AsyncFunction("writeStageAsync") { (value: String) async throws in
      try await bridgeResult { try await IdentityStoreProcess.owner.writeStage(value) }
    }
    AsyncFunction("deleteStageAsync") { () async throws in
      try await bridgeResult { try await IdentityStoreProcess.owner.deleteStage() }
    }
    AsyncFunction("readSecretAsync") { (pubkey: String) async throws -> String? in
      try await bridgeResult { try await IdentityStoreProcess.owner.readSecret(pubkey) }
    }
    AsyncFunction("writeSecretAsync") { (pubkey: String, value: String) async throws in
      try await bridgeResult { try await IdentityStoreProcess.owner.writeSecret(pubkey, value: value) }
    }
    AsyncFunction("deleteSecretAsync") { (pubkey: String, token: String) async throws in
      try await bridgeResult { try await IdentityStoreProcess.owner.deleteSecret(pubkey, token: token) }
    }
  }
}

private func bridgeResult<T: Sendable>(_ operation: @Sendable () async throws -> T) async throws -> T {
  do { return try await operation() }
  catch {
    let failure = error as? StoreFailure ?? .unavailable
    // Never attach the original error, request, secret, path, token or OS error detail.
    throw Exception(name: "IdentityStoreError", description: failure.safeDescription, code: failure.bridgeCode)
  }
}
