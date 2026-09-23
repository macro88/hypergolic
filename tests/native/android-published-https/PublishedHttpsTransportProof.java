package org.nostrocket.hypergolic.host;

import java.io.IOException;
import java.io.ByteArrayInputStream;
import java.net.InetAddress;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

/** JVM contract proof for URL and host rejection before any network connection is opened. */
public final class PublishedHttpsTransportProof {
  private static int assertions;

  public static void main(String[] args) throws Exception {
    acceptsOnlyCredentialFreeHttpsDnsNames();
    appliesHostPolicyBeforeReturningRequest();
    filtersEveryResolvedAddressBeforeConnecting();
    boundsAndParsesHttpResponses();
    rejectsAmbiguousAndPartialFraming();
    System.out.println("PublishedHttpsTransportProof: " + assertions + " assertions passed");
  }

  private static void acceptsOnlyCredentialFreeHttpsDnsNames() throws Exception {
    equal("https", PublishedHttpsTransport.parseUrl("https://napplets.example.org/app.html").getProtocol());
    String[] rejected = {
      null, "", "http://napplets.example/a", "file:///etc/passwd", "javascript:alert(1)",
      "https://user@napplets.example/a", "https://user:pass@napplets.example/a",
      "https://napplets.example.org/a#fragment",
      "https://napplets.example.org:0/a", "https://napplets.example.org:65536/a",
      "https://napplets.example.org\\@attacker.example/a", "https://napplets.example.org/?x=bad\r\nHost: evil",
      "x".repeat(8193)
    };
    for (String value : rejected) throwsIo(() -> PublishedHttpsTransport.parseUrl(value));
    RecordingPolicy permitHost = new RecordingPolicy(true);
    String[] rejectedHosts = {
      "https://127.0.0.1/a", "https://10.0.0.1/a", "https://[::1]/a",
      "https://localhost/a", "https://box.localhost/a", "https://printer.local/a",
      "https://service.internal/a", "https://server.test/a", "https://router.lan/a",
      "https://machine.home.arpa/a", "https://foo.example/a", "https://foo.invalid/a",
      "https://hiddenservice.onion/a", "https://reverse.arpa/a", "https://single-label/a",
      "https://0x7f.0.0.1/a", "https://127.1/a"
    };
    for (String value : rejectedHosts) throwsIo(() -> PublishedHttpsTransport.validateRequest(value, permitHost));
    check(!PublishedHttpsTransport.isDnsHostname("192.168.1.2"));
    check(!PublishedHttpsTransport.isDnsHostname("::1"));
    check(!PublishedHttpsTransport.isDnsHostname("single-label"));
    check(!PublishedHttpsTransport.isDnsHostname("-invalid.example"));
    check(!PublishedHttpsTransport.isDnsHostname("trailing-.example"));
    check(PublishedHttpsTransport.isDnsHostname("napplets.example.org"));
  }

  private static void appliesHostPolicyBeforeReturningRequest() throws Exception {
    RecordingPolicy allowed = new RecordingPolicy(true);
    URL url = PublishedHttpsTransport.validateRequest("https://Napplets.Example.Org/a", allowed);
    equal("Napplets.Example.Org", url.getHost());
    equal("napplets.example.org", allowed.host);
    throwsIo(() -> PublishedHttpsTransport.validateRequest("https://napplets.example.org/a", new RecordingPolicy(false)));
    throwsIo(() -> PublishedHttpsTransport.requestTarget(new URI("https://napplets.example.org/?value=%0d%0aInjected")));
    equal("/path?value=a%20b", PublishedHttpsTransport.requestTarget(new URI("https://napplets.example.org/path?value=a%20b")));
  }

  private static void filtersEveryResolvedAddressBeforeConnecting() throws Exception {
    PublishedHttpsTransport.AddressPolicy publicOnly = new PublishedHttpsTransport.AddressPolicy() {
      @Override public boolean isAllowedHost(String host) { return true; }
      @Override public boolean isAllowedAddress(InetAddress address) {
        return PublicAddressPolicy.accepts(address.getAddress());
      }
    };
    InetAddress publicIp = InetAddress.getByAddress(new byte[] {8, 8, 8, 8});
    InetAddress privateIp = InetAddress.getByAddress(new byte[] {10, 0, 0, 1});
    equal(1, PublishedHttpsTransport.checkedAddresses(new InetAddress[] {publicIp}, publicOnly).length);
    throwsIo(() -> PublishedHttpsTransport.checkedAddresses(new InetAddress[] {publicIp, privateIp}, publicOnly));
    throwsIo(() -> PublishedHttpsTransport.checkedAddresses(new InetAddress[0], publicOnly));
    check(Arrays.equals(publicIp.getAddress(), PublishedHttpsTransport.checkedAddresses(
        new InetAddress[] {publicIp}, publicOnly)[0].getAddress()));
  }

  private static void boundsAndParsesHttpResponses() throws Exception {
    byte[] fixed = PublishedHttpsTransport.readResponse(response(
        "HTTP/1.1 200 OK\r\nContent-Length: 5\r\n\r\nhello"), null);
    equal("hello", new String(fixed, StandardCharsets.US_ASCII));
    byte[] chunked = PublishedHttpsTransport.readResponse(response(
        "HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n" +
            "4\r\nWiki\r\n5\r\npedia\r\n0\r\nX-Test: yes\r\n\r\n"), null);
    equal("Wikipedia", new String(chunked, StandardCharsets.US_ASCII));
    throwsIo(() -> PublishedHttpsTransport.readResponse(response("HTTP/1.1 302 Found\r\nLocation: https://elsewhere.example/\r\n\r\n"), null));
    throwsIo(() -> PublishedHttpsTransport.readResponse(response("HTTP/1.1 200 OK\r\nContent-Encoding: gzip\r\nContent-Length: 0\r\n\r\n"), null));
    throwsIo(() -> PublishedHttpsTransport.readResponse(response("HTTP/1.1 200 OK\r\nContent-Length: 1\r\nContent-Length: 2\r\n\r\nx"), null));
    throwsIo(() -> PublishedHttpsTransport.readResponse(response("HTTP/1.1 200 OK\r\nContent-Length: 1\r\nTransfer-Encoding: chunked\r\n\r\n0\r\n\r\n"), null));
    throwsIo(() -> PublishedHttpsTransport.readResponse(response("HTTP/1.1 200 OK\r\nContent-Length: 2097153\r\n\r\n"), null));
    throwsIo(() -> PublishedHttpsTransport.readResponse(response("HTTP/1.1 200 OK\r\n" +
        "X-Large: " + "a".repeat(PublishedHttpsTransport.MAX_RESPONSE_HEADER_BYTES) + "\r\n\r\n"), null));
    throwsIo(() -> PublishedHttpsTransport.readResponse(response("HTTP/1.1 200 OK\r\nContent-Length: 1\r\n\r\nx"), () -> true));
  }

  private static ByteArrayInputStream response(String value) {
    return new ByteArrayInputStream(value.getBytes(StandardCharsets.ISO_8859_1));
  }

  private static void rejectsAmbiguousAndPartialFraming() throws Exception {
    throwsIo(() -> PublishedHttpsTransport.readResponse(response(
        "HTTP/1.1 200 OK\r\nContent-Length: +5\r\n\r\nhello"), null));
    throwsIo(() -> PublishedHttpsTransport.readResponse(response(
        "HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\nTransfer-Encoding: chunked\r\n\r\n0\r\n\r\n"), null));
    throwsIo(() -> PublishedHttpsTransport.readResponse(response(
        "HTTP/1.1 200 OK\r\nContent-Length: 5\r\n\r\nhi"), null));
    throwsIo(() -> PublishedHttpsTransport.readResponse(response(
        "HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n5\r\nhi"), null));
  }

  private static final class RecordingPolicy implements PublishedHttpsTransport.AddressPolicy {
    final boolean allow;
    String host;
    RecordingPolicy(boolean allow) { this.allow = allow; }
    @Override public boolean isAllowedHost(String value) { host = value; return allow; }
    @Override public boolean isAllowedAddress(InetAddress address) { return allow; }
  }

  private interface IoAction { void run() throws Exception; }
  private static void throwsIo(IoAction action) throws Exception {
    try { action.run(); }
    catch (IOException expected) { assertions++; return; }
    throw new AssertionError("Expected IOException");
  }
  private static void equal(Object expected, Object actual) {
    if (!expected.equals(actual)) throw new AssertionError("Expected " + expected + ", got " + actual);
    assertions++;
  }
  private static void check(boolean value) {
    if (!value) throw new AssertionError("Condition failed");
    assertions++;
  }
}
