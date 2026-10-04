import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {ConfigBroker} from '../../src/presentation/config-broker.ts';
import {openConfigStore, type ConfigSecureStore} from '../../src/presentation/config-store.ts';
import type {NativeRegistration} from '../../src/runtime/capability-protocol.ts';
import type {RoutingNativeState} from '../../src/routing/routing-port.ts';
import {tick} from './harness.ts';
const schema={type:'object',properties:{theme:{type:'string',enum:['dark','light'],default:'dark'},token:{type:'string','x-napplet-secret':true},nested:{type:'object',properties:{level:{type:'integer',minimum:1,maximum:3,default:2}}}},required:['theme']};
async function setup(t:{after(fn:()=>void):void}) {
 const source:NativeRegistration={user:'01'.repeat(32),publisher:'02'.repeat(32),appId:'configuration-source',version:'03'.repeat(32),epoch:0,sessionId:'source-view',generation:'source-generation',instanceId:'source-view',fixture:'published',domains:['config']};
 let state:RoutingNativeState={user:source.user,epoch:0,revision:1,available:true,ownerAvailable:true,foreground:true},focus=source.generation,counter=0,listener=()=>{};
 const revoked=new Set<string>(),slots=new Map<string,string>(),live=new Set<string>(),replies=new Map<string,any>(),sent:{generation:string;message:any}[]=[],records=new Map<string,string>();
 let gate:Promise<void>|null=null,unlock=()=>{};
 const backend:ConfigSecureStore={isAvailableAsync:async()=>true,getItemAsync:async key=>records.get(key)??null,setItemAsync:async(key,value)=>{if(gate)await gate;records.set(key,value);}};
 const store=await openConfigStore(backend,async text=>createHash('sha256').update(text).digest('hex'),9);
 const native={state:()=>state,mayDeliver:(generation:string,revision:number,domain:string)=>state.available&&state.revision===revision&&domain==='config'&&!revoked.has(generation),mayReview:(generation:string,revision:number)=>state.available&&state.revision===revision&&focus===generation&&!revoked.has(generation),send(generation:string,revision:number,message:any){if(!this.mayDeliver(generation,revision,'config'))return false;sent.push({generation,message});return true;},subscribe(fn:()=>void){listener=fn;return()=>{};},newChannelId:()=>''};
 const capability={take(token:string){const value=slots.get(token)??null;slots.delete(token);return value;},isActive:(token:string)=>live.has(token),finish(token:string,result:string|null){live.delete(token);replies.set(token,result===null?null:JSON.parse(result).response);}};
 const broker=new ConfigBroker(capability,native,store);t.after(()=>broker.stop());
 function dispatch(message:unknown,registration=source,patch:Partial<NativeRegistration>={},wrapperId?:string){const token='token-'+ ++counter;live.add(token);slots.set(token,JSON.stringify({registration:{...registration,...patch},request:JSON.stringify({type:'routing.call',id:wrapperId??'call-'+counter,message,revision:state.revision})}));return{token,promise:broker.dispatch(token,{registration,assertActive(){if(revoked.has(registration.generation))throw Error('Revoked');}}),reply:()=>replies.get(token)};}
 async function register(value:unknown=schema,version=1,registration=source){const request=dispatch({type:'config.registerSchema',id:'register-'+ ++counter,schema:value,version},registration);await request.promise;assert.equal(request.reply().ok,true);}
 async function get(registration=source){const request=dispatch({type:'config.get',id:'get-'+ ++counter},registration);await request.promise;return request.reply()?.values;}
 return {broker,source,store,records,sent,dispatch,register,get,gate(){gate=new Promise(resolve=>{unlock=resolve;});},unlock(){gate=null;unlock();},focus(value:string){focus=value;broker.refresh();},lifecycle(patch:Partial<RoutingNativeState>){state={...state,...patch,revision:state.revision+1};listener();},revoke(generation:string){revoked.add(generation);},close(){revoked.add(source.generation);broker.close(source.generation);}};
}
test('schema ACK and immediate subscription wait for persisted/defaulted registration; source scope is captured',async t=>{
 const h=await setup(t);h.gate();const registered=h.dispatch({type:'config.registerSchema',id:'r',schema}),subscribed=h.dispatch({type:'config.subscribe'}),get=h.dispatch({type:'config.get',id:'g'});await tick();assert.equal(registered.reply(),undefined);assert.equal(h.sent.length,0);h.unlock();await Promise.all([registered.promise,subscribed.promise,get.promise]);assert.deepEqual(registered.reply(),{type:'config.registerSchema.result',id:'r',ok:true});assert.deepEqual(get.reply().values,{theme:'dark',nested:{level:2}});assert.deepEqual(h.sent.map(row=>row.message),[{type:'config.values',values:{theme:'dark',nested:{level:2}}}]);assert.equal(h.sent[0]!.generation,h.source.generation);
});
test('no-schema produces error without fake values; invalid schemas give canonical negative ACK and preserve previous schema',async t=>{
 const h=await setup(t),before=h.dispatch({type:'config.get',id:'before'});await before.promise;assert.equal(before.reply(),null);assert.equal(h.sent[0]!.message.code,'no-schema');await h.register();
 const bad=h.dispatch({type:'config.registerSchema',id:'bad',schema:{type:'object',properties:{token:{type:'string','x-napplet-secret':true,default:'forbidden'}}}});await bad.promise;assert.equal(bad.reply().ok,false);assert.equal(bad.reply().code,'secret-with-default');assert.deepEqual(await h.get(),{theme:'dark',nested:{level:2}});
});
test('only focused trusted commit writes; secrets remain absent from UI and deliver only after explicit save',async t=>{
 const h=await setup(t);await h.register();await h.dispatch({type:'config.subscribe'}).promise;await h.broker.open(h.source.generation);const review=h.broker.getSnapshot().review!;assert.deepEqual(review.ordinary,{theme:'dark',nested:{level:2}});assert.equal(review.secretPresent['["token"]'],false);
 await assert.rejects(h.broker.commit(review.id,{theme:'other',nested:{level:2}},{'["token"]':'public-test-token'}));assert.equal(h.broker.getSnapshot().review?.id,review.id);assert.equal((await h.get()).token,undefined);
 await h.broker.commit(review.id,{theme:'light',nested:{level:3}},{'["token"]':'public-test-token'});assert.deepEqual(await h.get(),{theme:'light',token:'public-test-token',nested:{level:3}});assert.equal(h.broker.getSnapshot().review,null);assert.equal(h.sent.at(-1)!.message.values.token,'public-test-token');
 await h.broker.open(h.source.generation);const reopened=h.broker.getSnapshot().review!;assert.equal(reopened.secretPresent['["token"]'],true);assert.equal(JSON.stringify(reopened.ordinary).includes('public-test-token'),false);await h.broker.commit(reopened.id,{theme:'light',nested:{level:3}},{'["token"]':null});assert.equal((await h.get()).token,undefined);
});
test('schema changes immediately purge orphaned secrets; fresh hashes and identities receive defaults',async t=>{
 const h=await setup(t);await h.register();await h.broker.open(h.source.generation);await h.broker.commit(h.broker.getSnapshot().review!.id,{theme:'light',nested:{level:2}},{'["token"]':'public-test-token'});
 const peer={...h.source,generation:'peer-generation',sessionId:'peer-view',instanceId:'peer-view',version:'04'.repeat(32)};await h.register(schema,1,peer);assert.deepEqual(await h.get(peer),{theme:'dark',nested:{level:2}});
 await h.register({type:'object',properties:{theme:{type:'string',default:'dark'}}},2);assert.equal([...h.records.values()].some(raw=>raw.includes('public-test-token')),false);assert.deepEqual(await h.get(),{theme:'light'});
});
test('foreground switch keeps original subscriptions; unsubscribe/close/background/identity fence delivery and editor writes',async t=>{
 const h=await setup(t);await h.register();await h.dispatch({type:'config.subscribe'}).promise;h.focus('peer');assert.deepEqual(await h.get(),{theme:'dark',nested:{level:2}});await assert.rejects(h.broker.open(h.source.generation));h.focus(h.source.generation);await h.broker.open(h.source.generation);const id=h.broker.getSnapshot().review!.id;h.lifecycle({available:false,foreground:false});assert.equal(h.broker.getSnapshot().review,null);await assert.rejects(h.broker.commit(id,{theme:'light'},{}));const count=h.sent.length;await h.dispatch({type:'config.get',id:'background'}).promise;assert.equal(h.sent.length,count);h.lifecycle({available:true,foreground:true});await h.dispatch({type:'config.unsubscribe'}).promise;await h.broker.open(h.source.generation);await h.broker.commit(h.broker.getSnapshot().review!.id,{theme:'light',nested:{level:2}},{});assert.equal(h.sent.length,count);h.close();const closed=h.dispatch({type:'config.get',id:'closed'});await closed.promise;assert.equal(closed.reply(),null);
});
test('forged scope, missing domain, guest set, private wrapper replay and unmasked secret injection cannot mutate',async t=>{
 const h=await setup(t);await h.register();for(const patch of [{publisher:'04'.repeat(32)},{domains:[]}]){const denied=h.dispatch({type:'config.get',id:'forged'},h.source,patch);await denied.promise;assert.equal(denied.reply(),null);}
 const guest=h.dispatch({type:'config.set',values:{theme:'forged'}});await guest.promise;assert.equal(guest.reply(),null);assert.equal((await h.get()).theme,'dark');const first=h.dispatch({type:'config.get',id:'first'},h.source,{},'same'),second=h.dispatch({type:'config.get',id:'second'},h.source,{},'same');await Promise.all([first.promise,second.promise]);assert.equal(second.reply(),null);
 await h.broker.open(h.source.generation);await assert.rejects(h.broker.commit(h.broker.getSnapshot().review!.id,{theme:'light',token:'unmasked'},{}));assert.equal((await h.get()).token,undefined);
});

test('revoked subscribed peer cannot turn a confirmed own save into failure or receive secret values',async t=>{
 const h=await setup(t),peer={...h.source,generation:'same-scope-peer',sessionId:'same-scope-view',instanceId:'same-scope-view'};
 await h.register();await h.register(schema,1,peer);await h.dispatch({type:'config.subscribe'},peer).promise;h.revoke(peer.generation);
 await h.broker.open(h.source.generation);await h.broker.commit(h.broker.getSnapshot().review!.id,{theme:'light',nested:{level:2}},{'["token"]':'public-test-token'});
 assert.equal(h.broker.getSnapshot().review,null);assert.equal((await h.get()).token,'public-test-token');assert.equal(h.sent.filter(row=>row.generation===peer.generation).length,1);
});
test('duplicate Save is rejected while the native write is pending; only the first scoped write completes',async t=>{
 const h=await setup(t);await h.register();await h.broker.open(h.source.generation);const id=h.broker.getSnapshot().review!.id;h.gate();
 const first=h.broker.commit(id,{theme:'light',nested:{level:2}},{});await tick();await assert.rejects(h.broker.commit(id,{theme:'dark',nested:{level:3}},{}),(error:any)=>error.code==='BUSY');
 h.unlock();await first;assert.deepEqual(await h.get(),{theme:'light',nested:{level:2}});
});
