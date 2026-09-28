import { finalizeEvent, verifyEvent } from 'nostr-tools/pure';
import { sha256, validateReleasePair } from './release-pair.mjs';

const TIMEOUT_MS = 20_000;

export async function uploadRevision(server, revision, secret, fetcher = fetch) {
  const url = new URL(server);
  const now = Math.floor(Date.now() / 1000);
  const token = finalizeEvent({ kind: 24242, created_at: now, content: 'Upload Hypergolic disposable QA HTML', tags: [
    ['t', 'upload'], ['expiration', String(now + 300)], ['server', url.hostname.toLowerCase()], ['x', revision.hash],
  ] }, secret);
  if (!verifyEvent(token)) throw new Error('Blossom authorization signature failed');
  const bytes = Buffer.from(revision.html);
  const result = await fetcher(new URL('/upload', url), {
    method: 'PUT', redirect: 'manual', signal: AbortSignal.timeout(TIMEOUT_MS), body: bytes,
    headers: {
      'Content-Type': 'text/html; charset=utf-8', 'Content-Length': String(bytes.length),
      'X-SHA-256': revision.hash,
      Authorization: 'Nostr ' + Buffer.from(JSON.stringify(token)).toString('base64url'),
    },
  });
  if (result.status !== 200 && result.status !== 201) throw new Error('Blossom upload rejected: HTTP ' + result.status);
  const descriptor = await result.json();
  if (descriptor?.sha256 !== revision.hash || descriptor.size !== bytes.length) throw new Error('Blossom descriptor mismatch');
  const readback = await verifyPublicBlob(server, revision, fetcher);
  return { status: result.status, hash: revision.hash, bytes: readback.bytes };
}

export async function verifyPublicBlob(server, revision, fetcher = fetch) {
  const readback = await fetcher(new URL(revision.hash, server), {
    method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (readback.status !== 200 || readback.redirected) throw new Error('Blossom direct readback failed');
  const body = Buffer.from(await readback.arrayBuffer());
  if (body.length !== Buffer.byteLength(revision.html) || sha256(body) !== revision.hash) {
    throw new Error('Blossom readback mismatch');
  }
  return { hash: revision.hash, bytes: body.length };
}

export async function uploadPair(bundle, secret, fetcher = fetcherDefault) {
  validateReleasePair(bundle);
  const receipts = [];
  for (const revision of bundle.revisions) receipts.push(await uploadRevision(bundle.server, revision, secret, fetcher));
  return receipts;
}

function fetcherDefault(...args) { return fetch(...args); }

export function publishToRelay(relay, event, WebSocketClass = WebSocket) {
  if (!verifyEvent(event)) return Promise.reject(new Error('Unsigned QA event'));
  return new Promise((resolve, reject) => {
    let settled = false;
    const socket = new WebSocketClass(relay);
    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { socket.close(); } catch { /* close after settle */ }
      if (error) reject(error); else resolve(result);
    };
    const timer = setTimeout(() => finish(new Error('Relay publication timeout')), TIMEOUT_MS);
    socket.onopen = () => socket.send(JSON.stringify(['EVENT', event]));
    socket.onmessage = message => {
      let reply;
      try { reply = JSON.parse(message.data); } catch { return; }
      if (!Array.isArray(reply) || reply[0] !== 'OK' || reply[1] !== event.id) return;
      if (reply[2] === true) finish(null, { relay, eventId: event.id, accepted: true });
      else finish(new Error('Relay rejected signed QA event: ' + String(reply[3] ?? 'unknown')));
    };
    socket.onerror = () => finish(new Error('Relay publication transport failed'));
    socket.onclose = () => finish(new Error('Relay closed before publication acknowledgement'));
  });
}

export async function publishRevision(bundle, revision, WebSocketClass = WebSocket) {
  validateReleasePair(bundle);
  const index = revision === 'v1' ? 0 : revision === 'v2' ? 1 : -1;
  if (index < 0) throw new Error('Select v1 or v2');
  const event = bundle.revisions[index].event;
  const results = await Promise.allSettled(bundle.relays.map(relay => publishToRelay(relay, event, WebSocketClass)));
  const accepted = results.filter(result => result.status === 'fulfilled').map(result => result.value);
  if (accepted.length === 0) throw new Error('No configured lookup relay accepted the QA revision');
  return { revision, eventId: event.id, accepted, failures: results.length - accepted.length };
}
