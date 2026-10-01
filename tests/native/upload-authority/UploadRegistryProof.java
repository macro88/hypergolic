package org.nostrocket.hypergolic.host;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.concurrent.atomic.AtomicLong;

public final class UploadRegistryProof {
  private static int checks;
  private static final String ID = "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798", SERVER = "https://files.example.com";
  private static void check(boolean value) { checks++; if (!value) throw new AssertionError("Registry check " + checks); }
  public static void main(String[] args) throws Exception {
    byte[] png = Files.readAllBytes(Path.of(args[0], "valid.png")); var clock = new AtomicLong(0);
    var registry = new UploadLeaseRegistry(clock::get);
    check(!registry.register("denied", ID, "native denied origin", false));
    check(registry.register("a", ID, "native origin a", true)); check(registry.register("b", ID, "native origin b", true));
    check(registry.register("c", ID, "native origin c", true)); check(!registry.register("a", ID, "replacement", true));
    check(registry.begin("a", "one", "request", png.length, SERVER) == null);
    registry.foreground(true); registry.focus("a", true);
    String token = registry.begin("a", "one", "immutable native request", png.length, SERVER); check(token != null);
    String publicId = registry.publicId("a", token); check(publicId != null && !publicId.equals(token)); check(registry.publicId("b", token) == null);
    check(registry.append("b", token, 0, png) == -1); check(!registry.seal("b", token)); check(!registry.cancelOwned("b", token));
    check(registry.take(publicId) == null); check(registry.take(token) == null); check(registry.append("a", token, 0, png) == png.length);
    check(registry.append("a", token, 0, png) == -1); check(registry.seal("a", token));
    var taken = registry.take(token); check(taken != null && "native origin a".equals(taken.registration) && "immutable native request".equals(taken.request));
    check(registry.take(token) == null); check(Arrays.equals(registry.preview(token, 0), png)); check(registry.preview(token, 1) == null);
    check(registry.begin("a", "same realm", "request", png.length, SERVER) == null);
    String second = registry.begin("b", "two", "request", png.length, SERVER); check(second != null);
    check(registry.begin("c", "third", "request", png.length, SERVER) == null);
    check(registry.approve(token)); check(!registry.approve(token)); check(registry.preview(token, 0) == null);
    check(registry.claimSigning(token)); check(!registry.claimSigning(token));
    registry.focus("b", true); registry.focus("a", false); check(registry.isApproved(token));
    check(registry.transfer(token, args[2], 1001) == null);
    var transfer = registry.transfer(token, args[1], 1001); check(transfer != null);
    check(transfer.authority.claimTransfer(transfer.grant)); check(!transfer.authority.claimTransfer(transfer.grant));
    check(Arrays.equals(transfer.authority.dispatch(transfer.grant), png)); check(transfer.authority.dispatch(transfer.grant) == null);
    registry.foreground(false); check(!registry.isLive(token)); check(registry.wasDispatched(token));
    var invalid = registry.drainInvalid(); check(invalid.size() == 2); check(invalid.stream().filter(row -> row.token.equals(token)).findFirst().orElseThrow().dispatched);
    check(registry.wasDispatched(token)); check(!registry.finish(token));
    registry.foreground(true); check(registry.begin("a", "one", "replay", png.length, SERVER) == null);
    String fresh = registry.begin("a", "fresh", "request", png.length, SERVER); check(fresh != null);
    registry.revoke("a"); check(registry.append("a", fresh, 0, png) == -1); check(registry.take(fresh) == null);
    check(registry.drainInvalid().size() == 1); check(registry.register("a", ID, "new native origin", true));
    check(registry.cancelOwned("a", fresh) == false);
    String expiry = registry.begin("a", "expired", "request", png.length, SERVER); check(expiry != null);
    clock.set(NativeUploadAuthority.REVIEW_MS); check(!registry.seal("a", expiry)); check(registry.drainInvalid().size() == 1);
    check(registry.wasDispatched("missing"));
    System.out.println("{\"language\":\"Java\",\"uploadRegistryChecks\":"+checks+",\"failed\":0}");
  }
}
