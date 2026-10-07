package org.nostrocket.hypergolic.host;
import java.nio.charset.StandardCharsets;
final class FixtureReleaseProof {
  private static int count;
  private static void check(boolean value) {count++;if(!value)throw new AssertionError("fixture release check " + count);}
  public static void main(String[] args) {
    long[] clock={100};var owner=new FixtureReleaseAuthority(()->clock[0]);
    String user="11".repeat(32), next="22".repeat(32), server="https://files.example.com";
    byte[] bytes="<!doctype html><html><body>fixture</body></html>".getBytes(StandardCharsets.UTF_8);
    String hash=FixtureReleaseAuthority.hash(bytes);
    check(owner.prepare("feed-lab",bytes,hash,server,"[]")==null);
    check(owner.synchronize(user,0,true));owner.foreground(true);
    check(!owner.synchronize(next,0,true));check(!owner.synchronize(user,-1,true));
    check(owner.prepare("feed-lab",bytes,"00".repeat(32),server,"[]")==null);
    var row=owner.prepare("feed-lab",bytes,hash,server,"[]");check(row!=null);
    check(row.review.mimeType.equals("text/html") && row.review.sha256.equals(hash));
    check(!owner.prepareManifest(row.token,"manifest"));check(!owner.approveUpload("forged-token"));
    check(owner.approveUpload(row.token));check(!owner.approveUpload(row.token));
    check(!owner.verifyRetrieved(row.token,bytes));
    check(owner.uploads.claimTransfer(row.grant));check(!owner.uploads.claimTransfer(row.grant));
    check(java.util.Arrays.equals(owner.uploads.dispatch(row.grant),bytes));check(owner.uploads.dispatch(row.grant)==null);
    check(!owner.verifyRetrieved(row.token,new byte[]{1}));check(owner.verifyRetrieved(row.token,bytes));
    check(!owner.uploadApproved(row.token));check(owner.prepareManifest(row.token,"manifest-exact"));
    check(!owner.prepareManifest(row.token,"changed"));check(owner.approveManifest("forged-token")==null);
    check(owner.approveManifest(row.token).equals("manifest-exact"));check(owner.approveManifest(row.token)==null);check(owner.manifestApproved(row.token));
    owner.foreground(false);check(!owner.manifestApproved(row.token));owner.foreground(true);check(owner.current(row.token)==null);
    row=owner.prepare("feed-lab",bytes,hash,server,"[]");check(row!=null);check(owner.approveUpload(row.token));
    check(owner.synchronize(next,1,true));check(!owner.uploadApproved(row.token));check(!owner.synchronize(user,0,true));
    row=owner.prepare("feed-lab",bytes,hash,server,"[]");check(row.identity.equals(next));
    clock[0]+=600001;check(!owner.approveUpload(row.token));
    row=owner.prepare("feed-lab",bytes,hash,server,"[]");check(row!=null);check(owner.approveUpload(row.token));
    clock[0]+=60001;check(!owner.uploadApproved(row.token));owner.cancel();check(owner.current(row.token)==null);
    System.out.println("PASS Android trusted fixture release authority "+count+" assertions; core only");
  }
}
