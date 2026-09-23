import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { requireNativeView } from 'expo';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View, type NativeSyntheticEvent, type ViewProps } from 'react-native';
import type { NappletDescriptor } from '../shell/workspace';
import type { NativeCapabilityEvent, PublishedRuntimeBinding } from './runtime-owner';
import { RuntimeContext } from './RuntimeContext';
import type { NappletConsentReview } from '../napplets/first-open-consent';
import { colors } from '../shell/theme';

export type HostEvent = { type: 'ready'; sessionId: string } | { type: 'error'; sessionId: string; code: string };
interface Props extends ViewProps {
  session: NappletDescriptor;
  active?: boolean;
  onHostEvent: (event: NativeSyntheticEvent<HostEvent>) => void;
}
type NativeEvent = HostEvent | NativeCapabilityEvent;
interface NativeProps extends ViewProps {
  sessionId?: string;
  configuration?: string;
  publishedArtifact?: string;
  active?: boolean;
  onHostEvent: (event: NativeSyntheticEvent<NativeEvent>) => void;
}
const NativeHost = (Platform.OS === 'android' || Platform.OS === 'ios') ? requireNativeView<NativeProps>('HypergolicNappletHost') : null;

/** A component lifetime owns one immutable native generation, despite workspace snapshot updates. */
export function NappletHost(props: Props) {
  return props.session.source === 'published' ? <PublishedNappletHost {...props} /> : <BundledNappletHost {...props} />;
}

function BundledNappletHost({ session, onHostEvent, ...props }: Props) {
  const runtime = useContext(RuntimeContext);
  const [binding] = useState(() => runtime?.open(session) ?? null);
  const receive = useCallback((event: NativeSyntheticEvent<NativeEvent>) => {
    const message = event.nativeEvent;
    if (message.sessionId !== session.id) return;
    if (message.type === 'capability') { binding?.receive(message); return; }
    if (message.type === 'error') binding?.revoke();
    onHostEvent(event as NativeSyntheticEvent<HostEvent>);
  }, [binding, onHostEvent, session.id]);
  if (NativeHost === null) return <Text>Napplet execution is available in the Android and iOS builds.</Text>;
  return <NativeHost {...props} {...(binding ? { configuration: binding.configuration } : { sessionId: session.id })} onHostEvent={receive} />;
}

function PublishedNappletHost({ session, onHostEvent, ...props }: Props) {
  const runtime = useContext(RuntimeContext);
  const [pinned] = useState(() => session);
  const [attempt, setAttempt] = useState(0);
  const [binding, setBinding] = useState<PublishedRuntimeBinding | null>(null);
  const [review, setReview] = useState<NappletConsentReview | null>(null);
  const [error, setError] = useState(false);
  const decision = useRef<((accepted: boolean) => void) | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    let opened: PublishedRuntimeBinding | null = null;
    if (runtime) void runtime.openPublished(pinned, controller.signal, request => new Promise<boolean>(resolve => {
      if (!mounted || controller.signal.aborted) { resolve(false); return; }
      decision.current = resolve;
      setReview(request);
    })).then(value => {
      if (!mounted || controller.signal.aborted) { value.revoke(); return; }
      opened = value;
      setBinding(value);
    }).catch(() => { if (mounted) setError(true); });
    return () => {
      mounted = false;
      controller.abort();
      decision.current?.(false);
      decision.current = null;
      opened?.revoke();
    };
  }, [attempt, runtime, pinned]);
  const decide = useCallback((accepted: boolean) => {
    decision.current?.(accepted);
    decision.current = null;
    setReview(null);
  }, []);
  const receive = useCallback((event: NativeSyntheticEvent<NativeEvent>) => {
    const message = event.nativeEvent;
    if (message.sessionId !== session.id || !binding) return;
    if (message.type === 'capability') { binding.receive(message); return; }
    if (message.type === 'error') { binding.revoke(); setError(true); }
    onHostEvent(event as NativeSyntheticEvent<HostEvent>);
  }, [binding, onHostEvent, session.id]);
  if (NativeHost === null) return <Text>Napplet execution is available in the Android and iOS builds.</Text>;
  return <View style={[props.style, styles.container]}>
    {binding && !error ? <NativeHost {...props} style={styles.fill} active={props.active} publishedArtifact={binding.publishedArtifact} onHostEvent={receive} /> :
      <View style={styles.center}>{error || !runtime ? <><Text style={styles.detail}>This napplet could not be opened.</Text>
        <Pressable accessibilityRole="button" testID={`published-retry-${session.id}`} onPress={() => { setBinding(null); setError(false); setAttempt(value => value + 1); }} style={styles.action}><Text style={styles.actionText}>Try again</Text></Pressable></> :
        <><ActivityIndicator color={colors.accent} /><Text style={styles.detail}>Opening napplet…</Text></>}</View>}
    {review && <View style={styles.review} testID={`published-review-${session.id}`}>
      <Text accessibilityRole="header" style={styles.heading}>Open this napplet?</Text>
      <Text style={styles.detail}>Publisher</Text><Text selectable style={styles.claim}>{review.publisher}</Text>
      <Text style={styles.detail}>Napplet</Text><Text selectable style={styles.claim}>{review.appId}</Text>
      <Text style={styles.detail}>Access: {review.domains.length ? review.domains.join(', ') : 'none'}</Text>
      <Pressable accessibilityRole="button" testID={`published-approve-${session.id}`} onPress={() => decide(true)} style={styles.action}><Text style={styles.actionText}>Allow and open</Text></Pressable>
      <Pressable accessibilityRole="button" testID={`published-reject-${session.id}`} onPress={() => decide(false)} style={styles.action}><Text style={styles.actionText}>Cancel</Text></Pressable>
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 }, fill: { flex: 1 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20 },
  detail: { color: colors.muted, fontSize: 15, textAlign: 'center' }, claim: { color: colors.text, fontSize: 13 },
  heading: { color: colors.text, fontSize: 22, fontWeight: '600' },
  review: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: colors.background, padding: 20, gap: 12, justifyContent: 'center' },
  action: { minHeight: 48, borderRadius: 12, backgroundColor: colors.accent, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  actionText: { color: colors.background, fontWeight: '600', fontSize: 15 },
});
