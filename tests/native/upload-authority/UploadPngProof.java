package org.nostrocket.hypergolic.host;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;

public final class UploadPngProof {
  private static int checks;
  private static void check(boolean value) { checks++; if (!value) throw new AssertionError("PNG check " + checks); }
  public static void main(String[] args) throws Exception {
    Path root = Path.of(args[0]);
    String[] accepted = {"valid", "color"};
    String[] rejected = {"signature","truncated","crc","text","exif","icc","animation","unknown","duplicate-header","duplicate-color","late-color","interlaced","huge","bad-filter","short-pixels","extra-pixels","compressed-trailer","after-end","jpeg"};
    for (String name : accepted) { byte[] bytes = Files.readAllBytes(root.resolve(name + ".png")); check(Arrays.equals(bytes, UploadPngProfile.prepare(bytes))); }
    for (String name : rejected) check(UploadPngProfile.prepare(Files.readAllBytes(root.resolve(name + ".png"))) == null);
    var authority = new NativeUploadAuthority(() -> 0L); var session = authority.register("png-session", "11".repeat(32));
    authority.setForeground(true); authority.focus(session);
    byte[] bytes = Files.readAllBytes(root.resolve("valid.png"));
    var request = authority.admit(session, bytes.length, "https://files.example.org", "text/plain"); check(authority.append(request, 0, bytes));
    byte[] original = bytes.clone(); Arrays.fill(bytes, (byte)0);
    var review = authority.sealPreparedPng(request); check(review != null); check("image/png".equals(review.mimeType));
    check(Arrays.equals(authority.preview(request, review), original)); check(authority.sealPreparedPng(request) == null);
    authority.cancel(request);
    byte[] metadata = Files.readAllBytes(root.resolve("text.png"));
    var denied = authority.admit(session, metadata.length, "https://files.example.org", "image/png"); check(authority.append(denied, 0, metadata));
    check(authority.sealPreparedPng(denied) == null); check(!authority.contains(denied));
    System.out.println("{\"language\":\"Java\",\"uploadPngChecks\":"+checks+",\"failed\":0}");
  }
}
