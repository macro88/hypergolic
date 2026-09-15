import type { NappletMessage } from '@kehto/runtime';

export interface NativeHost {
  postMessage(message: string): void;
  addEventListener?(type: 'message', listener: (event: { data: unknown }) => void): void;
  removeEventListener?(type: 'message', listener: (event: { data: unknown }) => void): void;
}
const maxBytes = 2 * 1024 * 1024;
/** Trusted top document only. A response never selects its destination window. */
export function createNativeClient(native: NativeHost, generation: string) {
  let sequence = 0, disposed = false;
  const pending = new Map<number, { type: string; id: string; timer: number;
    resolve: (message: NappletMessage) => void; reject: () => void }>();
  const receive = (raw: unknown): void => {
    if (disposed || typeof raw !== 'string' || new TextEncoder().encode(raw).length > maxBytes) return;
    try {
      const envelope = JSON.parse(raw);
      if (!envelope || Object.keys(envelope).length !== 4 || envelope.type !== 'capability.result' ||
          envelope.sessionId !== generation || !Number.isSafeInteger(envelope.sequence)) return;
      const request = pending.get(envelope.sequence);
      if (!request) return;
      try {
        if (typeof envelope.response !== 'string') throw new Error('Native request denied');
        const response = JSON.parse(envelope.response);
        if (!response || response.type !== request.type + '.result' || response.id !== request.id) throw new Error('Native response mismatch');
        request.resolve(response);
      } catch { request.reject(); }
      finally { pending.delete(envelope.sequence); window.clearTimeout(request.timer); }
    } catch { /* An invalid native response has no destination or authority. */ }
  };
  const android = (event: { data: unknown }): void => receive(event.data);
  const ios = (event: MessageEvent): void => {
    if (event.isTrusted && event.source === window && event.data?.type === 'hypergolic.native-response' &&
        Object.keys(event.data).length === 2) receive(event.data.message);
  };
  native.addEventListener?.('message', android);
  window.addEventListener('message', ios);
  return Object.freeze({
    request(message: NappletMessage): Promise<NappletMessage> {
      if (disposed || pending.size >= 4 || sequence >= Number.MAX_SAFE_INTEGER || !('id' in message) || typeof message.id !== 'string') {
        return Promise.reject(new Error('Native capability unavailable'));
      }
      const id = message.id;
      const counter = sequence + 1;
      const encoded = JSON.stringify({ type: 'capability', sessionId: generation, sequence: counter, message: JSON.stringify(message) });
      if (new TextEncoder().encode(encoded).length > maxBytes) return Promise.reject(new Error('Native request too large'));
      sequence = counter;
      return new Promise((resolve, rejectPromise) => {
        const reject = (): void => rejectPromise(new Error('Native capability unavailable'));
        const timer = window.setTimeout(() => { pending.delete(counter); reject(); }, 27_000);
        pending.set(counter, { type: message.type, id, timer, resolve, reject });
        try { native.postMessage(encoded); }
        catch { pending.delete(counter); window.clearTimeout(timer); reject(); }
      });
    },
    destroy(): void {
      disposed = true;
      native.removeEventListener?.('message', android);
      window.removeEventListener('message', ios);
      for (const request of pending.values()) { window.clearTimeout(request.timer); request.reject(); }
      pending.clear();
    },
  });
}
