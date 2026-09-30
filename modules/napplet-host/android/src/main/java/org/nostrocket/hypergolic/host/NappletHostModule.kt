package org.nostrocket.hypergolic.host

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.facebook.react.common.LifecycleState
import android.util.Base64
import expo.modules.kotlin.functions.Coroutine
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.withContext

class NappletHostModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("HypergolicNappletHost")
    Events("onRelayStream", "onRelayLifecycle")
    OnCreate {
      RelaySubscriptionTransport.observeLifecycle { snapshot -> sendEvent("onRelayLifecycle", mapOf("snapshot" to snapshot)) }
      val foreground = appContext.runtime.reactContext?.lifecycleState == LifecycleState.RESUMED
      ApprovalTransport.foreground(foreground)
      RelaySubscriptionTransport.foreground(foreground)
      PublishedHttpsRequestOwner.INSTANCE.setForeground(foreground)
      PublishedRelayWssRequestOwner.INSTANCE.setForeground(foreground)
    }
    OnActivityEntersForeground {
      ApprovalTransport.foreground(true)
      RelaySubscriptionTransport.foreground(true)
      PublishedHttpsRequestOwner.INSTANCE.setForeground(true)
      PublishedRelayWssRequestOwner.INSTANCE.setForeground(true)
    }
    OnActivityEntersBackground {
      ApprovalTransport.foreground(false)
      RelaySubscriptionTransport.foreground(false)
      PublishedHttpsRequestOwner.INSTANCE.setForeground(false)
      PublishedRelayWssRequestOwner.INSTANCE.setForeground(false)
      PublishedArtifactTransfer.INSTANCE.revokeAllPublishedArtifacts()
      // Verified loaded read views retain their generation; pending transfers are revoked above.
    }
    OnActivityDestroys {
      ApprovalTransport.foreground(false)
      RelaySubscriptionTransport.foreground(false)
      PublishedHttpsRequestOwner.INSTANCE.setForeground(false)
      PublishedRelayWssRequestOwner.INSTANCE.setForeground(false)
      PublishedArtifactTransfer.INSTANCE.revokeAllPublishedArtifacts()
      NappletHostView.revokePublishedOnBackground()
    }
    OnUserLeavesActivity {
      RelaySubscriptionTransport.foreground(false)
      PublishedHttpsRequestOwner.INSTANCE.setForeground(false)
      PublishedRelayWssRequestOwner.INSTANCE.setForeground(false)
    }
    OnDestroy {
      RelaySubscriptionTransport.foreground(false)
      RelaySubscriptionTransport.revokeAll()
      RelaySubscriptionTransport.observeLifecycle(null)
      PublishedRelayWssRequestOwner.INSTANCE.setForeground(false)
      PublishedHttpsRequestOwner.INSTANCE.revokeAll()
      PublishedRelayWssRequestOwner.INSTANCE.revokeAll()
    }
    AsyncFunction("fetchPublishedHttps") Coroutine { operationId: String, url: String ->
      val job = currentCoroutineContext()[Job]
      withContext(Dispatchers.IO) {
        val bytes = PublishedHttpsRequestOwner.INSTANCE.fetch(operationId, url) { job?.isActive == true }
        Base64.encodeToString(bytes, Base64.NO_WRAP)
      }
    }
    Function("cancelPublishedHttps") { operationId: String ->
      PublishedHttpsRequestOwner.INSTANCE.cancel(operationId)
    }
    Function("revokeAllPublishedHttps") { PublishedHttpsRequestOwner.INSTANCE.revokeAll() }
    AsyncFunction("queryPublishedRelay") Coroutine { operationId: String, url: String, requestText: String,
      subscriptionId: String ->
      val job = currentCoroutineContext()[Job]
      withContext(Dispatchers.IO) {
        PublishedRelayWssRequestOwner.INSTANCE.query(operationId, url, requestText, subscriptionId) {
          job?.isActive == true
        }
      }
    }
    Function("cancelPublishedRelay") { operationId: String ->
      PublishedRelayWssRequestOwner.INSTANCE.cancel(operationId)
    }
    Function("revokeAllPublishedRelay") { PublishedRelayWssRequestOwner.INSTANCE.revokeAll() }
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
    Function("relayLifecycle") { RelaySubscriptionTransport.lifecycle() }
    Function("startRelayStream") { id: String, token: String, url: String, request: String, subId: String ->
      RelayStreamWssOwner.start(id, token, url, request, subId) { event -> sendEvent("onRelayStream", event) }
    }
    Function("acknowledgeRelayStream") { id: String, sequence: Long -> RelayStreamWssOwner.acknowledge(id, sequence) }
    Function("cancelRelayStream") { id: String -> RelayStreamWssOwner.cancel(id) }
    Function("takeSubscription") { token: String -> RelaySubscriptionTransport.registry.take(token) }
    Function("acceptSubscription") { token: String -> RelaySubscriptionTransport.registry.accept(token) }
    Function("mayDeliverSubscription") { token: String -> RelaySubscriptionTransport.registry.mayDeliver(token) }
    Function("isSubscriptionActive") { token: String -> RelaySubscriptionTransport.registry.isActive(token) }
    Function("sendSubscription") { token: String, response: String -> RelaySubscriptionTransport.send(token, response) }
    Function("closeSubscription") { token: String -> RelaySubscriptionTransport.close(token) }
    Function("takeCapability") { token: String -> CapabilityTransport.leases.take(token) }
    Function("isCapabilityActive") { token: String -> CapabilityTransport.leases.isActive(token) }
    Function("finishCapability") { token: String, response: String? -> CapabilityTransport.finish(token, response) }
    View(NappletHostView::class) {
      Events("onHostEvent")
      Prop("configuration") { view: NappletHostView, raw: String -> view.startConfiguredSession(raw) }
      Prop("publishedArtifact") { view: NappletHostView, raw: String -> view.startPublishedArtifact(raw) }
      Prop("sessionId") { view: NappletHostView, id: String -> view.startSession(id) }
      Prop("active") { view: NappletHostView, active: Boolean -> view.setActive(active) }
      OnViewDestroys { view: NappletHostView -> view.destroySession() }
    }
  }
}
