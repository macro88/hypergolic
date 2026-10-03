import Foundation
@main struct RoutingCoreTests {
  static var count = 0
  static func expect(_ value: Bool) { count += 1; precondition(value, "Routing assertion \(count)") }
  static func main() {
    let a = String(repeating: "a", count: 64), b = String(repeating: "b", count: 64), r = RoutingEndpointRegistry()
    expect(!r.register("old", user:a, epoch:0, intent:true, inc:true)); expect(r.synchronizeOwner(a, epoch:0, available:true))
    expect(!r.synchronizeOwner(b, epoch:0, available:true)); expect(!r.register("wrong-user", user:b, epoch:0, intent:true, inc:true))
    expect(!r.register("wrong-epoch", user:a, epoch:1, intent:true, inc:true)); expect(!r.register("none", user:a, epoch:0, intent:false, inc:false))
    expect(r.register("source", user:a, epoch:0, intent:true, inc:true)); expect(!r.register("source", user:a, epoch:0, intent:true, inc:true))
    expect(!r.mayDeliver("source", domain:"inc")); r.ready("source"); expect(r.mayDeliver("source", domain:"inc"))
    expect(!r.mayReview("source")); r.focus("source", true); expect(r.mayReview("source"))
    var revision = r.state().revision; r.focus("source", false); expect(r.state().revision == revision); expect(r.mayDeliver("source", domain:"inc")); expect(!r.mayReview("source"))
    expect(r.register("target", user:a, epoch:0, intent:false, inc:true)); r.ready("target"); expect(r.mayDeliver("target", domain:"inc")); expect(!r.mayDeliver("target", domain:"intent"))
    r.setForeground(false); expect(!r.mayDeliver("source", domain:"inc")); expect(!r.matchesRevision(revision))
    r.setForeground(true); expect(r.mayDeliver("source", domain:"inc")); expect(!r.matchesRevision(revision))
    revision = r.state().revision; expect(r.synchronizeOwner(a, epoch:0, available:false)); expect(!r.mayDeliver("source", domain:"inc")); expect(!r.matchesRevision(revision))
    expect(r.synchronizeOwner(a, epoch:0, available:true)); expect(r.mayDeliver("source", domain:"inc"))
    expect(r.synchronizeOwner(b, epoch:1, available:true)); expect(!r.mayDeliver("source", domain:"inc")); expect(!r.synchronizeOwner(a, epoch:0, available:true))
    expect(r.register("new", user:b, epoch:1, intent:true, inc:true)); r.ready("new"); expect(r.mayDeliver("new", domain:"intent")); r.revoke("new"); expect(!r.mayDeliver("new", domain:"intent"))
    let limit = RoutingEndpointRegistry(); expect(limit.synchronizeOwner(a, epoch:0, available:true))
    for i in 0..<64 { expect(limit.register("endpoint-\(i)", user:a, epoch:0, intent:true, inc:true)) }
    expect(!limit.register("overflow", user:a, epoch:0, intent:true, inc:true)); limit.revoke("endpoint-0"); expect(limit.register("replacement", user:a, epoch:0, intent:true, inc:true))
    print("iOS routing core \(count) assertions passed")
  }
}
