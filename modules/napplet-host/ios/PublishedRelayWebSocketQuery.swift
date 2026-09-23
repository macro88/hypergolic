import CryptoKit
import Foundation
import Network
import Security

/// One bounded, pinned WSS subscription against one public relay. The caller owns
/// event structure and decides when a validated EOSE ends the operation.
enum PublishedRelayWebSocketQuery {
  enum Failure: Error { case invalidURL, resolution, connection, handshake, frame, closed, timeout, cancelled, limit }
  static let maxWireBytes = 2 * 1024 * 1024
  static let maxEvents = 32
  static let maxTextMessages = 64
  static let maxTextBytes = 2 * 1024 * 1024

  enum TextKind: Equatable { case event, other, eose, invalid }

  /// Holds bounded complete text envelopes, including OTHER and EOSE, like Android's
  /// `List<String>` result. Structural interpretation remains the trusted caller's job.
  struct TextCollector {
    private(set) var envelopes: [String] = []
    private var bytes = 0
    private var eventCount = 0
    private var ended = false

    mutating func accept(_ values: [(String, TextKind)]) throws -> Bool {
      guard values.count <= PublishedRelayWebSocketQuery.maxTextMessages - envelopes.count else { throw Failure.limit }
      let newBytes = values.reduce(0) { $0 + Data($1.0.utf8).count }
      guard newBytes <= PublishedRelayWebSocketQuery.maxTextBytes - bytes else { throw Failure.limit }
      let newEvents = values.filter { $0.1 == .event }.count
      guard newEvents <= PublishedRelayWebSocketQuery.maxEvents - eventCount,
            !values.contains(where: { $0.1 == .invalid }) else { throw Failure.limit }
      var sawEOSE = false
      for (_, kind) in values {
        guard !ended && !sawEOSE else { throw Failure.frame }
        if kind == .eose { sawEOSE = true }
      }
      envelopes.append(contentsOf: values.map(\.0))
      bytes += newBytes; eventCount += newEvents; ended = sawEOSE
      return sawEOSE
    }
  }

  /// Accepts one bounded response chunk and returns headers plus any coalesced frames.
  /// A second append after completion fails closed.
  struct HandshakeAccumulator {
    private var bytes = Data()
    private var complete = false

    mutating func append(_ chunk: Data) throws -> (headers: Data, prefetchedFrames: Data)? {
      guard !complete, !chunk.isEmpty, chunk.count <= PublishedRelayWebSocketFrames.maxRead,
            bytes.count + chunk.count <= PublishedRelayWebSocketHandshake.maxHeaderBytes + PublishedRelayWebSocketFrames.maxRead else {
        throw Failure.handshake
      }
      bytes.append(chunk)
      let marker = Data([13, 10, 13, 10])
      guard let range = bytes.range(of: marker) else {
        guard bytes.count < PublishedRelayWebSocketHandshake.maxHeaderBytes else { throw Failure.handshake }
        return nil
      }
      guard range.upperBound <= PublishedRelayWebSocketHandshake.maxHeaderBytes else { throw Failure.handshake }
      complete = true
      return (Data(bytes.prefix(upTo: range.upperBound)), Data(bytes.suffix(from: range.upperBound)))
    }
  }

  struct Request {
    let host: String
    let port: UInt16
    let target: String

    init(_ input: String) throws {
      guard input.utf8.count <= 2048, input == input.trimmingCharacters(in: .whitespacesAndNewlines),
            !input.contains("\\"), !input.utf8.contains(where: { $0 <= 0x20 || $0 == 0x7f }),
            let parts = URLComponents(string: input), parts.scheme?.lowercased() == "wss",
            parts.user == nil, parts.password == nil, parts.query == nil, parts.fragment == nil,
            let host = parts.host?.lowercased(), host.count <= 253, host.contains("."),
            !host.contains(":"), !host.hasSuffix("."),
            parts.port == nil || (1...65535).contains(parts.port!) else { throw Failure.invalidURL }
      let labels = host.split(separator: ".", omittingEmptySubsequences: false)
      guard labels.allSatisfy({ label in
        !label.isEmpty && label.count <= 63 && label.first != "-" && label.last != "-" &&
          label.utf8.allSatisfy { ($0 >= 97 && $0 <= 122) || ($0 >= 48 && $0 <= 57) || $0 == 45 }
      }), !host.utf8.allSatisfy({ ($0 >= 48 && $0 <= 57) || $0 == 46 }),
            !["localhost", "local", "localdomain", "internal", "home", "home.arpa", "lan", "test", "example", "invalid", "onion", "arpa"].contains(where: { host == $0 || host.hasSuffix(".\($0)") }),
            labels.last?.utf8.allSatisfy({ $0 >= 48 && $0 <= 57 }) != true
      else { throw Failure.invalidURL }
      let path = parts.percentEncodedPath.isEmpty ? "/" : parts.percentEncodedPath
      guard path.hasPrefix("/"), path.utf8.allSatisfy({ $0 >= 33 && $0 <= 126 }),
            path.range(of: "%([01][0-9a-fA-F]|7[fF])", options: .regularExpression) == nil
      else { throw Failure.invalidURL }
      self.host = host; self.port = UInt16(parts.port ?? 443); self.target = path
    }

    func upgrade(nonce: Data) throws -> Data {
      guard nonce.count == 16 else { throw Failure.handshake }
      let authority = port == 443 ? host : "\(host):\(port)"
      let text = "GET \(target) HTTP/1.1\r\nHost: \(authority)\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: \(nonce.base64EncodedString())\r\nSec-WebSocket-Version: 13\r\n\r\n"
      let data = Data(text.utf8)
      guard data.count <= PublishedRelayWebSocketHandshake.maxHeaderBytes else { throw Failure.invalidURL }
      return data
    }
  }

  static func query(_ url: String, subscription: String,
                    classifyText: @escaping @Sendable (String) throws -> TextKind,
                    completion: @escaping @Sendable (Result<[String], Error>) -> Void) throws -> Operation {
    let request = try Request(url)
    guard Data(subscription.utf8).count <= PublishedRelayWebSocketClientFrames.maxTextBytes,
          String(data: Data(subscription.utf8), encoding: .utf8) == subscription else { throw Failure.invalidURL }
    let operation = Operation(request: request, subscription: subscription, classifyText: classifyText, completion: completion)
    operation.start()
    return operation
  }

  final class Operation: @unchecked Sendable {
    private let request: Request
    private let subscription: String
    private let classifyText: @Sendable (String) throws -> TextKind
    private let completion: @Sendable (Result<[String], Error>) -> Void
    private let queue = DispatchQueue(label: "org.nostrocket.hypergolic.published-relay-wss")
    private let frames = PublishedRelayWebSocketFrames()
    private var connection: NWConnection?
    private var nonce = Data()
    private var handshake = HandshakeAccumulator()
    private var total = 0
    private var collector = TextCollector()
    private var ended = false

    fileprivate init(request: Request, subscription: String,
                     classifyText: @escaping @Sendable (String) throws -> TextKind,
                     completion: @escaping @Sendable (Result<[String], Error>) -> Void) {
      self.request = request; self.subscription = subscription; self.classifyText = classifyText; self.completion = completion
    }

    fileprivate func start() {
      queue.asyncAfter(deadline: .now() + 10) { self.finish(.failure(Failure.timeout)) }
      DispatchQueue.global(qos: .utility).async {
        let result = Result { try PublishedPinnedHTTPS.resolve(self.request.host) }
        self.queue.async {
          guard !self.ended else { return }
          switch result {
          case .failure(let error): self.finish(.failure(error))
          case .success(let addresses): self.connect(addresses[0])
          }
        }
      }
    }

    func cancel() { queue.async { self.finish(.failure(Failure.cancelled)) } }

    private func connect(_ address: PublishedPinnedHTTPS.Address) {
      var random = [UInt8](repeating: 0, count: 16)
      guard SecRandomCopyBytes(kSecRandomDefault, random.count, &random) == errSecSuccess else { finish(.failure(Failure.handshake)); return }
      nonce = Data(random)
      let tls = NWProtocolTLS.Options()
      request.host.withCString { sec_protocol_options_set_tls_server_name(tls.securityProtocolOptions, $0) }
      sec_protocol_options_set_min_tls_protocol_version(tls.securityProtocolOptions, .TLSv12)
      let expectedHost = request.host
      sec_protocol_options_set_verify_block(tls.securityProtocolOptions, { _, peerTrust, verify in
        let trust = sec_trust_copy_ref(peerTrust).takeRetainedValue()
        let policy = SecPolicyCreateSSL(true, expectedHost as CFString)
        guard SecTrustSetPolicies(trust, policy) == errSecSuccess,
              SecTrustSetNetworkFetchAllowed(trust, false) == errSecSuccess else { verify(false); return }
        verify(SecTrustEvaluateWithError(trust, nil))
      }, queue)
      let parameters = NWParameters(tls: tls, tcp: NWProtocolTCP.Options())
      guard let port = NWEndpoint.Port(rawValue: request.port) else { finish(.failure(Failure.invalidURL)); return }
      let connection = NWConnection(host: address.host, port: port, using: parameters)
      self.connection = connection
      connection.stateUpdateHandler = { [weak self] state in
        guard let self, !self.ended else { return }
        switch state {
        case .ready:
          do {
            let request = try self.request.upgrade(nonce: self.nonce)
            connection.send(content: request, completion: .contentProcessed { error in
              if error != nil { self.finish(.failure(Failure.connection)) } else { self.receiveHandshake() }
            })
          } catch { self.finish(.failure(error)) }
        case .failed, .cancelled: self.finish(.failure(Failure.connection))
        default: break
        }
      }
      connection.start(queue: queue)
    }

    private func receiveHandshake() {
      guard !ended, let connection else { return }
      connection.receive(minimumIncompleteLength: 1, maximumLength: 8192) { data, _, complete, error in
        guard !self.ended else { return }
        guard error == nil, !complete, let data, !data.isEmpty else { self.finish(.failure(Failure.handshake)); return }
        let parts: (headers: Data, prefetchedFrames: Data)?
        do { parts = try self.handshake.append(data) }
        catch { self.finish(.failure(error)); return }
        self.total += data.count
        guard self.total <= PublishedRelayWebSocketQuery.maxWireBytes else { self.finish(.failure(Failure.limit)); return }
        if let parts {
          do { try PublishedRelayWebSocketHandshake.validate(parts.headers, nonce: self.nonce) }
          catch { self.finish(.failure(error)); return }
          do {
            let frame = try PublishedRelayWebSocketClientFrames.textReq(self.subscription)
            connection.send(content: frame, completion: .contentProcessed { sendError in
              if sendError != nil { self.finish(.failure(Failure.connection)) }
              else if parts.prefetchedFrames.isEmpty { self.receiveFrames() }
              else { self.consumeFrames(parts.prefetchedFrames) }
            })
          } catch { self.finish(.failure(error)) }
        } else { self.receiveHandshake() }
      }
    }

    private func receiveFrames() {
      guard !ended, let connection else { return }
      connection.receive(minimumIncompleteLength: 1, maximumLength: PublishedRelayWebSocketFrames.maxRead) { data, _, complete, error in
        guard !self.ended else { return }
        guard error == nil, !complete, let data, !data.isEmpty else { self.finish(.failure(Failure.connection)); return }
        self.total += data.count
        guard self.total <= PublishedRelayWebSocketQuery.maxWireBytes else { self.finish(.failure(Failure.limit)); return }
        self.consumeFrames(data)
      }
    }

    private func consumeFrames(_ data: Data) {
      guard !ended, let connection else { return }
      let events = frames.feed(data)
      if events.contains(where: { if case .error = $0 { return true }; return false }) {
        finish(.failure(Failure.frame)); return
      }
      // Classify every decoded text before mutating bounded result storage or honoring EOSE.
      var texts: [(String, TextKind)] = []
      for event in events {
        guard case .text(let text) = event else { continue }
        do {
          let kind = try classifyText(text)
          guard kind != .invalid else { finish(.failure(Failure.frame)); return }
          texts.append((text, kind))
        } catch { finish(.failure(error)); return }
      }
      let sawEOSE: Bool
      do { sawEOSE = try collector.accept(texts) }
      catch { finish(.failure(error)); return }
      for event in events {
          switch event {
          case .text:
            break
          case .ping(let payload):
            do {
              let pong = try PublishedRelayWebSocketClientFrames.pong(payload)
              connection.send(content: pong, completion: .contentProcessed { error in if error != nil { self.finish(.failure(Failure.connection)) } })
            } catch { self.finish(.failure(error)); return }
          case .pong: break
          case .close, .error: self.finish(.failure(Failure.frame)); return
          }
      }
      if sawEOSE { finish(.success(collector.envelopes)); return }
      receiveFrames()
    }

    private func finish(_ result: Result<[String], Error>) {
      guard !ended else { return }
      ended = true; connection?.stateUpdateHandler = nil; connection?.cancel(); connection = nil
      completion(result)
    }
  }
}
