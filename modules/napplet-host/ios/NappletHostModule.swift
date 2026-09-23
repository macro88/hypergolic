import Foundation
import ExpoModulesCore

public final class NappletHostModule: Module {
  deinit { PublishedArtifactTransfer.shared.revokeAll() }

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
    Function("registerPublishedSession") { (sessionId: String) -> Bool in
      PublishedArtifactTransfer.shared.registerPublishedSession(sessionId)
    }
    Function("beginPublishedArtifact") { (sessionId: String, publisher: String, identifier: String,
                                          eventId: String, aggregateHash: String, htmlHash: String,
                                          byteLength: Int) -> String? in
      PublishedArtifactTransfer.shared.beginPublishedArtifact(
        sessionId: sessionId, publisher: publisher, identifier: identifier, eventId: eventId,
        aggregateHash: aggregateHash, htmlHash: htmlHash, byteLength: byteLength)
    }
    Function("appendPublishedArtifact") { (uploadId: String, sequence: Int, base64Chunk: String) -> Bool in
      PublishedArtifactTransfer.shared.appendPublishedArtifact(uploadId, sequence: sequence, base64Chunk: base64Chunk)
    }
    Function("finishPublishedArtifact") { (uploadId: String) -> String? in
      PublishedArtifactTransfer.shared.finishPublishedArtifact(uploadId)
    }
    Function("cancelPublishedArtifact") { (uploadId: String) in
      PublishedArtifactTransfer.shared.cancelPublishedArtifact(uploadId)
    }
    Function("revokePublishedSession") { (sessionId: String) in
      PublishedArtifactTransfer.shared.revokePublishedSession(sessionId)
    }
    Function("revokeAllPublishedArtifacts") { PublishedArtifactTransfer.shared.revokeAll() }
    View(NappletHostView.self) {
      Events("onHostEvent")
      Prop("active") { (view: NappletHostView, active: Bool) in
        view.setActive(active)
      }
      Prop("configuration") { (view: NappletHostView, raw: String) in
        view.startConfiguredSession(raw)
      }
      Prop("publishedArtifact") { (view: NappletHostView, raw: String) in
        view.startPublishedArtifact(raw)
      }
      Prop("sessionId") { (view: NappletHostView, id: String) in
        view.startSession(id)
      }
    }
  }
}
