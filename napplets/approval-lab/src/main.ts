import { identity, relay, type EventTemplate } from '@napplet/sdk';
import { element } from './view';
import { connectTheme } from './theme';
import './style.css';

const LIMIT = 4;
const DELAY_MS = 5_000;
const controls = element<HTMLFieldSetElement>('controls');
const contentInput = element<HTMLTextAreaElement>('content');
const results = element<HTMLOListElement>('results');
const send = element<HTMLButtonElement>('send');
const sendThree = element<HTMLButtonElement>('send-three');
const sendDelayed = element<HTMLButtonElement>('send-delayed');
const clear = element<HTMLButtonElement>('clear');

type State = 'scheduled' | 'sending' | 'published' | 'failed' | 'cancelled' | 'ignored';
type Request = {
  sequence: number;
  epoch: number;
  event: EventTemplate;
  state: State;
  row: HTMLLIElement;
};

let publicKey = '';
let identityEpoch = 0;
let disposed = false;
let nextSequence = 1;
let createdCount = 0;
const requests = new Map<number, Request>();
const timers = new Map<number, number>();

// NAP-RELAY's selected contract accepts this unsigned shape. Keep the package
// type adaptation here so fixture requests never acquire placeholder signed fields.
const publishUnsigned = (event: EventTemplate): Promise<unknown> => relay.publish(event);

function active(request: Request): boolean {
  return request.state === 'scheduled' || request.state === 'sending';
}

function activeCount(): number {
  return [...requests.values()].filter(active).length;
}

function updateControls(): void {
  const remaining = LIMIT - activeCount();
  controls.disabled = disposed || !publicKey;
  send.disabled = remaining < 1;
  sendDelayed.disabled = remaining < 1;
  sendThree.disabled = remaining < 3;
  clear.disabled = ![...requests.values()].some((request) => !active(request));
  element('pending').textContent = String(activeCount());
  element('requests').textContent = String(createdCount);
}

function statusText(state: State): string {
  if (state === 'scheduled') return 'Waiting 5 seconds';
  if (state === 'sending') return 'Waiting for shell approval';
  if (state === 'published') return 'Published';
  if (state === 'failed') return 'Failed';
  if (state === 'cancelled') return 'Cancelled before submission';
  return 'Ignored after identity changed';
}

function paint(request: Request, detail = ''): void {
  request.row.dataset.state = request.state;
  request.row.querySelector<HTMLElement>('.request-state')!.textContent = statusText(request.state);
  request.row.querySelector<HTMLElement>('.event-id')!.textContent = detail;
}

function makeRow(sequence: number, content: string): HTMLLIElement {
  const row = document.createElement('li');
  row.className = 'request';
  row.dataset.sequence = String(sequence);
  const head = document.createElement('div');
  head.className = 'request-head';
  const correlation = document.createElement('span');
  correlation.textContent = `Local request ${sequence}`;
  const state = document.createElement('span');
  state.className = 'request-state';
  head.append(correlation, state);
  const body = document.createElement('code');
  body.className = 'request-content';
  body.textContent = content;
  const eventId = document.createElement('output');
  eventId.className = 'event-id';
  row.append(head, body, eventId);
  results.prepend(row);
  return row;
}

function createRequest(state: 'scheduled' | 'sending'): Request | null {
  if (disposed || !publicKey || activeCount() >= LIMIT) return null;
  const sequence = nextSequence++;
  const tags: string[][] = [
    ['t', 'hypergolic-approval-lab'],
    ['test-sequence', String(sequence)],
  ];
  tags.forEach(Object.freeze);
  Object.freeze(tags);
  const event = Object.freeze({
    kind: 1,
    content: contentInput.value,
    tags,
    created_at: Math.floor(Date.now() / 1_000),
  }) as EventTemplate;
  const request: Request = {
    sequence,
    epoch: identityEpoch,
    event,
    state,
    row: makeRow(sequence, event.content),
  };
  requests.set(sequence, request);
  createdCount++;
  paint(request);
  element('status').textContent = state === 'scheduled'
    ? `Request ${sequence} captured. Submission waits 5 seconds.`
    : `Request ${sequence} captured and sent to the shell.`;
  updateControls();
  return request;
}

function eventId(value: unknown): string {
  if (typeof value !== 'object' || value === null || !('id' in value)) return '';
  const id = (value as { id?: unknown }).id;
  return typeof id === 'string' && /^[0-9a-f]{64}$/i.test(id) ? id : '';
}

async function issue(request: Request): Promise<void> {
  timers.delete(request.sequence);
  if (disposed || request.epoch !== identityEpoch || !active(request)) return;
  request.state = 'sending';
  paint(request);
  updateControls();
  try {
    const result = await publishUnsigned(request.event);
    if (disposed || request.epoch !== identityEpoch || request.state !== 'sending') return;
    const id = eventId(result);
    if (!id) {
      request.state = 'failed';
      paint(request, 'Shell returned no verifiable event ID');
      element('status').textContent = `Request ${request.sequence} failed. No automatic retry.`;
      return;
    }
    request.state = 'published';
    paint(request, `Event ID ${id}`);
    element('status').textContent = `Request ${request.sequence} published.`;
  } catch (error) {
    if (disposed || request.epoch !== identityEpoch || request.state !== 'sending') return;
    request.state = 'failed';
    const message = error instanceof Error ? error.message.slice(0, 240) : 'publication unavailable';
    paint(request, message);
    element('status').textContent = `Request ${request.sequence} failed. No automatic retry.`;
  } finally {
    updateControls();
  }
}

function submitOne(): void {
  const request = createRequest('sending');
  if (request) void issue(request);
}

function submitThree(): void {
  if (LIMIT - activeCount() < 3) return;
  for (let index = 0; index < 3; index++) {
    const request = createRequest('sending');
    if (request) void issue(request);
  }
}

function submitDelayed(): void {
  const request = createRequest('scheduled');
  if (!request) return;
  timers.set(request.sequence, window.setTimeout(() => { void issue(request); }, DELAY_MS));
}

function invalidateActive(reason: 'identity' | 'pagehide'): void {
  identityEpoch++;
  for (const request of requests.values()) {
    if (!active(request)) continue;
    const timer = timers.get(request.sequence);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.delete(request.sequence);
      request.state = 'cancelled';
    } else {
      request.state = 'ignored';
    }
    paint(request, reason === 'identity' ? 'Identity changed before completion' : 'Page closed before completion');
  }
  updateControls();
}

function acceptIdentity(value: string): void {
  invalidateActive('identity');
  publicKey = /^[0-9a-f]{64}$/.test(value) ? value : '';
  element('identity').textContent = publicKey;
  element('identity-status').textContent = publicKey ? 'Identity connected' : 'No identity selected';
  updateControls();
}

async function connectIdentity(): Promise<void> {
  let changed = false;
  try {
    const subscription = identity.onChanged((value) => {
      if (disposed) return;
      changed = true;
      acceptIdentity(value);
    });
    window.addEventListener('pagehide', () => {
      if (disposed) return;
      disposed = true;
      invalidateActive('pagehide');
      subscription.close();
      updateControls();
    });
    const initial = await identity.getPublicKey();
    if (!changed && !disposed) acceptIdentity(initial);
  } catch {
    if (!changed && !disposed) {
      controls.disabled = true;
      element('identity-status').textContent = 'Open in a shell with identity and relay access';
    }
  }
}

send.addEventListener('click', submitOne);
sendThree.addEventListener('click', submitThree);
sendDelayed.addEventListener('click', submitDelayed);
clear.addEventListener('click', () => {
  for (const [sequence, request] of requests) {
    if (!active(request)) {
      request.row.remove();
      requests.delete(sequence);
    }
  }
  element('status').textContent = activeCount() ? 'Completed results cleared.' : 'Results cleared.';
  updateControls();
});

element('lab').dataset.ready = 'true';
updateControls();
void connectIdentity();
void connectTheme();
