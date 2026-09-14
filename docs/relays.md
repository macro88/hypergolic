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
lists precedence; Hypergolic's automatic NIP-65 relay-list discovery/routing is
confirmed deferred beyond v1. A lookup relay used to retrieve an explicitly requested
napplet manifest does not itself enable automatic account relay-list discovery.

## Integration status

The JSON is the selected startup data for the forthcoming native relay/settings
implementation. The current static scaffold does not yet consume it or open relay
connections. Endpoint availability, authentication requirements and read/write
acceptance have not been tested by adopting these values. Every v1 event update
still requires explicit shell confirmation before signing/publication.

The controlled test relay remains separate from these public defaults. Fixture
publisher/signing details and concrete release relay/Blossom targets still need
configuration and verification. RocketShell's separate Blossom fallback was observed
but is not selected by this relay-list request.
