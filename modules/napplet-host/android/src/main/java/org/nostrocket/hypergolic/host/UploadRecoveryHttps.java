package org.nostrocket.hypergolic.host;

import java.io.IOException;
import java.net.InetAddress;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLSocketFactory;

/** Fixed provider/hash GET only. No guest URL, credentials, redirect, PUT or fallback. */
final class UploadRecoveryHttps {
  private static final ThreadPoolExecutor DNS = new ThreadPoolExecutor(1, 1, 0, TimeUnit.MILLISECONDS,
    new ArrayBlockingQueue<>(2), task -> { Thread thread = new Thread(task, "upload-recovery-dns"); thread.setDaemon(true); return thread; });
  private UploadRecoveryHttps() {}
  static PublishedHttpsResponseReader.UploadResponse get(UploadRecoveryReadAuthority authority, UploadRecoveryReadAuthority.Lease lease) throws IOException {
    return getWithTransport(authority, lease, PublishedHttpsRequestOwner.addressPolicy(), InetAddress::getAllByName, DNS,
      PublishedHttpsTransport.defaultSocketFactory(), HttpsURLConnection.getDefaultHostnameVerifier());
  }
  static PublishedHttpsResponseReader.UploadResponse getWithTransport(UploadRecoveryReadAuthority authority, UploadRecoveryReadAuthority.Lease lease,
    PublishedHttpsTransport.AddressPolicy policy, PublishedHttpsTransport.HostResolver resolver, ThreadPoolExecutor dns,
    SSLSocketFactory factory, HostnameVerifier verifier) throws IOException {
    if (authority == null || lease == null || !authority.live(lease)) throw new IOException("Recovery revoked");
    PublishedHttpsTransport.Cancellation cancellation = () -> !authority.live(lease);
    var deadline = PublishedHttpsTransport.Deadline.afterMillis(60_000);
    try (var abort = new PublishedHttpsTransport.AbortMonitor(cancellation, deadline)) {
      URL url = PublishedHttpsTransport.validateRequest(lease.record.destination() + "/" + lease.record.sha256(), policy);
      abort.check();
      try (var socket = PublishedHttpsTransport.openPinnedTls(url.getHost(), url.getPort() < 0 ? 443 : url.getPort(), policy, abort, deadline, resolver, dns, factory, verifier)) {
        abort.check(); String host = url.getHost() + (url.getPort() < 0 || url.getPort() == 443 ? "" : ":" + url.getPort());
        String request = "GET /" + lease.record.sha256() + " HTTP/1.1\r\nHost: " + host + "\r\nAccept: */*\r\nAccept-Encoding: identity\r\nConnection: close\r\n\r\n";
        socket.getOutputStream().write(request.getBytes(StandardCharsets.US_ASCII)); socket.getOutputStream().flush();
        var response = PublishedHttpsResponseReader.readRecovery(new PublishedHttpsTransport.DeadlineInputStream(socket.getInputStream(), socket, deadline), cancellation, NativeUploadAuthority.MAX_BYTES);
        abort.check(); return response;
      }
    }
  }
}
