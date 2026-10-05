package org.nostrocket.hypergolic.host;
import org.json.JSONObject;
import java.nio.file.Files;
import java.nio.file.Path;

/** Real compiled native plan; signed fixture inputs are public. No device/signing/network claim. */
public final class PlanProof {
  private static int assertions;
  private static void check(boolean value) { assertions++; if (!value) throw new AssertionError("Plan assertion " + assertions); }
  private static void denied(Runnable work) { assertions++; try { work.run(); } catch (Exception expected) { return; } throw new AssertionError("Expected denial"); }
  public static void main(String[] args) throws Exception {
    JSONObject fixture = new JSONObject(Files.readString(Path.of(args[0])));
    String snapshot = fixture.getString("snapshot"), raw = fixture.getJSONObject("plan").toString();
    String primary = fixture.getJSONObject("primary").toString(), list = fixture.getJSONObject("list").toString();
    NativeOutboxPlan plan = NativeOutboxPlan.Companion.capture(snapshot, raw);
    check(plan.getDestinations().size() == 2);
    String relay = plan.getDestinations().get(0);
    NativeOutboxPlan.Send send = plan.reserve("primary", primary, relay, 1);
    check(send.getEventId().equals(fixture.getJSONObject("primary").getString("id")));
    check(send.getFrame().startsWith("[\"EVENT\",")); check(!send.getAttempted()); check(send.getDeadline() == 15001);
    denied(() -> plan.reserve("primary", primary, relay, 2));
    check(plan.reserve("relay-list", list, relay, 2).getEventId().equals(fixture.getJSONObject("list").getString("id")));
    denied(() -> plan.reserve("relay-list", list, relay, 3));
    denied(() -> plan.reserve("primary", primary, "wss://elsewhere.org/", 3));
    denied(() -> plan.reserve("unknown", primary, plan.getDestinations().get(1), 3));
    JSONObject changed = new JSONObject(primary).put("content", "changed");
    final String changedContent = changed.toString();
    denied(() -> plan.reserve("primary", changedContent, plan.getDestinations().get(1), 3));
    changed = new JSONObject(primary).put("sig", "0".repeat(128)); final String changedSignature = changed.toString();
    denied(() -> plan.reserve("primary", changedSignature, plan.getDestinations().get(1), 3));
    check(plan.reserve("primary", primary, plan.getDestinations().get(1), 4).getDeadline() == 15001);
    JSONObject mutation = new JSONObject(raw); mutation.getJSONObject("event").put("selectedPubkey", "0".repeat(64));
    denied(() -> NativeOutboxPlan.Companion.capture(snapshot, mutation.toString()));
    JSONObject template = new JSONObject(raw); template.getJSONObject("event").getJSONObject("event").put("content", "changed");
    denied(() -> NativeOutboxPlan.Companion.capture(snapshot, template.toString()));
    JSONObject hash = new JSONObject(raw); hash.getJSONObject("event").put("hash", "0".repeat(64));
    denied(() -> NativeOutboxPlan.Companion.capture(snapshot, hash.toString()));
    JSONObject sources = new JSONObject(raw); sources.getJSONArray("destinations").getJSONObject(0).put("relay", "wss://elsewhere.org/");
    denied(() -> NativeOutboxPlan.Companion.capture(snapshot, sources.toString()));
    JSONObject skipped = new JSONObject(snapshot); JSONObject request = new JSONObject(skipped.getString("request"));
    request.put("options", new JSONObject().put("toOutbox", false)); skipped.put("request", request.toString());
    denied(() -> NativeOutboxPlan.Companion.capture(skipped.toString(), raw));
    JSONObject noGrant = new JSONObject(snapshot); noGrant.getJSONObject("registration").put("domains", new org.json.JSONArray().put("relay"));
    denied(() -> NativeOutboxPlan.Companion.capture(noGrant.toString(), raw));
    JSONObject credential = new JSONObject(raw); credential.getJSONObject("event").getJSONArray("destinations").put(0, "wss://user:secret@relay.damus.io/");
    denied(() -> NativeOutboxPlan.Companion.capture(snapshot, credential.toString()));
    denied(() -> NativeOutboxPlan.Companion.capture(snapshot, "[".repeat(30) + "0" + "]".repeat(30)));
    JSONObject tooLarge = new JSONObject(raw); JSONObject largeTemplate = tooLarge.getJSONObject("event").getJSONObject("event").put("content", "x".repeat(8192));
    String canonical = new org.json.JSONArray().put(0).put(fixture.getJSONObject("primary").getString("pubkey")).put(largeTemplate.getLong("created_at")).put(largeTemplate.getInt("kind")).put(largeTemplate.getJSONArray("tags")).put(largeTemplate.getString("content")).toString();
    String largeHash = java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256").digest(canonical.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
    tooLarge.getJSONObject("event").put("hash", largeHash);
    JSONObject largeSnapshot = new JSONObject(snapshot); JSONObject largeRequest = new JSONObject(largeSnapshot.getString("request")).put("event", largeTemplate); largeSnapshot.put("request", largeRequest.toString());
    denied(() -> NativeOutboxPlan.Companion.capture(largeSnapshot.toString(), tooLarge.toString()));
    String id = send.getEventId(); OutboxAcknowledgement ack = new OutboxAcknowledgement(id);
    check(ack.classify("[\"NOTICE\",\"ordinary\"]") == PublishedRelayWssQuery.TextKind.OTHER); check(ack.getResult() == null);
    check(ack.classify("[\"OK\",\"wrong-id\",true,\"other\"]") == PublishedRelayWssQuery.TextKind.OTHER); check(ack.getResult() == null);
    denied(() -> { try { ack.classify("[\"OK\",\""+id+"\",1,\"bad\"]"); } catch (Exception error) { throw new IllegalArgumentException(error); } }); check(ack.getResult() == null);
    check(ack.classify("[\"OK\",\""+id+"\",true,\"accepted\"]") == PublishedRelayWssQuery.TextKind.EOSE);
    check(ack.getResult().getAccepted()); check(ack.getResult().getReason().equals("accepted"));
    denied(() -> { try { ack.classify("invalid JSON"); } catch (Exception error) { throw new IllegalArgumentException(error); } }); check(ack.getResult().getAccepted());
    ack.classify("[\"OK\",\""+id+"\",false,\"later contradictory response\"]"); check(ack.getResult().getAccepted());
    OutboxAcknowledgement rejected = new OutboxAcknowledgement(id);
    rejected.classify("[\"OK\",\""+id+"\",false,\"blocked\"]"); check(!rejected.getResult().getAccepted()); check(rejected.getResult().getReason().equals("blocked"));
    System.out.println("{\"status\":\"passed\",\"assertions\":" + assertions + ",\"scope\":\"native plan only\"}");
  }
}
