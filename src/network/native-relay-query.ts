import type { NostrEvent } from 'nostr-tools/pure';
import type { NativePublishedRelayPort } from '../napplets/native-published-relay.ts';
import { parsePublishedRelayMessage } from '../napplets/published-relay-wire.ts';
import { normalizeRelayUrl, MAX_RELAYS_PER_ROLE } from './relay-settings.ts';
import { utf8Bytes } from '../storage/codec.ts';
import { parseQueryFilters, QUERY_LIMITS, RelayQueryError, selectQueryEvents, verifyQueryEvent, type QueryFilter } from './relay-query-contract.ts';

export interface RelayQueryService {
  query(filters: readonly QueryFilter[], signal: AbortSignal, assertActive: () => void): Promise<readonly Readonly<{ event: NostrEvent }>[]>;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
function parseFrames(input: unknown, subscription: string, filters: readonly QueryFilter[]): NostrEvent[] {
  if (!Array.isArray(input) || input.length < 1 || input.length > QUERY_LIMITS.frames) throw new RelayQueryError();
  let eose = false, bytes = 0;
  const events: NostrEvent[] = [];
  for (const frame of input) {
    if (typeof frame !== 'string' || eose || (bytes += utf8Bytes(frame)) > 2 * 1024 * 1024) throw new RelayQueryError();
    const message = parsePublishedRelayMessage(frame, subscription);
    if (message.type === 'eose') eose = true;
    else if (message.type === 'event') {
      if (events.length >= QUERY_LIMITS.events) throw new RelayQueryError();
      events.push(verifyQueryEvent(message.event, filters));
    } else if (message.type !== 'notice') throw new RelayQueryError();
  }
  if (!eose) throw new RelayQueryError();
  return events;
}
/** App-side only. Destinations come from trusted Network settings, never guest JSON. */
export function createNativeRelayQuery(port: Pick<NativePublishedRelayPort, 'newInstanceId' | 'queryPublishedRelay' | 'cancelPublishedRelay'>,
  destinations: () => readonly string[], timeoutMs: number = QUERY_LIMITS.timeoutMs): RelayQueryService {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > QUERY_LIMITS.timeoutMs) throw new RelayQueryError();
  let concurrent = 0;
  return Object.freeze({
    async query(input: readonly QueryFilter[], signal: AbortSignal, assertActive: () => void) {
      const filters = parseQueryFilters(input);
      const configured = destinations();
      if (!Array.isArray(configured) || configured.length < 1 || configured.length > MAX_RELAYS_PER_ROLE) throw new RelayQueryError('relay query unavailable');
      const relays = configured.map(normalizeRelayUrl);
      if (new Set(relays).size !== relays.length || concurrent >= QUERY_LIMITS.concurrent) throw new RelayQueryError('relay query busy');
      const active = () => { if (signal.aborted) throw new RelayQueryError('relay query cancelled'); assertActive(); };
      active();
      concurrent++;
      const controller = new AbortController();
      const cancelledSignal = controller.signal;
      let pending: string | null = null;
      const used = new Set<string>();
      const cancel = () => {
        controller.abort();
        const operation = pending; pending = null;
        if (operation !== null) { try { port.cancelPublishedRelay(operation); } catch { /* Native deadline remains the backstop. */ } }
      };
      const timer = setTimeout(cancel, timeoutMs);
      signal.addEventListener('abort', cancel, { once: true });
      let stop!: () => void;
      const cancelled = new Promise<never>((_, reject) => { stop = () => reject(new RelayQueryError('relay query cancelled or timed out')); });
      cancelledSignal.addEventListener('abort', stop, { once: true });
      try {
        if (signal.aborted) cancel();
        const work = async () => {
          const events = new Map<string, NostrEvent>();
          let successes = 0, bytes = 0;
          for (const relay of relays) {
            active();
            if (cancelledSignal.aborted) throw new RelayQueryError();
            const operation = port.newInstanceId();
            if (!uuid.test(operation) || used.has(operation)) throw new RelayQueryError();
            used.add(operation);
            const subscription = 'query_' + operation.replaceAll('-', '');
            const wire = JSON.stringify(['REQ', subscription, ...filters]);
            pending = operation;
            let batch: NostrEvent[];
            try {
              active();
              const frames = await port.queryPublishedRelay(operation, relay, wire, subscription);
              active();
              if (cancelledSignal.aborted) throw new RelayQueryError();
              batch = parseFrames(frames, subscription, filters);
            } catch {
              active();
              if (cancelledSignal.aborted) throw new RelayQueryError();
              continue;
            } finally { if (pending === operation) pending = null; }
            for (const event of batch) {
              if (events.has(event.id)) continue;
              bytes += utf8Bytes(JSON.stringify(event));
              if (events.size >= QUERY_LIMITS.events || bytes > QUERY_LIMITS.resultBytes) throw new RelayQueryError('relay query exceeded limits');
              events.set(event.id, event);
            }
            successes++;
          }
          active();
          if (successes === 0) throw new RelayQueryError();
          return selectQueryEvents([...events.values()], filters);
        };
        return await Promise.race([work(), cancelled]);
      } finally {
        cancel(); clearTimeout(timer); signal.removeEventListener('abort', cancel);
        cancelledSignal.removeEventListener('abort', stop); concurrent--;
      }
    },
  });
}
