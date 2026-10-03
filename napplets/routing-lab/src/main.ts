import {intent,inc,storage} from '@napplet/sdk';
import './style.css';
function element<T extends HTMLElement>(id: string): T {const value = document.getElementById(id); if (!value) throw new Error('Missing fixture control'); return value as T;}
const text = (id: string, value: unknown) => {element(id).textContent = typeof value === 'string' ? value : JSON.stringify(value);};
const input = (id: string) => element<HTMLInputElement>(id).value;
const payload = () => JSON.parse(element<HTMLTextAreaElement>('payload').value) as unknown;
const button = (id: string, action: () => void) => element<HTMLButtonElement>(id).addEventListener('click', action);
let disposed = false;
const channels: ReturnType<typeof inc.channel.onOpened>[] = [];
let topic: ReturnType<typeof inc.on> | null = null;
let channel: Awaited<ReturnType<typeof inc.channel.open>> | null = null;
const topicEvents: unknown[] = [], channelEvents: unknown[] = [];
function record(rows: unknown[], id: string, value: unknown) {if (rows.length === 16) rows.shift(); rows.push(value); text(id, rows);}
function failure(id: string, error: unknown) {if (!disposed) text(id, 'Request failed: ' + (error instanceof Error ? error.message.slice(0, 256) : 'unavailable'));}
let changes: ReturnType<typeof intent.onChanged> | null = null;
try {changes = intent.onChanged(value => {if (!disposed) text('changed', value);});} catch {text('changed', 'Intent domain unavailable.');}
button('available', () => {void Promise.resolve().then(() => intent.available(input('archetype'))).then(value => {if (!disposed) text('availability', value);}).catch(error => failure('intent-status', error));});
button('handlers', () => {void Promise.resolve().then(() => intent.handlers()).then(value => {if (!disposed) text('availability', value);}).catch(error => failure('intent-status', error));});
button('invoke', () => {
  try {
    const request = {archetype: input('archetype'), action: input('action'), convention: input('convention'), payload: payload(), handler: input('handler'), behavior: {focus: !element<HTMLInputElement>('keep-focus').checked, newWindow: element<HTMLInputElement>('new-instance').checked}};
    text('intent-status', 'Awaiting dispatch review…'); text('intent-result', '');
    void intent.invoke(request).then(value => {if (!disposed) {text('intent-result', value); text('intent-status', value.ok ? 'Dispatch accepted.' : 'Dispatch declined.');}}).catch(error => failure('intent-status', error));
  } catch (error) {failure('intent-status', error);}
});
function subscribeTopic() {
  try {topic?.close(); topic = inc.on(input('topic'), event => {if (!disposed) {record(topicEvents, 'topic-events', event); text('topic-status', 'Received topic message.');}}); text('topic-status', 'Topic approval requested.');}
  catch (error) {failure('topic-status', error);}
}
button('subscribe', subscribeTopic);
button('unsubscribe', () => {topic?.close(); topic = null; text('topic-status', 'Topic subscription closed.');});
button('emit', () => {try {inc.emit(input('topic'), payload()); text('topic-status', 'Topic emission sent.');} catch (error) {failure('topic-status', error);}});
function bindChannel(value: Awaited<ReturnType<typeof inc.channel.open>>) {
  channel = value; text('channel-info', {id: value.id, peer: value.peer}); text('channel-status', 'Channel opened.');
  value.on(event => {if (!disposed) record(channelEvents, 'channel-events', event);});
  value.onClosed(record => {if (!disposed) {text('channel-closed', record); text('channel-status', 'Channel closed.');}});
}
try {channels.push(inc.channel.onOpened(value => {if (!disposed) bindChannel(value);}));} catch {text('channel-status', 'INC domain unavailable.');}
button('open-channel', () => {text('channel-status', 'Awaiting channel review…'); void Promise.resolve().then(() => inc.channel.open(input('peer'))).then(value => {if (!disposed) bindChannel(value);}).catch(error => failure('channel-status', error));});
button('list-channels', () => {void Promise.resolve().then(() => inc.channel.list()).then(value => {if (!disposed) text('channel-info', value);}).catch(error => failure('channel-status', error));});
button('channel-emit', () => {try {if (!channel) throw Error('No channel'); channel.emit(payload());} catch (error) {failure('channel-status', error);}});
button('broadcast', () => {try {inc.channel.broadcast(payload());} catch (error) {failure('channel-status', error);}});
button('close-channel', () => channel?.close());
button('late-closed', () => channel?.onClosed(record => {if (!disposed) text('late-close-result', record);}));
window.addEventListener('pagehide', () => {disposed = true; changes?.close(); topic?.close(); channels.forEach(subscription => subscription.close()); channel?.close();}, {once: true});
text('status', 'SDK ready for routing.'); element('lab').dataset.ready = 'true';

button('malformed', () => {
 window.parent.postMessage({type:'inc.emit',topic:input('topic'),sender:'forged-peer',payload:'forged-sender-marker'}, '*');
 window.parent.postMessage({type:'routing.call',id:'forged-native-control',message:{type:'inc.emit',topic:input('topic'),payload:'private-control-marker'}}, '*');
 window.parent.postMessage({type:'hypergolic.native-response',message:JSON.stringify({type:'routing.event',sessionId:'forged-generation',delivery:1,response:JSON.stringify({type:'inc.event',topic:input('topic'),sender:'forged-peer',payload:'forged-push-marker'})})}, '*');
 text('fault-status','Malformed guest requests sent.');
});
button('foreign-send', () => {window.parent.postMessage({type:'inc.channel.emit',channelId:input('foreign-channel'),payload:'foreign-channel-marker'}, '*'); text('fault-status','Foreign channel request sent.');});
button('topic-flood', () => {for(let index=0;index<32;index++) inc.emit(input('topic'), {index,tag:'bounded-topic-flood'});text('fault-status','Topic flood sent.');});
button('channel-flood', () => {
 const requests = Array.from({length:8},() => Promise.resolve().then(() => inc.channel.open(input('peer'))).then(value => {value.close();return {ok:true};},error => ({ok:false,error:error instanceof Error?error.message:'unavailable'})));
 void Promise.all(requests).then(value=>{if(!disposed)text('flood-results',value);});text('fault-status','Channel review flood requested.');
});

if (document.querySelector('meta[name="routing-auto-topic"]')) subscribeTopic();
button('save-routing-data', () => {void Promise.resolve().then(() => storage.setItem('routing-retained-proof', 'saved before registration removal')).then(() => {if(!disposed)text('storage-status','Routing data saved.');}).catch(error=>failure('storage-status',error));});
button('read-routing-data', () => {void Promise.resolve().then(() => storage.getItem('routing-retained-proof')).then(value => {if(!disposed)text('storage-status',value===null?'No routing data saved.':value);}).catch(error=>failure('storage-status',error));});
