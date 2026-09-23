package org.nostrocket.hypergolic.host;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLParameters;
import javax.net.ssl.SNIHostName;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;

/** Bounded public-DNS WSS REQ; the trusted caller validates text structure and EOSE. */
public final class PublishedRelayWssQuery {
  public static final int TOTAL_TIMEOUT_MS = 10_000;
  public static final int MAX_EVENTS = 32;
  public static final int MAX_TEXT_MESSAGES = 64;
  public static final int MAX_TEXT_BYTES = 2 * 1024 * 1024;
  private static final int CONNECT_TIMEOUT_MS = 5_000;
  private static final int READ_TIMEOUT_MS = 3_000;
  private static final int MAX_URL_CHARS = 2_048;
  private static final int MAX_HANDSHAKE_BYTES = PublishedRelayWebSocketHandshake.MAX_HEADER_BYTES;
  private static final byte[] CRLFCRLF = new byte[] {'\r', '\n', '\r', '\n'};
  private static final SecureRandom RANDOM = new SecureRandom();
  private static final ThreadPoolExecutor DNS = new ThreadPoolExecutor(1, 1, 0L, TimeUnit.MILLISECONDS,
      new ArrayBlockingQueue<>(4), task -> { Thread thread = new Thread(task, "napplet-relay-dns"); thread.setDaemon(true); return thread; });

  private PublishedRelayWssQuery() {}
  /** Returns complete text messages through caller-validated EOSE matching the subscription id. */
  public static List<String> query(String rawUrl, String request, PublishedHttpsTransport.AddressPolicy policy,
      PublishedHttpsTransport.Cancellation cancellation, TextStopPolicy shouldStop) throws IOException {
    RelayUrl relay = parseUrl(rawUrl);
    if (policy == null || shouldStop == null) throw new IllegalArgumentException("Missing relay policy");
    if (!policy.isAllowedHost(relay.host)) throw new IOException("Unsafe relay hostname");
    if (request == null || request.isEmpty()) throw new IOException("Missing relay request");
    byte[] requestFrame;
    try { requestFrame = PublishedRelayWebSocketClientFrames.textReq(request); }
    catch (IllegalArgumentException invalid) { throw new IOException("Invalid bounded relay request", invalid); }

    Deadline deadline = Deadline.start();
    AbortMonitor abort = new AbortMonitor(cancellation, deadline);
    try {
      InetAddress[] addresses = resolve(relay.host, deadline, abort);
      addresses = PublishedHttpsTransport.checkedAddresses(addresses, policy);
      SSLSocket tls = connect(relay, addresses, policy, abort, deadline);
      try (SSLSocket closeable = tls) {
        DeadlineInput input = new DeadlineInput(closeable.getInputStream(), closeable, deadline);
        OutputStream output = closeable.getOutputStream();
        byte[] nonce = new byte[16];
        RANDOM.nextBytes(nonce);
        sendHandshake(output, relay, nonce);
        byte[] headers = readHandshake(input, abort);
        try { PublishedRelayWebSocketHandshake.validate(headers, nonce); }
        catch (IllegalArgumentException invalid) { throw new IOException("Relay rejected WebSocket upgrade", invalid); }
        abort.check();
        output.write(requestFrame);
        output.flush();
        return readMessages(input, output, abort, shouldStop);
      }
    } finally { abort.close(); }
  }
  static RelayUrl parseUrl(String raw) throws IOException {
    if (raw == null || raw.length() > MAX_URL_CHARS || raw.indexOf('\\') >= 0) throw invalidUrl();
    for (int i = 0; i < raw.length(); i++) {
      char c = raw.charAt(i);
      if (c <= 0x20 || c >= 0x7f) throw invalidUrl();
    }
    final URI uri;
    try { uri = new URI(raw); }
    catch (Exception invalid) { throw new IOException("Invalid relay URL", invalid); }
    if (!"wss".equalsIgnoreCase(uri.getScheme()) || uri.getRawUserInfo() != null || uri.getHost() == null ||
        uri.getRawQuery() != null || uri.getRawFragment() != null || uri.getPort() == 0 ||
        uri.getPort() < -1 || uri.getPort() > 65535 || !validRelayHostname(uri.getHost())) {
      throw invalidUrl();
    }
    String path = uri.getRawPath();
    if (path == null || path.isEmpty()) path = "/";
    if (!path.startsWith("/") || hasLineBreak(path) || hasEncodedControl(path) || hasDotSegment(path)) throw invalidUrl();
    String authorityHost = uri.getHost();
    int port = uri.getPort() < 0 ? 443 : uri.getPort();
    String normalizedHost = authorityHost.toLowerCase(Locale.ROOT);
    String hostHeader = port == 443 ? normalizedHost : normalizedHost + ":" + port;
    String canonical = "wss://" + hostHeader + ("/".equals(path) ? "" : path);
    if (!raw.equals(canonical)) throw invalidUrl();
    return new RelayUrl(normalizedHost, port, path, hostHeader);
  }

  private static boolean validRelayHostname(String host) {
    if (!PublishedHttpsTransport.isDnsHostname(host)) return false;
    String lower = host.toLowerCase(Locale.ROOT);
    if (lower.endsWith(".localdomain")) return false;
    String[] labels = lower.split("\\.", -1);
    return labels.length >= 2 && !labels[labels.length - 1].matches("[0-9]+");
  }
  static InetAddress[] checkedAddresses(InetAddress[] answers, PublishedHttpsTransport.AddressPolicy policy)
      throws IOException {
    return PublishedHttpsTransport.checkedAddresses(answers, policy);
  }
  private static InetAddress[] resolve(String hostname, Deadline deadline, AbortMonitor abort) throws IOException {
    abort.check();
    FutureTask<InetAddress[]> lookup = new FutureTask<>(() -> InetAddress.getAllByName(hostname));
    try { DNS.execute(lookup); }
    catch (RejectedExecutionException saturated) { throw new IOException("Relay DNS capacity exhausted", saturated); }
    try {
      while (true) {
        abort.check();
        try { return lookup.get(Math.min(50L, deadline.remainingMs()), TimeUnit.MILLISECONDS); }
        catch (TimeoutException poll) { /* Recheck cancellation and deadline. */ }
      }
    } catch (InterruptedException interrupted) {
      lookup.cancel(true);
      Thread.currentThread().interrupt();
      throw new IOException("Relay DNS lookup interrupted", interrupted);
    } catch (ExecutionException failed) {
      throw new IOException("Relay DNS lookup failed", failed.getCause());
    } finally {
      if (!lookup.isDone()) lookup.cancel(true);
      DNS.remove(lookup);
    }
  }

  private static SSLSocket connect(RelayUrl relay, InetAddress[] addresses,
      PublishedHttpsTransport.AddressPolicy policy, AbortMonitor abort, Deadline deadline) throws IOException {
    IOException last = null;
    for (InetAddress address : addresses) {
      abort.check();
      if (!policy.isAllowedAddress(address)) throw new IOException("Disallowed relay address");
      Socket tcp = new Socket();
      abort.setSocket(tcp);
      try {
        tcp.connect(new InetSocketAddress(address, relay.port), deadline.timeoutMs(CONNECT_TIMEOUT_MS));
        SSLSocket tls = (SSLSocket) defaultFactory().createSocket(tcp, relay.host, relay.port, true);
        abort.setSocket(tls);
        tls.setSoTimeout(deadline.timeoutMs(READ_TIMEOUT_MS));
        SSLParameters parameters = tls.getSSLParameters();
        parameters.setEndpointIdentificationAlgorithm("HTTPS");
        parameters.setServerNames(Collections.singletonList(new SNIHostName(relay.host)));
        tls.setSSLParameters(parameters);
        List<String> protocols = new ArrayList<>();
        for (String protocol : tls.getSupportedProtocols()) {
          if ("TLSv1.2".equals(protocol) || "TLSv1.3".equals(protocol)) protocols.add(protocol);
        }
        if (protocols.isEmpty()) throw new IOException("TLS 1.2 or newer is required");
        tls.setEnabledProtocols(protocols.toArray(new String[0]));
        tls.startHandshake();
        if (!HttpsURLConnection.getDefaultHostnameVerifier().verify(relay.host, tls.getSession())) {
          throw new IOException("Relay TLS hostname mismatch");
        }
        abort.check();
        return tls;
      } catch (IOException failure) {
        last = failure;
        try { tcp.close(); } catch (IOException ignored) {}
      }
    }
    abort.check();
    throw last == null ? new IOException("No vetted relay address connected") : last;
  }

  private static SSLSocketFactory defaultFactory() throws IOException {
    try { return SSLContext.getDefault().getSocketFactory(); }
    catch (GeneralSecurityException failure) { throw new IOException("Default TLS unavailable", failure); }
  }

  private static void sendHandshake(OutputStream output, RelayUrl relay, byte[] nonce) throws IOException {
    String key = java.util.Base64.getEncoder().encodeToString(nonce);
    String request = "GET " + relay.path + " HTTP/1.1\r\n" +
        "Host: " + relay.hostHeader + "\r\n" +
        "Upgrade: websocket\r\n" +
        "Connection: Upgrade\r\n" +
        "Sec-WebSocket-Key: " + key + "\r\n" +
        "Sec-WebSocket-Version: 13\r\n" +
        "\r\n";
    byte[] bytes = request.getBytes(StandardCharsets.US_ASCII);
    if (bytes.length > MAX_HANDSHAKE_BYTES) throw new IOException("Relay request headers exceeded bound");
    output.write(bytes);
    output.flush();
  }

  private static byte[] readHandshake(InputStream input, AbortMonitor abort) throws IOException {
    ByteArrayOutputStream bytes = new ByteArrayOutputStream(512);
    int match = 0;
    while (bytes.size() < MAX_HANDSHAKE_BYTES) {
      abort.check();
      int value = input.read();
      if (value < 0) throw new IOException("Relay closed during WebSocket upgrade");
      bytes.write(value);
      if ((byte) value == CRLFCRLF[match]) match++;
      else match = (byte) value == CRLFCRLF[0] ? 1 : 0;
      if (match == CRLFCRLF.length) return bytes.toByteArray();
    }
    throw new IOException("Relay upgrade headers exceeded bound");
  }

  private static List<String> readMessages(DeadlineInput input, OutputStream output, AbortMonitor abort,
      TextStopPolicy shouldStop) throws IOException {
    PublishedRelayWebSocketFrames frames = new PublishedRelayWebSocketFrames();
    byte[] buffer = new byte[PublishedRelayWebSocketFrames.MAX_READ];
    ResponseCollector collector = new ResponseCollector(shouldStop);
    while (!collector.complete()) {
      abort.check();
      int count = input.read(buffer);
      if (count < 0) throw new IOException("Relay closed before EOSE");
      byte[] chunk = new byte[count];
      System.arraycopy(buffer, 0, chunk, 0, count);
      List<PublishedRelayWebSocketFrames.Event> batch = frames.feed(chunk);
      collector.preflight(batch);
      boolean stopAfterRead = false;
      for (PublishedRelayWebSocketFrames.Event event : batch) {
        abort.check();
        if ("text".equals(event.type)) {
          if (collector.complete()) throw new IOException("Relay sent data after validated EOSE");
          stopAfterRead |= collector.accept(event.text);
        } else if ("ping".equals(event.type)) {
          output.write(PublishedRelayWebSocketClientFrames.pong(event.bytes));
          output.flush();
        } else if ("pong".equals(event.type)) {
          // Keep the bounded one-shot query alive; pong payloads are validated by the frame decoder.
        } else if ("close".equals(event.type)) {
          throw new IOException("Relay closed before validated EOSE");
        } else {
          throw new IOException("Invalid relay WebSocket frame: " + event.detail);
        }
      }
      // Process the full decoded read before honoring EOSE, so trailing invalid frames fail closed.
      if (stopAfterRead) return collector.result();
    }
    return collector.result();
  }
  private static boolean hasLineBreak(String value) { return value.indexOf('\r') >= 0 || value.indexOf('\n') >= 0; }
  private static boolean hasEncodedControl(String value) {
    for (int i = 0; i + 2 < value.length(); i++) {
      if (value.charAt(i) == '%') {
        int high = Character.digit(value.charAt(i + 1), 16), low = Character.digit(value.charAt(i + 2), 16);
        if (high < 0 || low < 0) return true;
        int decoded = (high << 4) | low;
        if (decoded < 0x20 || decoded == 0x7f) return true;
        i += 2;
      }
    }
    return false;
  }
  private static boolean hasDotSegment(String path) {
    for (String segment : path.split("/", -1)) {
      String normalizedDots = segment.replaceAll("(?i)%2e", ".");
      if (".".equals(normalizedDots) || "..".equals(normalizedDots)) return true;
    }
    return false;
  }
  private static IOException invalidUrl() { return new IOException("Only credential-free public WSS DNS relay URLs are supported"); }
  public enum TextKind { EVENT, OTHER, EOSE }
  /** Classification is made only after the caller structurally validates JSON and subscription id. */
  public interface TextStopPolicy { TextKind classify(String completeText) throws IOException; }

  static final class RelayUrl {
    final String host;
    final int port;
    final String path;
    final String hostHeader;
    RelayUrl(String host, int port, String path, String hostHeader) {
      this.host = host; this.port = port; this.path = path; this.hostHeader = hostHeader;
    }
  }

  private static final class Deadline {
    final long expiresAt;
    private Deadline() { expiresAt = System.nanoTime() + TOTAL_TIMEOUT_MS * 1_000_000L; }
    static Deadline start() { return new Deadline(); }
    int remainingMs() throws SocketTimeoutException {
      long remaining = expiresAt - System.nanoTime();
      if (remaining <= 0) throw new SocketTimeoutException("Relay query timed out");
      return (int) Math.max(1L, Math.min(Integer.MAX_VALUE, (remaining + 999_999L) / 1_000_000L));
    }
    int timeoutMs(int maximum) throws SocketTimeoutException { return Math.min(remainingMs(), maximum); }
    boolean expired() { return System.nanoTime() >= expiresAt; }
  }

  static final class ResponseCollector {
    private final TextStopPolicy stopPolicy;
    private final ArrayList<String> messages = new ArrayList<>();
    private int totalBytes;
    private int eventCount;
    private boolean complete;
    ResponseCollector(TextStopPolicy stopPolicy) { this.stopPolicy = stopPolicy; }
    void preflight(List<PublishedRelayWebSocketFrames.Event> batch) throws IOException {
      int textCount = 0;
      int textBytes = 0;
      for (PublishedRelayWebSocketFrames.Event event : batch) {
        if ("error".equals(event.type)) throw new IOException("Invalid relay WebSocket frame: " + event.detail);
        if ("text".equals(event.type)) {
          textCount++;
          textBytes += event.text.getBytes(StandardCharsets.UTF_8).length;
        }
      }
      if (textCount > MAX_TEXT_MESSAGES - messages.size() || textBytes > MAX_TEXT_BYTES - totalBytes) {
        throw new IOException("Relay query exceeded response bounds");
      }
    }
    boolean accept(String text) throws IOException {
      if (complete || text == null || messages.size() >= MAX_TEXT_MESSAGES) {
        throw new IOException("Relay query exceeded response bounds");
      }
      int length = text.getBytes(StandardCharsets.UTF_8).length;
      if (length > PublishedRelayWebSocketFrames.MAX_BYTES || length > MAX_TEXT_BYTES - totalBytes) {
        throw new IOException("Relay query exceeded response bounds");
      }
      totalBytes += length;
      messages.add(text);
      final TextKind kind;
      try { kind = stopPolicy.classify(text); }
      catch (RuntimeException invalid) { throw new IOException("Relay text validation failed", invalid); }
      if (kind == null) throw new IOException("Relay text validation failed");
      if (kind == TextKind.EVENT && ++eventCount > MAX_EVENTS) throw new IOException("Relay query exceeded event limit");
      complete = kind == TextKind.EOSE;
      return complete;
    }
    boolean complete() { return complete; }
    List<String> result() { return Collections.unmodifiableList(new ArrayList<>(messages)); }
  }

  private static final class DeadlineInput extends InputStream {
    final InputStream delegate;
    final Socket socket;
    final Deadline deadline;
    DeadlineInput(InputStream delegate, Socket socket, Deadline deadline) {
      this.delegate = delegate; this.socket = socket; this.deadline = deadline;
    }
    @Override public int read() throws IOException {
      socket.setSoTimeout(deadline.timeoutMs(READ_TIMEOUT_MS));
      return delegate.read();
    }
    @Override public int read(byte[] target, int offset, int length) throws IOException {
      socket.setSoTimeout(deadline.timeoutMs(READ_TIMEOUT_MS));
      return delegate.read(target, offset, length);
    }
  }

  private static final class AbortMonitor implements AutoCloseable {
    final PublishedHttpsTransport.Cancellation cancellation;
    final Deadline deadline;
    volatile Socket socket;
    volatile boolean stopped;
    final Thread monitor;
    AbortMonitor(PublishedHttpsTransport.Cancellation cancellation, Deadline deadline) {
      this.cancellation = cancellation; this.deadline = deadline;
      monitor = new Thread(() -> {
        while (!stopped) {
          try {
            if ((cancellation != null && cancellation.isCancelled()) || deadline.expired()) {
              closeSocket(); return;
            }
            Thread.sleep(20L);
          } catch (InterruptedException stoppedThread) { return; }
          catch (RuntimeException failure) { closeSocket(); return; }
        }
      }, "napplet-wss-cancel");
      monitor.setDaemon(true);
      monitor.start();
    }
    void setSocket(Socket value) throws IOException { socket = value; check(); }
    void check() throws IOException {
      if (deadline.expired()) { closeSocket(); throw new SocketTimeoutException("Relay query timed out"); }
      if (cancellation != null) {
        try {
          if (cancellation.isCancelled()) { closeSocket(); throw new IOException("Relay query cancelled"); }
        } catch (RuntimeException unavailable) {
          closeSocket();
          throw new IOException("Relay cancellation state unavailable", unavailable);
        }
      }
    }
    void closeSocket() { Socket current = socket; if (current != null) try { current.close(); } catch (IOException ignored) {} }
    @Override public void close() {
      stopped = true; monitor.interrupt(); closeSocket();
      try { monitor.join(100L); } catch (InterruptedException interrupted) { Thread.currentThread().interrupt(); }
    }
  }
}
