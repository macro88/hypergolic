import Foundation
import ExpoModulesCore

public final class NappletHostModule: Module {
  public func definition() -> ModuleDefinition {
    Name("HypergolicNappletHost")
    Function("newInstanceId") { UUID().uuidString.lowercased() }
    Function("takeCapability") { (token: String) -> String? in CapabilityTransport.leases.take(token) }
    Function("isCapabilityActive") { (token: String) -> Bool in CapabilityTransport.leases.isActive(token) }
    Function("finishCapability") { (token: String, response: String?) in CapabilityTransport.finish(token, response: response) }
    Function("takeApproval") { (token: String) -> String? in ApprovalTransport.take(token) }
    Function("isApprovalLive") { (token: String) -> Bool in ApprovalTransport.isLive(token) }
    Function("mayReviewApproval") { (token: String) -> Bool in ApprovalTransport.mayReview(token) }
    Function("approveApproval") { (token: String) -> Bool in ApprovalTransport.approve(token) }
    Function("isApprovalApproved") { (token: String) -> Bool in ApprovalTransport.isApproved(token) }
    Function("cancelApproval") { (token: String) in ApprovalTransport.cancel(token) }
    Function("dismissApproval") { (token: String) in ApprovalTransport.dismiss(token) }
    Function("finishApproval") { (token: String, response: String?) in ApprovalTransport.finish(token, response: response) }
    Function("resumeApprovals") { ApprovalTransport.resume() }
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
