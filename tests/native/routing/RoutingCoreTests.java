package org.nostrocket.hypergolic.host;
public final class RoutingCoreTests {
  static int count = 0;
  static void expect(boolean value) { count++; if (!value) throw new AssertionError("Routing assertion " + count); }
  public static void main(String[] args) {
    String a = "a".repeat(64), b = "b".repeat(64);
    RoutingEndpointRegistry r = new RoutingEndpointRegistry();
    expect(!r.register("old", a, 0, true, true)); expect(r.synchronizeOwner(a, 0, true));
    expect(!r.synchronizeOwner(b, 0, true)); expect(!r.register("wrong-user", b, 0, true, true));
    expect(!r.register("wrong-epoch", a, 1, true, true)); expect(!r.register("none", a, 0, false, false));
    expect(r.register("source", a, 0, true, true)); expect(!r.register("source", a, 0, true, true));
    expect(!r.mayDeliver("source", "inc")); r.ready("source"); expect(r.mayDeliver("source", "inc"));
    expect(!r.mayReview("source")); r.focus("source", true); expect(r.mayReview("source"));
    long revision = r.revision(); r.focus("source", false); expect(r.revision() == revision); expect(r.mayDeliver("source", "inc")); expect(!r.mayReview("source"));
    expect(r.register("target", a, 0, false, true)); r.ready("target"); expect(r.mayDeliver("target", "inc")); expect(!r.mayDeliver("target", "intent"));
    r.foreground(false); expect(!r.mayDeliver("source", "inc")); expect(!r.matchesRevision(revision));
    r.foreground(true); expect(r.mayDeliver("source", "inc")); expect(!r.matchesRevision(revision));
    revision = r.revision(); expect(r.synchronizeOwner(a, 0, false)); expect(!r.mayDeliver("source", "inc")); expect(!r.matchesRevision(revision));
    expect(r.synchronizeOwner(a, 0, true)); expect(r.mayDeliver("source", "inc"));
    expect(r.synchronizeOwner(b, 1, true)); expect(!r.mayDeliver("source", "inc")); expect(!r.synchronizeOwner(a, 0, true));
    expect(r.register("new", b, 1, true, true)); r.ready("new"); expect(r.mayDeliver("new", "intent")); r.revoke("new"); expect(!r.mayDeliver("new", "intent"));
    RoutingEndpointRegistry limit = new RoutingEndpointRegistry(); expect(limit.synchronizeOwner(a, 0, true));
    for (int i=0;i<64;i++) expect(limit.register("endpoint-"+i,a,0,true,true));
    expect(!limit.register("overflow",a,0,true,true)); limit.revoke("endpoint-0"); expect(limit.register("replacement",a,0,true,true));
    System.out.println("Android routing core " + count + " assertions passed");
  }
}
