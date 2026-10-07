import Foundation
@main struct FixtureReleaseProof {
  final class Clock: @unchecked Sendable {var now: Int64=100}
  static func main() {
    let clock=Clock(), owner=FixtureReleaseAuthority(clock:{clock.now});var count=0
    func check(_ value: Bool) {count+=1;precondition(value,"fixture release check \(count)")}
    let user=String(repeating:"11",count:32), next=String(repeating:"22",count:32), server="https://files.example.com"
    let bytes=Data("<!doctype html><html><body>fixture</body></html>".utf8), hash=FixtureReleaseAuthority.hash(bytes)
    check(owner.prepare("feed-lab",bytes:bytes,expectedHash:hash,server:server,tags:"[]") == nil)
    check(owner.synchronize(user,epoch:0,available:true));owner.foreground(true)
    check(!owner.synchronize(next,epoch:0,available:true))
    check(owner.prepare("feed-lab",bytes:bytes,expectedHash:String(repeating:"00",count:32),server:server,tags:"[]") == nil)
    var row=owner.prepare("feed-lab",bytes:bytes,expectedHash:hash,server:server,tags:"[]")!;check(row.review.mimeType == "text/html" && row.review.sha256 == hash)
    check(!owner.prepareManifest(row.token,snapshot:"manifest"));check(!owner.approveUpload("forged-token"))
    check(owner.approveUpload(row.token));check(!owner.approveUpload(row.token));check(!owner.verifyRetrieved(row.token,bytes:bytes))
    check(owner.uploads.claimTransfer(row.grant!));check(!owner.uploads.claimTransfer(row.grant!))
    check(owner.uploads.dispatch(row.grant!) == bytes);check(owner.uploads.dispatch(row.grant!) == nil)
    check(!owner.verifyRetrieved(row.token,bytes:Data([1])));check(owner.verifyRetrieved(row.token,bytes:bytes));check(!owner.uploadApproved(row.token))
    check(owner.prepareManifest(row.token,snapshot:"manifest-exact"));check(!owner.prepareManifest(row.token,snapshot:"changed"));check(owner.approveManifest("forged-token") == nil)
    check(owner.approveManifest(row.token) == "manifest-exact");check(owner.approveManifest(row.token) == nil);check(owner.manifestApproved(row.token))
    owner.foreground(false);check(!owner.manifestApproved(row.token));owner.foreground(true);check(owner.current(row.token) == nil)
    row=owner.prepare("feed-lab",bytes:bytes,expectedHash:hash,server:server,tags:"[]")!;check(owner.approveUpload(row.token))
    check(owner.synchronize(next,epoch:1,available:true));check(!owner.uploadApproved(row.token));check(!owner.synchronize(user,epoch:0,available:true))
    row=owner.prepare("feed-lab",bytes:bytes,expectedHash:hash,server:server,tags:"[]")!;check(row.identity == next)
    clock.now+=600001;check(!owner.approveUpload(row.token))
    row=owner.prepare("feed-lab",bytes:bytes,expectedHash:hash,server:server,tags:"[]")!;check(owner.approveUpload(row.token))
    clock.now+=60001;check(!owner.uploadApproved(row.token));owner.cancel();check(owner.current(row.token) == nil)
    print("PASS Swift trusted fixture release authority \(count) assertions; core only")
  }
}
