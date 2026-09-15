import Foundation
import ExpoModulesCore

public final class NappletHostModule: Module {
  public func definition() -> ModuleDefinition {
    Name("HypergolicNappletHost")
    Function("newInstanceId") { UUID().uuidString.lowercased() }
    Function("takeCapability") { (token: String) -> String? in CapabilityTransport.leases.take(token) }
    Function("isCapabilityActive") { (token: String) -> Bool in CapabilityTransport.leases.isActive(token) }
    Function("finishCapability") { (token: String, response: String?) in CapabilityTransport.finish(token, response: response) }
    View(NappletHostView.self) {
      Events("onHostEvent")
      Prop("active") { (view: NappletHostView, active: Bool) in
        view.setActive(active)
      }
      Prop("configuration") { (view: NappletHostView, raw: String) in
        view.startConfiguredSession(raw)
      }
      Prop("sessionId") { (view: NappletHostView, id: String) in
        view.startSession(id)
      }
    }
  }
}
