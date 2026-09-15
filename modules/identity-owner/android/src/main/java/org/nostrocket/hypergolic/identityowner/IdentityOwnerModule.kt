package org.nostrocket.hypergolic.identityowner

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class IdentityOwnerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("HypergolicIdentityOwner")
    Function("claimIdentityOwner") { IdentityOwnerClaim.claim() }
  }
}
