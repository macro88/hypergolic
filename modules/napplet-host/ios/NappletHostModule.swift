import Foundation
import ExpoModulesCore

public final class NappletHostModule: Module {
  private let publishedHTTPS = PublishedHTTPSBridgeOwner()
  private let publishedRelay = PublishedRelayBridgeOwner()
  private let relayStreams = RelayStreamBridgeOwner.shared
  deinit {
    publishedHTTPS.revokeAll()
    publishedRelay.revokeAll()
    relayStreams.setForeground(false)
    PublishedArtifactTransfer.shared.revokeAll()
  }

  public func definition() -> ModuleDefinition {
    let publishedHTTPS = self.publishedHTTPS
    let publishedRelay = self.publishedRelay
    let relayStreams = self.relayStreams
    // Matches Expo 57's EventEmitter adapter: this captured identity is used only by emit,
    // which schedules payload conversion and module lookup on Expo's JavaScriptActor.
    nonisolated(unsafe) weak let streamEmitter = self
    Name("HypergolicNappletHost")
    Events("onRelayStream", "onRelayLifecycle")
    OnCreate {
      RelaySubscriptionTransport.shared.observeLifecycle { snapshot in streamEmitter?.emit(event: "onRelayLifecycle", payload: ["snapshot": snapshot]) }
    }
    OnDestroy { RelaySubscriptionTransport.shared.observeLifecycle(nil) }
    Function("relayLifecycle") { RelaySubscriptionTransport.shared.lifecycle() }
    Function("startRelayStream") { (id: String, token: String, url: String, request: String, subId: String) -> Bool in
      relayStreams.start(id, token: token, url: url, request: request, subId: subId) { event in streamEmitter?.emit(event: "onRelayStream", payload: event.payload) }
    }
    Function("acknowledgeRelayStream") { (id: String, sequence: UInt64) in relayStreams.acknowledge(id, sequence: sequence) }
    Function("cancelRelayStream") { (id: String) in relayStreams.cancel(id) }
    AsyncFunction("fetchPublishedHttps") { (operationId: String, url: String) async throws -> String in
      try await publishedHTTPS.fetch(operationId: operationId, url: url)
    }
    Function("cancelPublishedHttps") { (operationId: String) in
      publishedHTTPS.cancel(operationId: operationId)
    }
    Function("revokeAllPublishedHttps") { publishedHTTPS.revokeAll() }
    AsyncFunction("queryPublishedRelay") { (operationId: String, url: String, requestText: String,
                                              subscriptionId: String) async throws -> [String] in
      try await publishedRelay.query(operationId: operationId, url: url, requestText: requestText,
                                      subscriptionId: subscriptionId)
    }
    Function("cancelPublishedRelay") { (operationId: String) in
      publishedRelay.cancel(operationId: operationId)
    }
    Function("revokeAllPublishedRelay") { publishedRelay.revokeAll() }
    Function("newInstanceId") { UUID().uuidString.lowercased() }
    Function("takeSubscription") { (token: String) -> String? in RelaySubscriptionTransport.shared.registry.take(token) }
    Function("acceptSubscription") { (token: String) -> Bool in RelaySubscriptionTransport.shared.registry.accept(token) }
    Function("mayDeliverSubscription") { (token: String) -> Bool in RelaySubscriptionTransport.shared.registry.mayDeliver(token) }
    Function("isSubscriptionActive") { (token: String) -> Bool in RelaySubscriptionTransport.shared.registry.isActive(token) }
    Function("sendSubscription") { (token: String, response: String) -> Int in RelaySubscriptionTransport.shared.send(token, response: response) }
    Function("closeSubscription") { (token: String) in RelaySubscriptionTransport.shared.close(token) }
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
