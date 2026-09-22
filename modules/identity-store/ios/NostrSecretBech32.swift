import Foundation

enum NostrSecretBech32 {
  private static let alphabet = Array("qpzry9x8gf2tvdw0s3jn54khce6mua7l")
  private static let generators: [UInt32] = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]

  static func encode(_ secret: Data) throws -> String {
    guard secret.count == 32 else { throw DeletionActionFailure.denied }
    var source = Array(secret), words: [UInt8] = []
    defer {
      source.withUnsafeMutableBufferPointer { $0.initialize(repeating: 0) }
      words.withUnsafeMutableBufferPointer { $0.initialize(repeating: 0) }
    }
    var accumulator = 0, bits = 0
    for byte in source {
      accumulator = (accumulator << 8) | Int(byte)
      bits += 8
      while bits >= 5 {
        bits -= 5
        words.append(UInt8((accumulator >> bits) & 31))
      }
    }
    if bits > 0 { words.append(UInt8((accumulator << (5 - bits)) & 31)) }
    let humanReadable = Array("nsec".utf8)
    var checksumInput = humanReadable.map { $0 >> 5 } + [0] + humanReadable.map { $0 & 31 } + words
    checksumInput += Array(repeating: 0, count: 6)
    defer { checksumInput.withUnsafeMutableBufferPointer { $0.initialize(repeating: 0) } }
    let value = polymod(checksumInput) ^ 1
    var result = "nsec1"
    result.reserveCapacity(63)
    for word in words { result.append(alphabet[Int(word)]) }
    for index in 0..<6 { result.append(alphabet[Int((value >> UInt32(5 * (5 - index))) & 31)]) }
    guard result.count == 63 else { throw DeletionActionFailure.denied }
    return result
  }

  private static func polymod(_ values: [UInt8]) -> UInt32 {
    var checksum: UInt32 = 1
    for value in values {
      let top = checksum >> 25
      checksum = ((checksum & 0x1ffffff) << 5) ^ UInt32(value)
      for index in 0..<5 where ((top >> UInt32(index)) & 1) != 0 { checksum ^= generators[index] }
    }
    return checksum
  }
}
