import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { ActivityIndicator, AppState, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { SettingsActions } from './Shell';
import type { IdentityChange, IdentityTransition } from '../security/identity-transition';
import { VaultError } from '../security/identity-vault';
import { useIdentityOwner } from './IdentityShell';
import { colors } from './theme';

function Action({ title, testID, onPress, subdued = false }: { title: string; testID: string; onPress: () => void; subdued?: boolean }) {
  return <Pressable accessibilityRole="button" testID={testID} onPress={onPress} style={[styles.action, subdued && styles.subdued]}>
    <Text style={subdued ? styles.subduedText : styles.actionText}>{title}</Text>
  </Pressable>;
}
function importMessage(error: unknown): string {
  if (error instanceof VaultError && error.code === 'LIMIT_REACHED') return 'The saved identity limit has been reached.';
  return 'Enter a valid nsec secret key. Your identity has not changed.';
}
function ImportIdentity({ transition, onClose }: { transition: IdentityTransition; onClose: () => void }) {
  const [form, setForm] = useState({ input: '', error: '' });
  useEffect(() => {
    const subscription = AppState.addEventListener('change', next => { if (next !== 'active') onClose(); });
    return () => subscription.remove();
  }, [onClose]);
  const review = () => {
    Keyboard.dismiss();
    const input = form.input;
    setForm({ input: '', error: '' });
    try {
      const pending = transition.prepareImport(input);
      if (pending === null) onClose();
    } catch (error) { setForm({ input: '', error: importMessage(error) }); }
  };
  return <View style={styles.group}>
    <Text accessibilityRole="header" style={styles.title}>Import identity</Text>
    <Text style={styles.detail}>Enter your nsec to use an existing identity. Your current identity will remain saved on this device.</Text>
    <TextInput testID="identity-import-input" accessibilityLabel="Secret key" secureTextEntry autoCapitalize="none" autoCorrect={false}
      autoComplete="off" importantForAutofill="no" textContentType="none" maxLength={256} value={form.input}
      onChangeText={input => setForm({ input, error: '' })} placeholder="nsec…" placeholderTextColor={colors.muted}
      style={styles.input} returnKeyType="done" onSubmitEditing={review} />
    {form.error !== '' && <Text testID="identity-import-error" accessibilityLiveRegion="polite" style={styles.detail}>{form.error}</Text>}
    <Action title="Continue" testID="identity-import-review" onPress={review} />
    <Action title="Cancel" testID="identity-import-cancel" onPress={onClose} subdued />
  </View>;
}
function ConfirmIdentity({ pending, transition, npub }: { pending: IdentityChange; transition: IdentityTransition; npub: string }) {
  return <View style={styles.group}>
    <Text accessibilityRole="header" style={styles.title}>Switch identity?</Text>
    <Text selectable testID="identity-change-npub" style={styles.npub}>{npub}</Text>
    <Text style={styles.detail}>Every open napplet will restart with this identity’s saved data. Unsaved work will be lost and pending signing requests will be cancelled.</Text>
    <Action title="Keep current identity" testID="identity-change-cancel" onPress={() => transition.cancel(pending)} subdued />
    <Action title={pending.kind === 'import' ? 'Import and switch' : 'Switch identity'} testID="identity-change-confirm"
      onPress={() => { void transition.confirm(pending).catch(() => undefined); }} />
  </View>;
}
export function IdentitySettings({ openBundledTest }: SettingsActions) {
  const { transition, formatNpub } = useIdentityOwner();
  const state = useSyncExternalStore(transition.subscribe, transition.getSnapshot);
  const [importing, setImporting] = useState(false);
  const closeImport = useCallback(() => setImporting(false), []);
  useEffect(() => () => {
    const pending = transition.getSnapshot().pending;
    if (pending) transition.cancel(pending);
  }, [transition]);
  if (state.phase === 'switching') return <View style={styles.body}>
    <ActivityIndicator color={colors.accent} /><Text accessibilityRole="header" style={styles.title}>Switching identity…</Text>
  </View>;
  if (state.pending) return <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
    <ConfirmIdentity pending={state.pending} transition={transition} npub={formatNpub(state.pending.pubkey)} />
  </ScrollView>;
  return <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
    {state.failure && <Text testID="identity-change-error" accessibilityLiveRegion="polite" style={styles.detail}>{state.failure === 'LIMIT_REACHED' ? 'The saved identity limit has been reached.' : 'The identity change was not accepted. Your current identity and open napplets are unchanged.'}</Text>}
    {importing ? <ImportIdentity transition={transition} onClose={closeImport} /> : <>
      <Text selectable testID="settings-full-npub" style={styles.npub}>{formatNpub(state.session.vault.selectedPubkey)}</Text>
      <Text accessibilityRole="header" style={styles.title}>Saved identities</Text>
      {state.session.vault.identities.map(identity => <Pressable key={identity.pubkey} accessibilityRole="button"
        disabled={identity.pubkey === state.session.vault.selectedPubkey || identity.status !== 'active'}
        accessibilityState={{ selected: identity.pubkey === state.session.vault.selectedPubkey, disabled: identity.pubkey === state.session.vault.selectedPubkey || identity.status !== 'active' }}
        testID={`identity-select-${identity.pubkey}`} style={styles.identity} onPress={() => transition.prepareSelect(identity.pubkey)}>
        <Text style={styles.npub}>{formatNpub(identity.pubkey)}</Text>
        <Text style={styles.detail}>{identity.pubkey === state.session.vault.selectedPubkey ? 'Selected' : 'Use this identity'}</Text>
      </Pressable>)}
      <Action title="Import identity" testID="settings-import-identity" onPress={() => setImporting(true)} />
      <Text accessibilityRole="header" style={styles.title}>Bundled test napplets</Text>
      <Action title="Open UX Lab" testID="settings-open-ux-lab" onPress={openBundledTest} subdued />
    </>}
  </ScrollView>;
}
const styles = StyleSheet.create({
  body: { padding: 24, gap: 24 },
  group: { gap: 20 },
  title: { fontSize: 20, fontWeight: '600', color: colors.text },
  detail: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  npub: { color: colors.text, fontSize: 14, lineHeight: 22, fontFamily: 'monospace' },
  input: { color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 14, minHeight: 56, padding: 16, fontSize: 16 },
  identity: { padding: 16, gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 16 },
  action: { padding: 18, minHeight: 56, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center' },
  subdued: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  actionText: { color: colors.background, fontSize: 16, fontWeight: '600' },
  subduedText: { color: colors.text, fontSize: 16 },
});
