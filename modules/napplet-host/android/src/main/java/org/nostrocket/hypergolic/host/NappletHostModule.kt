package org.nostrocket.hypergolic.host

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.facebook.react.common.LifecycleState

class NappletHostModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("HypergolicNappletHost")
    OnCreate { ApprovalTransport.foreground(appContext.runtime.reactContext?.lifecycleState == LifecycleState.RESUMED) }
    OnActivityEntersForeground { ApprovalTransport.foreground(true) }
    OnActivityEntersBackground {
      ApprovalTransport.foreground(false)
      PublishedArtifactTransfer.INSTANCE.revokeAllPublishedArtifacts()
    }
    OnActivityDestroys {
      ApprovalTransport.foreground(false)
      PublishedArtifactTransfer.INSTANCE.revokeAllPublishedArtifacts()
    }
    Function("registerPublishedSession") { sessionId: String ->
      PublishedArtifactTransfer.INSTANCE.registerPublishedSession(sessionId)
    }
    Function("beginPublishedArtifact") { sessionId: String, publisher: String, identifier: String,
      eventId: String, aggregateHash: String, htmlHash: String, byteLength: Int ->
      PublishedArtifactTransfer.INSTANCE.beginPublishedArtifact(
        sessionId, publisher, identifier, eventId, aggregateHash, htmlHash, byteLength)
    }
    Function("appendPublishedArtifact") { uploadId: String, sequence: Int, base64Chunk: String ->
      PublishedArtifactTransfer.INSTANCE.appendPublishedArtifact(uploadId, sequence, base64Chunk)
    }
    Function("finishPublishedArtifact") { uploadId: String ->
      PublishedArtifactTransfer.INSTANCE.finishPublishedArtifact(uploadId)
    }
    Function("cancelPublishedArtifact") { uploadId: String ->
      PublishedArtifactTransfer.INSTANCE.cancelPublishedArtifact(uploadId)
    }
    Function("revokePublishedSession") { sessionId: String ->
      PublishedArtifactTransfer.INSTANCE.revokePublishedSession(sessionId)
    }
    Function("revokeAllPublishedArtifacts") {
      PublishedArtifactTransfer.INSTANCE.revokeAllPublishedArtifacts()
    }
    Function("takeApproval") { token: String -> ApprovalTransport.leases.take(token) }
    Function("isApprovalLive") { token: String -> ApprovalTransport.leases.isLive(token) }
    Function("mayReviewApproval") { token: String -> ApprovalTransport.leases.mayReview(token) }
    Function("approveApproval") { token: String -> ApprovalTransport.leases.approve(token) }
    Function("isApprovalApproved") { token: String -> ApprovalTransport.leases.isApproved(token) }
    Function("dismissApproval") { token: String -> ApprovalTransport.dismiss(token) }
    Function("cancelApproval") { token: String -> ApprovalTransport.cancel(token) }
    Function("finishApproval") { token: String, response: String? -> ApprovalTransport.finish(token, response) }
    Function("resumeApprovals") { ApprovalTransport.resume() }
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
