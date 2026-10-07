import {requireNativeModule} from 'expo';
import {CryptoDigestAlgorithm, digest} from 'expo-crypto';
import {finalizeEvent} from 'nostr-tools/pure';
import {publishEvent} from '../network/relay-service';
import {loadNativePublishedArtifactSource} from '../napplets/native-published-source-port';
import type {IdentityVault} from '../security/identity-vault';
import type {IdentityTransition} from '../security/identity-transition';
import {FixturePublisher, type FixtureReleasePort} from './publisher';

function signedPublicEvent(event: Parameters<typeof finalizeEvent>[0], secret: Uint8Array) {
  const signed=finalizeEvent(event,secret);
  return {id:signed.id,pubkey:signed.pubkey,created_at:signed.created_at,kind:signed.kind,content:signed.content,tags:signed.tags,sig:signed.sig};
}
/** Composition stays in the claimed trusted identity owner. No signing hook enters a napplet. */
export function createNativeFixturePublisher(vault: IdentityVault, transition: IdentityTransition): FixturePublisher {
  const native=requireNativeModule<FixtureReleasePort>('HypergolicNappletHost');
  const service=new FixturePublisher(native,{
    owner:()=>transition.sessionAuthority(),
    hash:async bytes=>Array.from(new Uint8Array(await digest(CryptoDigestAlgorithm.SHA256,bytes)),value=>value.toString(16).padStart(2,'0')).join(''),
    now:()=>Math.floor(Date.now()/1000),
    signUpload:(snapshot,authority)=>vault.signApprovedUpload(snapshot,authority,signedPublicEvent),
    signManifest:(snapshot,authority)=>vault.signApproved(snapshot,authority,signedPublicEvent),
    publish:publishEvent,source:loadNativePublishedArtifactSource(),
  });
  const synchronize=()=>{
    const state=transition.getSnapshot();
    if(state.phase!=='ready')service.cancel();
    native.synchronizeFixturePublisher(state.session.vault.selectedPubkey,state.session.epoch,state.phase==='ready');
  };
  synchronize();transition.subscribe(synchronize);return service;
}
