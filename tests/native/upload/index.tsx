/** Isolated QA entry: disposable signing key and compile-gated loopback TLS only. */
import {registerRootComponent, requireNativeModule, requireNativeView} from 'expo';
import {digest, CryptoDigestAlgorithm} from 'expo-crypto';
import {useCallback, useEffect, useState, useSyncExternalStore} from 'react';
import {AppState, Pressable, StyleSheet, Text, View, type NativeSyntheticEvent} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {finalizeEvent, getPublicKey} from 'nostr-tools/pure';
import {initializeNativeRandom} from '../../../src/security/crypto-bootstrap';
import {BUNDLED_FIXTURES} from '../../../src/runtime/bundled-catalog';
import {createNativeUploadPort, type UploadModule} from '../../../src/uploads/upload-port';
import {UploadService} from '../../../src/uploads/upload-service';
import type {ApprovalOrigin} from '../../../src/security/approval-service';
import type {NativeCapabilityEvent} from '../../../src/runtime/runtime-owner';
import {UploadWorkspace} from '../../../src/shell/UploadWorkspace';
initializeNativeRandom();
const secret = new Uint8Array(32); secret[31] = 1;
const configuration = {sessionId: 'upload-fixture', epoch: 1, user: getPublicKey(secret), publisher: 'f'.repeat(64),
  appId: 'upload-lab', version: BUNDLED_FIXTURES['upload-lab'].aggregateHash, instanceId: 'upload-fixture', fixture: 'upload-lab', domains: ['upload', 'theme']};
type Event = NativeCapabilityEvent | {type: 'ready' | 'error'; sessionId: string};
const Host = requireNativeView<{configuration: string; active: boolean; style: unknown; onHostEvent(event: NativeSyntheticEvent<Event>): void}>('HypergolicNappletHost');
interface Module extends UploadModule {configureUploadServer(server: string | null): void; configureUploadProof(anchor: string): void}
function Fixture() {
  const [visible, setVisible] = useState(true), [focused, setFocused] = useState(true), [revision, setRevision] = useState(0);
  const [status, setStatus] = useState('Opening upload fixture…');
  const [owner] = useState(() => {
    const native = requireNativeModule<Module>('HypergolicNappletHost');
    let generation: string | null = null, live = true;
    const assertActive = (origin: ApprovalOrigin) => {
      if (!live || origin.generation !== generation || Object.keys(configuration).filter(key => !['fixture', 'domains'].includes(key))
        .some(key => origin[key as keyof ApprovalOrigin] !== configuration[key as keyof typeof configuration])) throw Error('Fixture revoked');
    };
    const service = new UploadService(createNativeUploadPort(native), {assertActive}, {
      nowSeconds: () => Math.floor(Date.now() / 1000),
      sha256: async bytes => Array.from(new Uint8Array(await digest(CryptoDigestAlgorithm.SHA256, bytes)), byte => byte.toString(16).padStart(2, '0')).join(''),
      sign: async (snapshot, authority) => {
        authority.assertActive(); const signed = finalizeEvent({...snapshot.authorization, tags: snapshot.authorization.tags.map(tag => [...tag])}, secret); authority.assertActive();
        return {id: signed.id, pubkey: signed.pubkey, created_at: signed.created_at, kind: signed.kind, content: signed.content, tags: signed.tags, sig: signed.sig};
      },
    });
    return {native, service, receive(event: Event) {
      if (event.type !== 'capability') return;
      if (generation === null) generation = event.generation;
      if (event.generation === generation && event.lane === 'upload') service.enqueue(event.token, {...configuration, generation});
    }, close() {live = false; service.close(configuration.sessionId);}, reopen() {live = true; generation = null;}};
  });
  const snapshot = useSyncExternalStore(useCallback(listener => owner.service.subscribe(listener), [owner]), owner.service.getSnapshot);
  const [prepared, setPrepared] = useState(false);
  useEffect(() => {
    try {
      const anchor = process.env.EXPO_PUBLIC_UPLOAD_PROOF_ANCHOR;
      if (!anchor) throw Error('Missing disposable anchor');
      owner.native.configureUploadProof(anchor); owner.native.configureUploadServer('https://files.example.com:19943');
      owner.service.foreground(); setPrepared(true); setStatus('Upload fixture ready');
    } catch {setStatus('Upload network proof build is unavailable');}
    return () => owner.close();
  }, [owner]);
  useEffect(() => {
    owner.service.focus(visible && focused ? configuration.sessionId : null);
  }, [owner, visible, focused]);
  useEffect(() => {
    const listener = AppState.addEventListener('change', state => {if (state === 'active') owner.service.foreground(); else owner.service.background();});
    const timer = setInterval(() => owner.service.refresh(), 250);
    return () => {listener.remove(); clearInterval(timer);};
  }, [owner]);
  return <View style={styles.root}>
    <Text style={styles.notice}>Upload fixture · disposable identity · loopback TLS</Text>
    <Text testID="upload-native-status" style={styles.notice}>{status}</Text>
    <Pressable accessibilityRole="button" style={styles.button} onPress={() => {
      if (visible) {owner.close(); setVisible(false); setStatus('Upload Lab closed');}
      else {owner.reopen(); setRevision(value => value + 1); setFocused(true); setVisible(true);}
    }}><Text style={styles.label}>{visible ? 'Close Upload Lab' : 'Open Upload Lab'}</Text></Pressable>
    <Pressable accessibilityRole="button" style={styles.button} onPress={() => setFocused(value => !value)}><Text style={styles.label}>{focused ? 'Hide Upload Lab' : 'Show Upload Lab'}</Text></Pressable>
    {visible && prepared && <Host key={revision} configuration={JSON.stringify(configuration)} active={focused} style={styles.host} onHostEvent={event => {
      const value = event.nativeEvent;
      if (value.type === 'ready') setStatus('Native host connected'); else if (value.type === 'error') {owner.close(); setStatus('Native host failed');}
      else owner.receive(value);
    }} />}
    <UploadWorkspace service={owner.service} snapshot={snapshot} workspace={undefined} blocked={false} />
  </View>;
}
const styles = StyleSheet.create({root: {flex: 1, backgroundColor: '#140f0b'}, host: {flex: 1}, notice: {color: '#f3efeb', fontSize: 12, padding: 8, textAlign: 'center'},
  button: {minHeight: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: '#34251d'}, label: {color: '#e8805d', fontSize: 16}});
function Root() {return <SafeAreaProvider><SafeAreaView style={styles.root}><Fixture /></SafeAreaView></SafeAreaProvider>;}
registerRootComponent(Root);
