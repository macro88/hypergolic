# Default relays

The approved first-run relay configuration is
[`src/config/default-relays.json`](../src/config/default-relays.json), taken from
RocketShell's production defaults at revision `0b46d9cf8369576f11d87b92aa5436920fdfcd87`,
inspected on 14 September 2026. Preserve the two roles and order:

| Role | Relay URLs, in order |
| --- | --- |
| Network reads and approved writes | `wss://relay.damus.io`, `wss://nos.lol`, `wss://bucket.coracle.social` |
| Lookup and manifest discovery | `wss://purplepag.es`, `wss://relay.damus.io`, `wss://nos.lol` |

## Source evidence

RocketShell's [constants and first-run settings](https://github.com/nostrocket/rocketshell/blob/0b46d9cf8369576f11d87b92aa5436920fdfcd87/apps/shell/src/platform.ts#L24-L35)
map its network array to `backupRelays` and discovery array to `lookupRelays`.
Its [platform initialization](https://github.com/nostrocket/rocketshell/blob/0b46d9cf8369576f11d87b92aa5436920fdfcd87/apps/shell/src/platform.ts#L93-L104)
then uses those lists for discovery and the read/write tiers. These are production
seed settings, not URLs taken from tests or example napplets.

Hypergolic adopts the endpoint lists as editable local defaults. The implementation
must seed them only when no saved configuration exists, preserve explicit user edits,
and use the selected local lists for v1. RocketShell also gives published account
lists precedence; Hypergolic now implements the selected NIP-65 discovery/routing profile described
in [Outbox routing](outbox-routing.md), whose complete physical acceptance remains
open. Its role rules govern how account lists and explicit local settings interact. A lookup relay used to retrieve an explicitly requested
napplet manifest does not itself enable automatic account relay-list discovery.

## Integration status

The native settings service seeds the JSON values on first open in a dedicated
SQLite database, then preserves edits and explicit empty lists across restarts.
Trusted settings provide separate Network and Lookup controls to add or remove
secure WebSocket URLs and restore either role's defaults. A storage failure keeps
identity entry available, makes relay settings visibly unavailable and rejects
new publication requests before signing. The signing approval path snapshots the
current Network list when a request is admitted; it no longer holds the startup
defaults for the process lifetime.

Lookup selections feed the connected published-napplet transport adapter.
[Bounded historical queries](relay-query.md) snapshot the current Network list and
use native WSS. [Public identity data](public-identity-data.md) uses that query
service for profile reads. Each linked capability document records its own physical
evidence and remaining acceptance requirements; setting an endpoint is not proof
that a query, subscription or publication reached it. Availability, AUTH and write acceptance cannot be inferred from adopting
endpoint defaults. Every event update still requires explicit shell confirmation
before signing/publication.

The controlled test relay remains separate from these public defaults. [Fixture publisher](fixture-publisher.md) records the separate signing authority
and release relay/Blossom configuration and verification. RocketShell's separate Blossom fallback was observed
but is not selected by this relay-list request.


## Ordinary physical Android settings — 11 October 2026

The retained standalone protected-owner app passes seven workflow groups using
actual native Settings controls: both exact ordered default arrays; ten invalid
URL and two duplicate rejections with unchanged lists; separate-role removal and
append; modified-list persistence after a real stopped-process/new-process launch;
both explicitly empty lists surviving another cold launch; selected-role-only
explicit default restoration; and both restored arrays surviving a third cold
launch. The full public development identity and empty workspace remain unchanged.
Original screenshots and native accessibility inventories record the observed
values, selected role and matching Remove controls. No event-publication action,
identity mutation, app install or data reset is part of this workflow.

The initial observer incorrectly treated a URL placeholder as entered text, then
failed cleanup because Settings was already open. Both failed records remain;
a separate verified recovery restores the original lists and removes the owned
observer before the corrected complete rerun. The earlier first Settings press
miss is also retained without claiming a product repair. Exact installed APK/path,
source inputs and package inventory match after the passing run; the hash-matching
helper is removed. This does not establish complete database byte rollback.

The portable driver is
[`relay-settings-physical-android.py`](../tests/native/network/relay-settings-physical-android.py).
It requires the retained APK/build receipt, the existing native UI observer JAR,
an explicit expected development npub, a connected serial and a fresh output
folder. It refuses a non-default starting relay list rather than overwriting
unknown settings. The executed private copy differs only in checkout-path binding
and the portable file's header; original byte-bound execution evidence is retained
separately.

Seven current shared service/disk-SQLite tests also pass, including first-open
seeding, invalid persisted data rejection and no automatic reseeding. Fresh-profile
physical first-run seeding and the complete iPhone settings workflow remain open;
RELAY-01 stays partial. Availability/AUTH, Outbox delivery, screen-reader usability
and full Phase 2 acceptance require their own evidence.


### Fresh-profile preparation and installation gate

A separate unique-package ordinary-entry QA Release now builds offline in 35
seconds. All 103 app/runtime assets, including the Hermes bundle, and all 21 native
libraries match the retained ordinary APK byte for byte. The app label, signing
certificate and permission profile are preserved; only the temporary test package
has its own installation/storage identity. Generated packaging and all 1,473
source inputs are restored unchanged.

The physical installation returns `INSTALL_FAILED_USER_RESTRICTED: Install
canceled by user`. The fresh package never launches, so no first-run result is
claimed. Independent cleanup verifies the exact test package absent, owned UI
observer/staged APK absent, original package inventory and retained APK/path
unchanged. Trusted Settings also confirms the original public development identity
and empty workspace. The prepared signed APK is retained for an owner-attended
installation retry. No device security setting or retained app data is changed.
RELAY-01 stays partial; this failed admission is separate from the passing ordinary
Settings workflow above.
