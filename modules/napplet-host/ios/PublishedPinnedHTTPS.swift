import Foundation
import Network
import Security

/// HTTPS fetch over a numeric, vetted endpoint. URLSession cannot bind a DNS result
/// before connecting, so this owner resolves first and never gives NWConnection a name.
enum PublishedPinnedHTTPS {
  enum Failure: Error { case invalidURL, resolution, privateAddress, connection, cancelled }

  struct Request {
    let host: String
    let port: UInt16
    let target: String

    init(_ input: String) throws {
      guard input.utf8.count <= 8192, !input.contains("\\"),
            let components = URLComponents(string: input), components.scheme == "https",
            components.user == nil, components.password == nil, components.fragment == nil,
            let host = components.host?.lowercased(), host.count <= 253, host.contains("."),
            !host.contains(":"), !host.hasSuffix("."),
            !["localhost", "local", "internal", "home", "home.arpa", "lan", "test", "example", "invalid", "onion", "arpa"].contains(where: { host == $0 || host.hasSuffix(".\($0)") }),
            host.split(separator: ".", omittingEmptySubsequences: false).allSatisfy({ !$0.isEmpty && $0.count <= 63 }),
            components.port == nil || (1...65535).contains(components.port!)
      else { throw Failure.invalidURL }
      // Reject literal and non-ASCII spellings; the native certificate policy uses this exact name.
      let labels = host.split(separator: ".", omittingEmptySubsequences: false)
      guard labels.allSatisfy({ label in
        label.utf8.allSatisfy({ ($0 >= 97 && $0 <= 122) || ($0 >= 48 && $0 <= 57) || $0 == 45 }) &&
          label.first != "-" && label.last != "-"
      }), !host.utf8.allSatisfy({ ($0 >= 48 && $0 <= 57) || $0 == 46 })
      else { throw Failure.invalidURL }
      let path = components.percentEncodedPath.isEmpty ? "/" : components.percentEncodedPath
      let query = components.percentEncodedQuery.map { "?\($0)" } ?? ""
      let target = path + query
      guard target.utf8.allSatisfy({ $0 >= 33 && $0 <= 126 }), target.hasPrefix("/"),
            target.range(of: "%([01][0-9a-fA-F]|7[fF])", options: .regularExpression) == nil
      else { throw Failure.invalidURL }
      self.host = host
      self.port = UInt16(components.port ?? 443)
      self.target = target
    }

    var wire: Data {
      let authority = port == 443 ? host : "\(host):\(port)"
      return Data("GET \(target) HTTP/1.1\r\nHost: \(authority)\r\nAccept: text/html\r\nAccept-Encoding: identity\r\nConnection: close\r\n\r\n".utf8)
    }
  }

  struct Address: Sendable {
    let host: NWEndpoint.Host
    let bytes: Data
  }

  static func resolve(_ host: String) throws -> [Address] {
    var hints = addrinfo()
    hints.ai_family = AF_UNSPEC
    hints.ai_socktype = Int32(SOCK_STREAM)
    hints.ai_protocol = IPPROTO_TCP
    var head: UnsafeMutablePointer<addrinfo>?
    guard getaddrinfo(host, nil, &hints, &head) == 0, let head else { throw Failure.resolution }
    defer { freeaddrinfo(head) }
    var addresses: [Address] = []
    var next: UnsafeMutablePointer<addrinfo>? = head
    while let item = next {
      defer { next = item.pointee.ai_next }
      guard let socket = item.pointee.ai_addr else { throw Failure.resolution }
      if item.pointee.ai_family == AF_INET {
        let bytes = socket.withMemoryRebound(to: sockaddr_in.self, capacity: 1) { address in
          withUnsafeBytes(of: address.pointee.sin_addr) { Data($0) }
        }
        guard let literal = IPv4Address(bytes) else { throw Failure.resolution }
        addresses.append(Address(host: .ipv4(literal), bytes: bytes))
      } else if item.pointee.ai_family == AF_INET6 {
        let bytes = socket.withMemoryRebound(to: sockaddr_in6.self, capacity: 1) { address in
          withUnsafeBytes(of: address.pointee.sin6_addr) { Data($0) }
        }
        guard let literal = IPv6Address(bytes) else { throw Failure.resolution }
        addresses.append(Address(host: .ipv6(literal), bytes: bytes))
      } else { throw Failure.resolution }
      guard addresses.count <= 32 else { throw Failure.resolution }
    }
    guard !addresses.isEmpty, addresses.allSatisfy({ PublicAddressPolicy.accepts($0.bytes) })
    else { throw Failure.privateAddress }
    return addresses
  }

  /// Caller retains the returned operation to cancel on identity/session/app changes.
  static func fetch(_ input: String, maximumBodyBytes: Int, timeout: TimeInterval = 15,
                    completion: @escaping @Sendable (Result<PublishedHTTPResponse, Error>) -> Void) throws -> Operation {
    let request = try Request(input)
    guard (1...PublishedHTTPResponse.maximumBodyBytes).contains(maximumBodyBytes), timeout > 0, timeout <= 60
    else { throw Failure.invalidURL }
    let operation = try Operation(request: request, maximumBodyBytes: maximumBodyBytes, timeout: timeout, completion: completion)
    operation.start()
    return operation
  }

  final class Operation: @unchecked Sendable {
    private let request: Request
    private let timeout: TimeInterval
    private let queue = DispatchQueue(label: "org.nostrocket.hypergolic.published-https")
    private let completion: @Sendable (Result<PublishedHTTPResponse, Error>) -> Void
    private let accumulator: PublishedHTTPResponseAccumulator
    private var connection: NWConnection?
    private var ended = false

    fileprivate init(request: Request, maximumBodyBytes: Int, timeout: TimeInterval,
                     completion: @escaping @Sendable (Result<PublishedHTTPResponse, Error>) -> Void) throws {
      self.request = request
      self.timeout = timeout
      self.completion = completion
      self.accumulator = try PublishedHTTPResponseAccumulator(maximumBodyBytes: maximumBodyBytes)
    }

    fileprivate func start() {
      queue.asyncAfter(deadline: .now() + timeout) { self.finish(.failure(Failure.connection)) }
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

    private func connect(_ address: Address) {
      let tls = NWProtocolTLS.Options()
      request.host.withCString { sec_protocol_options_set_tls_server_name(tls.securityProtocolOptions, $0) }
      sec_protocol_options_add_tls_application_protocol(tls.securityProtocolOptions, "http/1.1")
      sec_protocol_options_set_min_tls_protocol_version(tls.securityProtocolOptions, .TLSv12)
      let name = request.host
      sec_protocol_options_set_verify_block(tls.securityProtocolOptions, { _, peerTrust, verify in
        let trust = sec_trust_copy_ref(peerTrust).takeRetainedValue()
        let policy = SecPolicyCreateSSL(true, name as CFString)
        guard SecTrustSetPolicies(trust, policy) == errSecSuccess,
              SecTrustSetNetworkFetchAllowed(trust, false) == errSecSuccess
        else { verify(false); return }
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
          connection.send(content: self.request.wire, completion: .contentProcessed { error in
            if error != nil { self.finish(.failure(Failure.connection)) }
            else { self.receive() }
          })
        case .failed, .cancelled: self.finish(.failure(Failure.connection))
        default: break
        }
      }
      connection.start(queue: queue)
    }

    private func receive() {
      guard !ended, let connection else { return }
      connection.receive(minimumIncompleteLength: 1, maximumLength: 8192) { data, _, complete, error in
        guard !self.ended else { return }
        if error != nil { self.finish(.failure(Failure.connection)); return }
        do {
          if let data { try self.accumulator.append(data) }
          if complete { self.finish(.success(try self.accumulator.finish())) }
          else if data == nil || data?.isEmpty == true { self.finish(.failure(Failure.connection)) }
          else { self.receive() }
        } catch { self.finish(.failure(error)) }
      }
    }

    private func finish(_ result: Result<PublishedHTTPResponse, Error>) {
      guard !ended else { return }
      ended = true
      connection?.stateUpdateHandler = nil
      connection?.cancel()
      connection = nil
      completion(result)
    }
  }
}
