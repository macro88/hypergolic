# Notifications and configuration

Hypergolic implements the selected NAP-NOTIFY and NAP-CONFIG drafts through the
published napplet capability boundary. They remain drafts, not released standards.
Phase 2.8 accepts the selected profile under the existing exact dependency
exceptions. Complete published and physical-device acceptance remains CAP-14.

## Selected contracts

| Contract | Pinned revision | Document SHA256 |
| --- | --- | --- |
| NAP-NOTIFY | `e14f5c9d6a6dd2a69ccf79668c4a3c1e955e1ac9` | `892d338587627f71899a4594096cf08795faa5e9fa230af72c31083f12abc5a2` |
| NAP-CONFIG | `448013e6d8cb8c75dce49576b3e7c0d46d960eac` | `2d34af51d84edd4353ec142002d9ffe0a7a5477ce9b0fd71835273fd4034931b` |

The genuine pinned SDK produces the public messages. A captured native registration
supplies identity, publisher, application, artifact version and generation. Guests
cannot select those fields or send trusted shell review decisions. Private request
IDs, native sequence leases, revision checks and captured recipients fence replies
and pushes. The opt-in locked runtime patch exposes the selected domains while
preserving runtime source, session, domain and ACL checks.

## Foreground notifications

The trusted shell attributes each card and badge to its verified application and
publisher. The notification centre supports body clicks, dismissal and up to three
actions. Low-priority notifications appear only in the centre; other priorities
can also show a short foreground toast. The centre entry and compact toast reserve
shell layout space so they do not intercept napplet controls. Guest strings remain plain text. There is
no OS notification or background push service in this profile.

Permission is remembered for one identity, publisher, application and exact
channel. General permission does not authorize named channels. Channels must be
registered before use. The permission review states the requesting source and
channel; Settings lists saved permissions with explicit revocation controls.
Revocation removes that channel's current alerts and badges and prevents pending
work from completing under the old permission. A new request requires fresh
approval.

Loaded foreground napplet switches keep cards and callbacks live. Background,
close, replacement and identity changes clear transient alerts and badges and
revoke old delivery. There is no replay backlog on return. Saved permissions are
separate from transient presentation and remain scoped to their identity.

## Shell-owned configuration

A napplet registers a bounded Core Subset schema and can get or subscribe to
validated values and request its trusted shell editor. The shell is the sole
writer. The editor displays verified source and artifact version, ordered groups,
plain descriptions, enum and boolean controls and validated JSON controls for
primitive arrays or otherwise supported values. Cancel does not save. Save reports
validation errors and preserves the draft; duplicate Save cannot create a second
concurrent write.

Supported schema objects are bounded to depth four. Primitive arrays are
homogeneous. Defaults, required fields, numeric/string/array limits and enum
choices are checked before delivery. References, patterns, unsupported drafts and
secret defaults are rejected. Property defaults take precedence over inherited ancestor defaults under the
selected resolution rules. Invalid values are withheld; an invalid registration
keeps the previous valid schema. Schema changes purge removed or invalid secrets.

Configuration persistence is scoped to identity, publisher, application and the
verified aggregate artifact hash. Instance IDs do not alter persistence. A
same-version restart keeps saved values. A newly accepted artifact hash starts a
fresh scope; this profile does not silently migrate values. Declining an update
keeps the currently loaded version and its configuration.

Secret inputs are masked and never populated with persisted secret text. Explicit
set and clear changes take effect only on Save. A separate native encrypted
configuration namespace holds the whole configuration record, avoiding a split
SQLite/secret transaction. It is separate from identity inventory and nsec slots.
An explicitly supplied secret is delivered in clear text to the authorized napplet
and its same-scope subscribers. It is not safe to supply a secret that the napplet
should never read. A native write already entered may finish in its original scope
after revocation, but no revoked completion or delivery is reported.

The native carrier has a separate maximum structural nesting of forty for routing
messages: schema `properties` and enclosing wire objects add levels beyond schema
object depth. Uploads and other ordinary messages retain the existing depth-twelve
limit. Native byte caps and the stricter schema/value/node limits remain enforced.
The identity-list permission interception also recognizes this routing boundary.

## Interoperability gaps

The selected draft mentions a preferred manifest schema without defining its
encoding. Hypergolic uses public runtime `config.registerSchema`; it does not
invent a manifest encoding. The installed SDK's `config.onSchemaError` returns a
teardown function, while the selected draft describes a subscription close
operation. The fixture calls the installed teardown function. Negative schema
registration ACKs preserve the draft error code on the wire; the SDK displays its
error string without inventing a code prefix.

## Verification boundaries

The signed local Routing Lab fixture calls genuine SDK operations through normal
published admission, native domain checks and trusted Android/iOS controls. Its
identities and explicitly supplied token are disposable public test material, and
its signed events are supplied locally without external publication.

The first notification tracer passes seven checks per host. The configuration
tracer passes eight on Android and seven on iOS, including masked input, live SDK
values and same-version cold restart. Android evidence inspects an actual native
AES-GCM SecureStore record and absence of the supplied marker from its XML. iOS
uses actual Keychain APIs, restart and application-container marker scans; these
Simulator checks do not establish physical Keychain protection or protected-key
acceptance. iOS may display its system password-save suggestion despite autofill
being disabled; the observer explicitly declines it.

Notification lifecycle matrices pass twelve native checks per host; configuration
matrices pass thirteen per host. They cover trusted revocation, foreground retention,
background cleanup, forged controls, flood/oversize, app isolation, depth-four
schemas, orphan secret purge and declined/accepted version updates. The eight final
native runs total seventy-nine checks with identical 408 input fingerprints.
Identity/publisher configuration namespace isolation and subscription ordering also
have owning shared/native-core tests; full protected-identity journeys remain CAP-14.
Both ordinary Release packages and production exports pass. A browser check or a
successful build is not native acceptance. Cross-capability modal integration is
part of final CAP-14 acceptance.
Complete published, physical-device and protected-identity acceptance remains
CAP-14. Existing exact Forge/braces quality exceptions remain visible; the ordinary
quality gates are unchanged.


## Physical configuration checkpoint — 7 October 2026

The ordinary physical iPhone Release app passes ten bundled original-SDK checks
covering schema registration/defaults, initial and live subscription ordering,
trusted editor cancel/save, background return, invalid/forged requests,
unsubscribe and cold restart with the retained protected public identity.
A separate native-editor visual check passes. These are scoped physical results;
full secret lifecycle, namespace/update isolation, published parity, faults and
Android physical acceptance remain open.

The injected runtime facade previously forwarded correlated config.get replies
to config subscribers, producing an extra callback despite no saved change.
The locked Kehto shell patch now forwards only no-id config.values pushes to
subscribers, matching the selected draft and existing native broker/SDK shim.
The original physical assertions pass unchanged after the fix. Chromium and
WebKit reproduce the defect before the patch and pass the new regression after it.
See the [physical checkpoint](../.planning/phases/02.11-published-mvp-acceptance/02.11-03-CHECKPOINT.md)
for installation, retained evidence and remaining limits.
