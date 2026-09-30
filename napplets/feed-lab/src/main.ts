import { relay, type NostrFilter } from '@napplet/sdk';
import './style.css';
function element<T extends HTMLElement>(id: string): T {
  const value = document.getElementById(id);
  if (!value) throw new Error('Missing fixture control');
  return value as T;
}
const lab = element('lab'), status = element('status'), events = element<HTMLOListElement>('events');
const filters = element<HTMLTextAreaElement>('filters'), query = element<HTMLButtonElement>('query'), empty = element<HTMLButtonElement>('empty');
const start = element<HTMLButtonElement>('subscribe'), close = element<HTMLButtonElement>('close'), streamStatus = element('stream-status');
let subscription: ReturnType<typeof relay.subscribe> | null = null;
let streamCount = 0, eose = false;
const recentIds = new Set<string>();
let disposed = false, busy = false, ready = false;
function controls(): void {
  query.disabled = empty.disabled = !ready || busy || disposed || subscription !== null;
  start.disabled = !ready || busy || disposed || subscription !== null;
  close.disabled = subscription === null || disposed;
}
function read(): void {
  if (busy || disposed || !ready) return;
  busy = true; controls(); events.replaceChildren(); status.textContent = 'Reading notes…'; lab.dataset.state = 'loading';
  try {
    const input: unknown = JSON.parse(filters.value);
    if (!Array.isArray(input) || input.length < 1 || input.length > 4 || !input.every(value => value && typeof value === 'object' && !Array.isArray(value))) throw new Error('Enter a list of query filters.');
    void relay.query(input as NostrFilter[]).then(result => {
    if (disposed) return;
    if (!Array.isArray(result) || result.length > 32) throw new Error('Invalid query result.');
    for (const { event } of result) {
      if (!event || typeof event.content !== 'string' || typeof event.id !== 'string') throw new Error('Invalid event result.');
      const row = document.createElement('li'), content = document.createElement('p'), id = document.createElement('code');
      content.textContent = event.content; id.textContent = event.id; row.append(content, id); events.append(row);
    }
    lab.dataset.state = result.length ? 'success' : 'empty';
    status.textContent = result.length ? `Received ${result.length} signed note${result.length === 1 ? '' : 's'}.` : 'Query completed. No matching notes.';
    }).catch(failure).finally(() => { busy = false; controls(); });
  } catch (error) { failure(error); busy = false; controls(); }
}
function failure(error: unknown): void {
  if (disposed) return;
  events.replaceChildren(); lab.dataset.state = 'error';
  status.textContent = `Query failed: ${error instanceof Error ? error.message : 'unavailable'}`;
}
function liveStatus(): void {
  streamStatus.textContent = `Live · ${streamCount} signed note${streamCount === 1 ? '' : 's'}${eose ? ' · history loaded' : ' · loading history'}.`;
}
function stopLive(): void {
  const current = subscription; subscription = null; current?.close();
  streamStatus.textContent = 'Live feed closed.'; lab.dataset.stream = 'closed'; controls();
}
start.addEventListener('click', () => {
  if (disposed || busy || !ready || subscription) return;
  try {
    const input: unknown = JSON.parse(filters.value);
    if (!Array.isArray(input) || input.length < 1 || input.length > 4 || !input.every(value => value && typeof value === 'object' && !Array.isArray(value))) throw new Error('Enter a list of note filters.');
    events.replaceChildren(); recentIds.clear(); streamCount = 0; eose = false; liveStatus(); lab.dataset.stream = 'open';
    subscription = relay.subscribe(input as NostrFilter[], ({ event }) => {
      if (disposed || !subscription || recentIds.has(event.id)) return;
      if (typeof event.content !== 'string' || typeof event.id !== 'string') { stopLive(); return; }
      const row = document.createElement('li'), content = document.createElement('p'), id = document.createElement('code');
      row.dataset.eventId = event.id; content.textContent = event.content; id.textContent = event.id; row.append(content, id); events.prepend(row);
      recentIds.add(event.id); streamCount++;
      if (events.children.length > 32) { const last = events.lastElementChild as HTMLElement; recentIds.delete(last.dataset.eventId!); last.remove(); }
      if (streamCount >= Number.MAX_SAFE_INTEGER) { stopLive(); return; }
      liveStatus();
    }, () => { if (!disposed && subscription) { eose = true; liveStatus(); } });
    controls();
  } catch (error) { stopLive(); streamStatus.textContent = `Live feed failed: ${error instanceof Error ? error.message : 'unavailable'}`; }
});
close.addEventListener('click', stopLive);
// The SDK handle has no terminal callback. The captured parent is the sole shell sender.
window.addEventListener('message', event => {
  if (event.source !== parent || !subscription || event.data?.type !== 'relay.closed') return;
  subscription = null; lab.dataset.stream = 'closed';
  streamStatus.textContent = `Live feed closed: ${typeof event.data.reason === 'string' ? event.data.reason : 'unavailable'}`; controls();
});
query.addEventListener('click', () => { void read(); });
empty.addEventListener('click', () => { filters.value = '[{"kinds":[1],"limit":0}]'; void read(); });
window.addEventListener('pagehide', () => { stopLive(); disposed = true; controls(); }, { once: true });
controls();
ready = true; lab.dataset.ready = 'true'; status.textContent = 'Ready to query.'; controls();
