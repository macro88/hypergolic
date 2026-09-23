package org.nostrocket.hypergolic.host;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Parses bounded HTTP response framing for published HTTPS retrieval. */
final class PublishedHttpsResponseReader {
  private static final int MAX_RESPONSE_HEADERS = 128;
  private static final int MAX_CHUNK_LINE_BYTES = 128;

  private PublishedHttpsResponseReader() {}

  static byte[] read(InputStream input, PublishedHttpsTransport.Cancellation cancellation) throws IOException {
    HeaderBlock block = readHeaders(input, PublishedHttpsTransport.MAX_RESPONSE_HEADER_BYTES);
    String[] lines = block.text.split("\r\n", -1);
    if (lines.length < 1 || !lines[0].matches("HTTP/1\\.[01] [0-9]{3}( .*)?")) {
      throw new IOException("Invalid HTTPS response status");
    }
    for (int i = 0; i < lines[0].length(); i++) {
      char c = lines[0].charAt(i);
      if ((c < 0x20 && c != '\t') || c == 0x7f) throw new IOException("Malformed HTTPS status line");
    }
    int status = Integer.parseInt(lines[0].substring(9, 12));
    if (status >= 300 && status < 400) throw new IOException("HTTPS redirects are not followed");
    if (status != 200) throw new IOException("HTTPS response status " + status);
    Map<String, List<String>> headers = parseHeaders(lines);
    String encoding = singleHeader(headers, "content-encoding");
    if (encoding != null && !"identity".equalsIgnoreCase(encoding.trim())) {
      throw new IOException("Encoded HTTPS responses are unsupported");
    }
    String transferEncoding = uniqueHeader(headers, "transfer-encoding");
    String contentLength = uniqueHeader(headers, "content-length");
    if (transferEncoding != null && contentLength != null) throw new IOException("Ambiguous HTTPS body framing");
    if (transferEncoding != null) {
      if (!"chunked".equalsIgnoreCase(transferEncoding.trim())) throw new IOException("Unsupported HTTPS transfer encoding");
      return readChunked(input, block.size, cancellation);
    }
    if (contentLength != null) {
      long length = parseLength(contentLength);
      if (length > PublishedHttpsTransport.MAX_BODY_BYTES) throw new IOException("HTTPS response exceeds 2 MiB");
      return readExact(input, (int) length, cancellation);
    }
    return readUntilEof(input, cancellation);
  }

  private static HeaderBlock readHeaders(InputStream input, int maximumBytes) throws IOException {
    ByteArrayOutputStream bytes = new ByteArrayOutputStream(1024);
    int state = 0;
    while (bytes.size() < maximumBytes) {
      int value = input.read();
      if (value < 0) throw new IOException("HTTPS response ended in headers");
      bytes.write(value);
      state = value == (state == 0 || state == 2 ? '\r' : state == 1 || state == 3 ? '\n' : -1)
          ? state + 1 : value == '\r' ? 1 : 0;
      if (state == 4) {
        byte[] encoded = bytes.toByteArray();
        return new HeaderBlock(new String(encoded, 0, encoded.length - 4, StandardCharsets.ISO_8859_1), encoded.length);
      }
    }
    throw new IOException("HTTPS response headers exceed 32 KiB");
  }

  private static Map<String, List<String>> parseHeaders(String[] lines) throws IOException {
    Map<String, List<String>> headers = new LinkedHashMap<>();
    if (lines.length - 1 > MAX_RESPONSE_HEADERS) throw new IOException("Too many HTTPS response headers");
    for (int i = 1; i < lines.length; i++) {
      String line = lines[i];
      int colon = line.indexOf(':');
      if (colon <= 0 || line.charAt(0) == ' ' || line.charAt(0) == '\t') throw new IOException("Malformed HTTPS header");
      String name = line.substring(0, colon).toLowerCase(Locale.ROOT);
      if (!name.matches("[!#$%&'*+.^_`|~0-9a-z-]+")) throw new IOException("Malformed HTTPS header name");
      String value = line.substring(colon + 1).trim();
      for (int j = 0; j < value.length(); j++) {
        char c = value.charAt(j);
        if ((c < 0x20 && c != '\t') || c == 0x7f) throw new IOException("Malformed HTTPS header value");
      }
      headers.computeIfAbsent(name, unused -> new ArrayList<>()).add(value);
    }
    return headers;
  }

  private static String singleHeader(Map<String, List<String>> headers, String name) throws IOException {
    List<String> values = headers.get(name);
    if (values == null || values.isEmpty()) return null;
    String first = values.get(0);
    for (String value : values) if (!first.equalsIgnoreCase(value)) throw new IOException("Conflicting " + name + " headers");
    return first;
  }

  private static String uniqueHeader(Map<String, List<String>> headers, String name) throws IOException {
    List<String> values = headers.get(name);
    if (values != null && values.size() != 1) throw new IOException("Duplicate " + name + " header");
    return values == null || values.isEmpty() ? null : values.get(0);
  }

  private static long parseLength(String value) throws IOException {
    try {
      String trimmed = value.trim();
      if (!trimmed.matches("[0-9]+")) throw new IOException("Invalid HTTPS content length");
      long parsed = Long.parseLong(trimmed);
      if (parsed < 0) throw new IOException("Invalid HTTPS content length");
      return parsed;
    } catch (NumberFormatException error) { throw new IOException("Invalid HTTPS content length", error); }
  }

  private static byte[] readExact(InputStream input, int length, PublishedHttpsTransport.Cancellation cancellation) throws IOException {
    byte[] result = new byte[length];
    int offset = 0;
    while (offset < length) {
      PublishedHttpsTransport.checkCancellation(cancellation);
      int count = input.read(result, offset, length - offset);
      if (count < 0) throw new IOException("Truncated HTTPS response body");
      offset += count;
    }
    return result;
  }

  private static byte[] readUntilEof(InputStream input, PublishedHttpsTransport.Cancellation cancellation) throws IOException {
    ByteArrayOutputStream output = new ByteArrayOutputStream(8192);
    byte[] buffer = new byte[8192];
    int count;
    while (true) {
      PublishedHttpsTransport.checkCancellation(cancellation);
      count = input.read(buffer);
      if (count < 0) return output.toByteArray();
      if (count > PublishedHttpsTransport.MAX_BODY_BYTES - output.size()) throw new IOException("HTTPS response exceeds 2 MiB");
      output.write(buffer, 0, count);
    }
  }

  private static byte[] readChunked(InputStream input, int headersBytes, PublishedHttpsTransport.Cancellation cancellation) throws IOException {
    ByteArrayOutputStream output = new ByteArrayOutputStream(8192);
    int trailerBudget = PublishedHttpsTransport.MAX_RESPONSE_HEADER_BYTES - headersBytes;
    while (true) {
      PublishedHttpsTransport.checkCancellation(cancellation);
      String line = readCrlfLine(input, MAX_CHUNK_LINE_BYTES);
      requireVisibleAscii(line);
      trailerBudget -= line.length() + 2;
      if (trailerBudget < 0) throw new IOException("HTTPS trailers exceed 32 KiB");
      int extension = line.indexOf(';');
      String sizeText = (extension < 0 ? line : line.substring(0, extension)).trim();
      if (sizeText.isEmpty() || !sizeText.matches("[0-9a-fA-F]+")) throw new IOException("Invalid HTTPS chunk size");
      long size;
      try { size = Long.parseLong(sizeText, 16); }
      catch (NumberFormatException error) { throw new IOException("Invalid HTTPS chunk size", error); }
      if (size == 0) {
        int trailerCount = 0;
        while (true) {
          String trailer = readCrlfLine(input, MAX_CHUNK_LINE_BYTES);
          requireVisibleAscii(trailer);
          trailerBudget -= trailer.length() + 2;
          if (trailerBudget < 0) throw new IOException("HTTPS trailers exceed 32 KiB");
          if (trailer.isEmpty()) return output.toByteArray();
          int colon = trailer.indexOf(':');
          if (++trailerCount > MAX_RESPONSE_HEADERS || colon <= 0 ||
              trailer.charAt(0) == ' ' || trailer.charAt(0) == '\t' ||
              !trailer.substring(0, colon).matches("[!#$%&'*+.^_`|~0-9A-Za-z-]+")) {
            throw new IOException("Malformed HTTPS trailer");
          }
          String trailerName = trailer.substring(0, colon);
          if (trailerName.equalsIgnoreCase("content-length") || trailerName.equalsIgnoreCase("transfer-encoding")) {
            throw new IOException("Forbidden HTTPS framing trailer");
          }
        }
      }
      if (size > PublishedHttpsTransport.MAX_BODY_BYTES - output.size()) throw new IOException("HTTPS response exceeds 2 MiB");
      byte[] chunk = readExact(input, (int) size, cancellation);
      output.write(chunk);
      if (input.read() != '\r' || input.read() != '\n') throw new IOException("Invalid HTTPS chunk terminator");
    }
  }

  private static String readCrlfLine(InputStream input, int maximumBytes) throws IOException {
    ByteArrayOutputStream line = new ByteArrayOutputStream(64);
    while (line.size() < maximumBytes) {
      int value = input.read();
      if (value < 0) throw new IOException("Truncated HTTPS response");
      if (value == '\n') {
        byte[] bytes = line.toByteArray();
        if (bytes.length == 0 || bytes[bytes.length - 1] != '\r') throw new IOException("Invalid HTTPS line ending");
        return new String(bytes, 0, bytes.length - 1, StandardCharsets.ISO_8859_1);
      }
      line.write(value);
    }
    throw new IOException("HTTPS line exceeds limit");
  }

  private static void requireVisibleAscii(String line) throws IOException {
    for (int i = 0; i < line.length(); i++) {
      char c = line.charAt(i);
      if (c < 0x20 || c > 0x7e) throw new IOException("Malformed HTTPS framing line");
    }
  }

  private static final class HeaderBlock {
    final String text;
    final int size;
    HeaderBlock(String text, int size) { this.text = text; this.size = size; }
  }
}
