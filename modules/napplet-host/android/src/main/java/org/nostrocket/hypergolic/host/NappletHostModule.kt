package org.nostrocket.hypergolic.host

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NappletHostModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("HypergolicNappletHost")
    View(NappletHostView::class) {
      Events("onHostEvent")
      Prop("sessionId") { view: NappletHostView, id: String -> view.startSession(id) }
      OnViewDestroys { view: NappletHostView -> view.destroySession() }
    }
  }
}
