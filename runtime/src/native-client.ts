import { parseRelaySubscribe, parseRelayClose } from '../../src/network/relay-subscription-contract';
import { verifyQueryEvent } from '../../src/network/relay-query-contract';
import type { QueryFilter } from '../../src/network/relay-query-contract';
import type { NappletMessage } from '@kehto/runtime';

export interface NativeHost {
  postMessage(message: string): void;
  addEventListener?(type: 'message', listener: (event: { data: unknown }) => void): void;
  removeEventListener?(type: 'message', listener: (event: { data: unknown }) => void): void;
}
const maxBytes = 2 * 1024 * 1024;
const ordinaryTimeoutMs = 27_000;
type StreamState={subId:string; filters:readonly QueryFilter[]; timer:number; delivery:number; eose:boolean; controlRevision:number; deliver:(message:NappletMessage)=>void};
type StreamEnvelope={sequence:number;delivery:number;response:unknown};
type NativeClientOptions = Readonly<{ requestTimeoutsMs?: Readonly<Record<string, number>> }>;
function receiveStream(envelope:StreamEnvelope,streams:Map<number,StreamState>,stopStream:(counter:number,notify:boolean)=>void,acknowledge:(envelope:StreamEnvelope)=>void):void {
  const stream=streams.get(envelope.sequence);if(!stream)return;
  try {
    if(!Number.isSafeInteger(envelope.delivery)||envelope.delivery!==stream.delivery+1)throw new Error('Stream delivery mismatch');
    stream.delivery=envelope.delivery;
    if(typeof envelope.response!=='string'||new TextEncoder().encode(envelope.response).length>66*1024)throw new Error('Stream denied');
    const message=JSON.parse(envelope.response);
    if(!message||message.subId!==stream.subId)throw new Error('Stream mismatch');
    if(message.type==='relay.event') {
      if(Object.keys(message).length!==3||!message.result||Object.keys(message.result).length!==1||!('event' in message.result))throw new Error('Invalid stream event');
      const event=verifyQueryEvent(message.result.event,stream.filters);
      if(event.kind===4||event.kind===1059)throw new Error('Unsupported encrypted stream');
      stream.deliver({type:'relay.event',subId:stream.subId,result:{event}} as NappletMessage);
    }else if(message.type==='relay.eose'&&Object.keys(message).length===2) {
      window.clearTimeout(stream.timer);stream.eose=true;stream.deliver(message);
    }else if(message.type==='relay.closed'&&Object.keys(message).every(key=>['type','subId','reason'].includes(key))&&
      (message.reason===undefined||typeof message.reason==='string'&&message.reason.length<=256)) {
      streams.delete(envelope.sequence);window.clearTimeout(stream.timer);stream.eose=true;stream.deliver(message);
    }else throw new Error('Invalid stream lifecycle');
    acknowledge(envelope);
  }catch{stopStream(envelope.sequence,true);}
}
type ControlEnvelope={type:string;sessionId:string;sequence:number;active:boolean;revision:number};
function receiveControl(envelope:ControlEnvelope,generation:string,streams:Map<number,StreamState>,stopStream:(counter:number,notify:boolean)=>void):boolean {
      if(envelope?.type==='capability.stream-control'&&Object.keys(envelope).length===5&&envelope.sessionId===generation&&typeof envelope.active==='boolean'&&Number.isSafeInteger(envelope.revision)&&envelope.revision>=0) {
        const stream=streams.get(envelope.sequence);if(!stream||envelope.revision<=stream.controlRevision)return true;
        stream.controlRevision=envelope.revision;window.clearTimeout(stream.timer);
        if(envelope.active&&!stream.eose)stream.timer=window.setTimeout(()=>stopStream(envelope.sequence,true),ordinaryTimeoutMs);
        return true;
      }
  return false;
}
type PendingRequest={type:string;id:string;timer:number;resolve:(message:NappletMessage)=>void;reject:()=>void};
function receiveOrdinary(envelope:{sequence:number;response:unknown},pending:Map<number,PendingRequest>):void {
  const request = pending.get(envelope.sequence);
  if (!request) return;
  try {
    if (typeof envelope.response !== 'string') throw new Error('Native request denied');
    const response = JSON.parse(envelope.response);
    if (!response || response.type !== request.type + '.result' || response.id !== request.id) throw new Error('Native response mismatch');
    request.resolve(response);
  } catch { request.reject(); }
  finally { pending.delete(envelope.sequence); window.clearTimeout(request.timer); }
}
/** Trusted top document only. A response never selects its destination window. */
export function createNativeClient(native: NativeHost, generation: string, options: NativeClientOptions = {}) {
  let sequence = 0, disposed = false;
  const pending = new Map<number, PendingRequest>();
  const streams = new Map<number, StreamState>();
  const callerIds = new Set<string>();
  const closeNative = (subId:string,id?:string):void => {
    if(disposed || sequence >= Number.MAX_SAFE_INTEGER)return;
    const counter=++sequence;
    try { native.postMessage(JSON.stringify({type:'capability',sessionId:generation,sequence:counter,
      message:JSON.stringify({type:'relay.close',id:id??'native-close-'+counter,subId})})); } catch { /* Native revocation also closes the stream. */ }
  };
  const stopStream = (counter:number,notify:boolean,id?:string):void => {
    const stream=streams.get(counter);if(!stream)return;
    streams.delete(counter);window.clearTimeout(stream.timer);closeNative(stream.subId,id);
    if(notify)stream.deliver({type:'relay.closed',subId:stream.subId,reason:'relay subscription unavailable'} as NappletMessage);
  };
  const acknowledge=(envelope:StreamEnvelope):void => {
    if(sequence>=Number.MAX_SAFE_INTEGER)throw new Error('Native sequence exhausted');
    native.postMessage(JSON.stringify({type:'relay-stream-ack',sessionId:generation,sequence:++sequence,streamSequence:envelope.sequence,delivery:envelope.delivery}));
  };
  const receive = (raw: unknown): void => {
    if (disposed || typeof raw !== 'string' || new TextEncoder().encode(raw).length > maxBytes) return;
    try {
      const envelope = JSON.parse(raw);
      if(receiveControl(envelope,generation,streams,stopStream))return;
      if (!envelope || Object.keys(envelope).length !== (envelope.type==='capability.stream'?5:4) || !['capability.result','capability.stream'].includes(envelope.type) ||
          envelope.sessionId !== generation || !Number.isSafeInteger(envelope.sequence)) return;
      if(envelope.type==='capability.stream') {
        receiveStream(envelope,streams,stopStream,acknowledge);
        return;
      }
      receiveOrdinary(envelope,pending);
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
    subscribe(message:NappletMessage,deliver:(message:NappletMessage)=>void):void {
      const request=parseRelaySubscribe(message);
      if(disposed||streams.size>=2||callerIds.has(request.subId)||callerIds.size>=4096||sequence>=Number.MAX_SAFE_INTEGER)throw new Error('Native subscription unavailable');
      const counter=++sequence;
      callerIds.add(request.subId);
      const timer=window.setTimeout(()=>stopStream(counter,true),ordinaryTimeoutMs);
      streams.set(counter,{subId:request.subId,filters:request.filters,timer,delivery:0,eose:false,controlRevision:-1,deliver});
      try {native.postMessage(JSON.stringify({type:'relay-stream',sessionId:generation,sequence:counter,message:JSON.stringify(request)}));}
      catch{stopStream(counter,true);}
    },
    close(message:NappletMessage):void {
      const request=parseRelayClose(message);
      for(const [counter,stream] of streams)if(stream.subId===request.subId){stopStream(counter,false,request.id);return;}
    },
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
        const timeout = options.requestTimeoutsMs?.[message.type] ?? ordinaryTimeoutMs;
        const timer = window.setTimeout(() => { pending.delete(counter); reject(); }, timeout);
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
      for(const stream of streams.values())window.clearTimeout(stream.timer);
      streams.clear();callerIds.clear();
    },
  });
}
