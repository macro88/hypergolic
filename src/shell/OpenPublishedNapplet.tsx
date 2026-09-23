import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { SettingsActions } from './Shell';
import type { NappletConsentReview } from '../napplets/first-open-consent';
import { colors } from './theme';

/** A trusted settings surface for one explicit naddr open, never rendered inside guest content. */
export function OpenPublishedNapplet({ open }: { open: SettingsActions['openPublished'] }) {
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [review, setReview] = useState<NappletConsentReview | null>(null);
  const pending = useRef<AbortController | null>(null);
  const decision = useRef<((accepted: boolean) => void) | null>(null);
  useEffect(() => () => { pending.current?.abort(); decision.current?.(false); decision.current = null; }, []);
  const decide = (accepted: boolean) => {
    decision.current?.(accepted);
    decision.current = null;
    setReview(null);
  };
  const start = () => {
    if (busy || !link.trim()) return;
    Keyboard.dismiss();
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setError(false);
    void open(link.trim(), controller.signal, request => new Promise<boolean>(resolve => {
      if (controller.signal.aborted) { resolve(false); return; }
      decision.current = resolve;
      setReview(request);
    })).catch(() => {
      if (!controller.signal.aborted) setError(true);
    }).finally(() => {
      if (pending.current === controller) pending.current = null;
      if (!controller.signal.aborted) setBusy(false);
    });
  };
  if (review) return <View style={styles.review} testID="settings-napplet-review">
    <Text accessibilityRole="header" style={styles.title}>Allow this napplet?</Text>
    <Text style={styles.detail}>Publisher</Text><Text selectable style={styles.claim}>{review.publisher}</Text>
    <Text style={styles.detail}>Napplet</Text><Text selectable style={styles.claim}>{review.appId}</Text>
    <Text style={styles.detail}>Signed event</Text><Text selectable style={styles.claim}>{review.eventId}</Text>
    <Text style={styles.detail}>Requested access: {review.domains.length ? review.domains.join(', ') : 'none'}</Text>
    <Pressable accessibilityRole="button" testID="settings-napplet-approve" onPress={() => decide(true)} style={styles.action}><Text style={styles.actionText}>Allow and open</Text></Pressable>
    <Pressable accessibilityRole="button" testID="settings-napplet-reject" onPress={() => decide(false)} style={styles.secondary}><Text style={styles.secondaryText}>Cancel</Text></Pressable>
  </View>;
  return <View style={styles.group}>
    <Text accessibilityRole="header" style={styles.title}>Open a napplet</Text>
    <Text style={styles.detail}>Paste a napplet naddr. Hypergolic will verify its signed version and show the publisher and requested access before the first open.</Text>
    <TextInput testID="settings-napplet-address" accessibilityLabel="Napplet naddr" value={link} onChangeText={value => { setLink(value); setError(false); }}
      autoCapitalize="none" autoCorrect={false} maxLength={8192} editable={!busy} placeholder="naddr1…" placeholderTextColor={colors.muted}
      style={styles.input} returnKeyType="done" onSubmitEditing={start} />
    {error && <Text testID="settings-napplet-error" accessibilityLiveRegion="polite" style={styles.detail}>The napplet could not be verified or opened. Check its address and relay availability, then try again.</Text>}
    <Pressable accessibilityRole="button" testID="settings-open-napplet" disabled={busy || !link.trim()} accessibilityState={{ disabled: busy || !link.trim() }} onPress={start} style={styles.action}>
      {busy ? <ActivityIndicator color={colors.background} /> : <Text style={styles.actionText}>Verify and open</Text>}
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  group: { gap: 12 }, title: { color: colors.text, fontSize: 20, fontWeight: '600' },
  detail: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  input: { color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 14, minHeight: 56, padding: 16, fontSize: 16 },
  action: { padding: 18, minHeight: 56, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  actionText: { color: colors.background, fontSize: 16, fontWeight: '600' },
  review: { gap: 12, padding: 18, borderColor: colors.accent, borderWidth: 1, borderRadius: 16, backgroundColor: colors.surface },
  claim: { color: colors.text, fontFamily: 'monospace', fontSize: 12 },
  secondary: { padding: 18, minHeight: 56, borderRadius: 16, borderColor: colors.border, borderWidth: 1, alignItems: 'center' },
  secondaryText: { color: colors.text, fontSize: 16 },
});
