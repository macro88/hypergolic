package org.nostrocket.hypergolic.host

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NappletHostModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("HypergolicNappletHost")
    Function("newInstanceId") { java.util.UUID.randomUUID().toString() }
    Function("takeCapability") { token: String -> CapabilityTransport.leases.take(token) }
    Function("isCapabilityActive") { token: String -> CapabilityTransport.leases.isActive(token) }
    Function("finishCapability") { token: String, response: String? -> CapabilityTransport.finish(token, response) }
    View(NappletHostView::class) {
      Events("onHostEvent")
      Prop("configuration") { view: NappletHostView, raw: String -> view.startConfiguredSession(raw) }
      Prop("sessionId") { view: NappletHostView, id: String -> view.startSession(id) }
      Prop("active") { view: NappletHostView, active: Boolean -> view.setActive(active) }
      OnViewDestroys { view: NappletHostView -> view.destroySession() }
    }
  }
}
