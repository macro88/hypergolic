import ExpoModulesCore

public final class NappletHostModule: Module {
  public func definition() -> ModuleDefinition {
    Name("HypergolicNappletHost")
    View(NappletHostView.self) {
      Events("onHostEvent")
      Prop("active") { (view: NappletHostView, active: Bool) in
        view.setActive(active)
      }
      Prop("sessionId") { (view: NappletHostView, id: String) in
        view.startSession(id)
      }
    }
  }
}
