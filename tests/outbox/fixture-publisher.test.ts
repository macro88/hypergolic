import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {finalizeEvent,getPublicKey} from 'nostr-tools/pure';
import {FixturePublisher,type FixtureReleasePort,type FixturePublisherEffects} from '../../src/fixture-release/publisher.ts';
import type {EventSnapshot} from '../../src/security/event-snapshot.ts';
import type {UploadSnapshot} from '../../src/uploads/upload-snapshot.ts';
import type {VerifiedSignedEvent} from '../../src/security/signed-event.ts';
import {BUNDLED_FIXTURES} from '../../src/runtime/bundled-catalog.ts';

// Public deterministic test scalar; unit-only effects never send to a real server or relay.
const secret=new Uint8Array(32);secret[31]=1;
const user=getPublicKey(secret),token='12345678-1234-4234-9234-123456789abc';
const html=readFileSync('runtime/fixtures/feed-lab.html','utf8');
const tags=JSON.parse(readFileSync('runtime/fixtures/feed-lab-manifest.json','utf8')).tags as string[][];
const server='https://files.example.com',relays=['wss://relay.example.com'];
function sign(snapshot: EventSnapshot|UploadSnapshot): VerifiedSignedEvent {
  const input='authorization' in snapshot?snapshot.authorization:snapshot.event;
  const signed=finalizeEvent({...input,tags:input.tags.map(tag=>[...tag])},secret);
  return {id:signed.id,pubkey:signed.pubkey,created_at:signed.created_at,kind:signed.kind,content:signed.content,tags:signed.tags,sig:signed.sig};
}
function setup() {
  const state={epoch:0,identity:user,upload:false,manifest:false,signUploads:0,puts:0,signManifests:0,publishes:0,queries:0,
    unavailableRelay:"",damagedBytes:false,damagedStoredBytes:false,changedClaim:false,relayAccepted:true,wrongStoredEvent:false,
    waitForSign:null as Promise<void>|null, signed:null as VerifiedSignedEvent|null};
  let capture='';
  const native: FixtureReleasePort={synchronizeFixturePublisher(){},
    prepareFixtureUpload(fixture,destination){return JSON.stringify({token,fixture,identity:state.identity,server:destination,
      sha256:BUNDLED_FIXTURES['feed-lab'].sha256,size:new TextEncoder().encode(html).length,html:state.damagedBytes?html+'changed':html,tags});},
    approveFixtureUpload(){if(state.upload)return false;state.upload=true;return true;},
    isFixtureUploadApproved(){return state.upload;},
    async putFixtureUpload(){state.puts++;state.upload=false;return JSON.stringify({ok:true,retrievedSha256:state.damagedStoredBytes?'00'.repeat(32):BUNDLED_FIXTURES['feed-lab'].sha256,retrievedSize:new TextEncoder().encode(html).length});},
    prepareFixtureManifest(_token,destinations){capture=JSON.stringify({identity:state.identity,relays:destinations,event:{kind:35129,created_at:1000,content:'',tags:[...tags,['server',server]]}});return capture;},
    approveFixtureManifest(){state.manifest=true;return state.changedClaim?capture.replace('"kind":35129','"kind":35128'):capture;},
    isFixtureManifestApproved(){return state.manifest;},
    cancelFixtureRelease(){state.upload=false;state.manifest=false;},
  };
  const effects: FixturePublisherEffects={
    owner(){const epoch=state.epoch,identity=state.identity;return {epoch,user:identity,assertActive(){if(state.epoch!==epoch || state.identity!==identity)throw new Error('stale');}};},
    async hash(bytes){return createHash('sha256').update(bytes).digest('hex');},now(){return 1000;},
    async signUpload(snapshot,authority){authority.assertActive();state.signUploads++;await state.waitForSign;return sign(snapshot);},
    async signManifest(snapshot,authority){authority.assertActive();state.signManifests++;return sign(snapshot);},
    async publish(event,destinations,authority){authority.assertActive();state.publishes++;state.signed=event;return destinations.map(relay=>({relay,eventId:event.id,status:state.relayAccepted?'accepted':'rejected',reason:''}));},
    source:{async query(_coordinate,destinations){state.queries++;if(destinations.includes(state.unavailableRelay))throw new Error("unavailable");return state.signed?[state.wrongStoredEvent?{...state.signed,content:'changed'}:state.signed]:[];},async readHtml(){throw new Error('unused');}},
  };
  return {service:new FixturePublisher(native,effects),state,native};
}
async function uploadReady() {const fixture=setup();await fixture.service.prepare('feed-lab',server,relays);assert.equal(fixture.service.getSnapshot().phase,'upload-review');return fixture;}
async function manifestReady() {const fixture=await uploadReady();await fixture.service.approveUpload(fixture.service.getSnapshot().review!);assert.equal(fixture.service.getSnapshot().phase,'manifest-review');return fixture;}

test('sealed fixture requires separate upload and exact manifest approvals, then ACK and stored signature proof',async()=>{
  const {service,state}=await uploadReady();assert.equal(state.signUploads,0);assert.equal(state.puts,0);
  await service.approveUpload({...service.getSnapshot().review!});assert.equal(state.signUploads,0);
  await service.approveUpload(service.getSnapshot().review!);assert.equal(service.getSnapshot().phase,'manifest-review');
  assert.equal(state.signUploads,1);assert.equal(state.puts,1);assert.equal(state.signManifests,0);
  await service.approveManifest(service.getSnapshot().review!);assert.equal(service.getSnapshot().phase,'complete');
  assert.equal(state.signManifests,1);assert.equal(state.publishes,1);assert.equal(state.queries,1);
  const result=JSON.parse(service.getSnapshot().result);assert.equal(result.eventId,state.signed!.id);assert.deepEqual(result.independentlyStored,relays);
  await service.approveManifest(service.getSnapshot().review!);assert.equal(state.signManifests,1);
});
test('changed native bytes fail before signing or network',async()=>{
  const {service,state}=setup();state.damagedBytes=true;await service.prepare('feed-lab',server,relays);
  assert.equal(service.getSnapshot().phase,'failed');assert.equal(state.signUploads,0);assert.equal(state.puts,0);
});
test('unsupported catalog item and private upload server fail without effects',async()=>{
  const {service,state}=setup();await service.prepare('nap-support',server,relays);assert.equal(service.getSnapshot().phase,'failed');
  await service.prepare('feed-lab','http://127.0.0.1',relays);assert.equal(service.getSnapshot().phase,'failed');assert.equal(state.signUploads,0);
});
test('bad retrieved hash blocks manifest preparation and signing',async()=>{
  const {service,state}=await uploadReady();state.damagedStoredBytes=true;await service.approveUpload(service.getSnapshot().review!);
  assert.equal(service.getSnapshot().phase,'failed');assert.equal(state.signManifests,0);assert.equal(state.publishes,0);
});
test('native claimed manifest cannot change the reviewed template',async()=>{
  const {service,state}=await manifestReady();state.changedClaim=true;await service.approveManifest(service.getSnapshot().review!);
  assert.equal(service.getSnapshot().phase,'failed');assert.equal(state.signManifests,0);assert.equal(state.publishes,0);
});
test('identity epoch change denies old review before protected signing',async()=>{
  const {service,state}=await uploadReady();state.epoch++;await service.approveUpload(service.getSnapshot().review!);
  assert.equal(service.getSnapshot().phase,'failed');assert.equal(state.signUploads,0);assert.equal(state.puts,0);
});
test('native revocation during signing prevents credential dispatch without relying on UI cancellation',async()=>{
  const {service,state,native}=await uploadReady();let finish!:()=>void;state.waitForSign=new Promise<void>(resolve=>{finish=resolve;});
  const operation=service.approveUpload(service.getSnapshot().review!);
  for(let n=0;n<8;n++)await Promise.resolve();assert.equal(state.signUploads,1);native.cancelFixtureRelease();finish();await operation;
  assert.equal(service.getSnapshot().phase,'failed');assert.equal(state.puts,0);assert.equal(state.signManifests,0);
});
test('cancelled asynchronous preparation cannot revive the review',async()=>{
  const {service}=setup();const operation=service.prepare('feed-lab',server,relays);service.cancel();await operation;
  assert.equal(service.getSnapshot().phase,'idle');assert.equal(service.getSnapshot().review,null);
});
test('rejected relay receipt prevents a false published success',async()=>{
  const {service,state}=await manifestReady();state.relayAccepted=false;await service.approveManifest(service.getSnapshot().review!);
  assert.equal(service.getSnapshot().phase,'failed');assert.equal(state.queries,0);
});
test('stored event must match every signed field, not just its claimed ID',async()=>{
  const {service,state}=await manifestReady();state.wrongStoredEvent=true;await service.approveManifest(service.getSnapshot().review!);
  assert.equal(service.getSnapshot().phase,'failed');assert.equal(state.publishes,1);
});

test('one unavailable relay does not erase verified storage on another approved relay',async()=>{
  const {service,state}=setup();const targets=['wss://first.example.com','wss://second.example.com'];
  await service.prepare('feed-lab',server,targets);await service.approveUpload(service.getSnapshot().review!);
  state.unavailableRelay=targets[0];await service.approveManifest(service.getSnapshot().review!);
  assert.equal(service.getSnapshot().phase,'complete');assert.equal(state.queries,2);
  assert.deepEqual(JSON.parse(service.getSnapshot().result).independentlyStored,[targets[1]]);
});
