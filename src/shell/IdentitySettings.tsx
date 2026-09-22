import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { ActivityIndicator, AppState, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { SettingsActions } from './Shell';
import type { IdentityChange, IdentitySession, IdentityTransition } from '../security/identity-transition';
import type { IdentityActions } from '../security/identity-actions';
import { VaultError } from '../security/identity-vault';
import { useIdentityOwner } from './IdentityShell';
import { IdentityBackup } from './IdentityBackup';
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
type DeletionReview = Readonly<{ pubkey: string; session: IdentitySession }>;
function DeleteIdentity({ review, transition, actions, npub, busy, onClose }: {
  review: DeletionReview; transition: IdentityTransition; actions: IdentityActions;
  npub: string; busy: boolean; onClose: () => void;
}) {
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    let mounted = true;
    void actions.isDeletionAvailable().then(value => { if (mounted) setAvailable(value); });
    return () => { mounted = false; };
  }, [actions]);
  const confirm = () => {
    if (available !== true || busy) return;
    void transition.deleteInactive(review.pubkey, review.session).catch(() => undefined).finally(() => {
      try { actions.endSettings(); } catch { /* Native authority also checks its lifetime. */ }
      onClose();
    });
  };
  return <View style={styles.group}>
    <Text accessibilityRole="header" style={styles.title}>{busy ? 'Confirm on your device' : 'Delete saved identity?'}</Text>
    <Text selectable testID="identity-delete-npub" style={styles.npub}>{npub}</Text>
    <Text style={styles.detail}>This removes the secret key from this device. You will need a separate backup to use this identity again. Your currently selected identity and open napplets stay as they are.</Text>
    {busy ? <>
      <ActivityIndicator color={colors.accent} />
      <Action title="Cancel deletion" testID="identity-delete-cancel-auth" onPress={() => { transition.cancelDeletion(review.session); try { actions.cancelDeletion(); } catch { /* Revoked locally before native cleanup. */ } }} subdued />
    </> : <>
      <Action title="Keep identity" testID="identity-delete-cancel" onPress={onClose} subdued />
      {available === true ? <Action title="Authenticate and delete" testID="identity-delete-confirm" onPress={confirm} />
        : <Text testID="identity-delete-unavailable" style={styles.detail}>{available === null ? 'Checking device authentication…' : 'Device authentication is unavailable. Enable a device passcode or supported biometric authentication to delete an identity.'}</Text>}
    </>}
  </View>;
}
function failureMessage(failure: ReturnType<IdentityTransition['getSnapshot']>['failure']): string {
  if (failure === 'LIMIT_REACHED') return 'The saved identity limit has been reached.';
  if (failure === 'DELETION_REJECTED') return 'Deletion was not approved. Your saved identities and open napplets are unchanged.';
  if (failure === 'DELETION_PENDING') return 'Deletion is paused. Authenticate again to finish removing the identity.';
  return 'The identity change was not accepted. Your current identity and open napplets are unchanged.';
}
export function IdentitySettings({ openBundledTest, openStateLab }: SettingsActions) {
  const { transition, formatNpub, runtime, actions } = useIdentityOwner();
  const state = useSyncExternalStore(transition.subscribe, transition.getSnapshot);
  const [importing, setImporting] = useState(false);
  const [deletion, setDeletion] = useState<DeletionReview | null>(null);
  const [backupReview, setBackupReview] = useState(false);
  const closeDeletion = useCallback(() => setDeletion(null), []);
  const closeImport = useCallback(() => setImporting(false), []);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', next => {
      if (next !== 'background') return; // iOS system authentication may temporarily make the app inactive.
      transition.cancelDeletion(transition.getSnapshot().session);
      try { actions?.cancelBackup(); } catch { /* Native backup authority is independently revoked by endSettings. */ }
      try { actions?.endSettings(); } catch { /* Local session is already invalidated. */ }
      closeDeletion();
      setBackupReview(false);
    });
    return () => {
      subscription.remove();
      transition.cancelDeletion(transition.getSnapshot().session);
      try { actions?.cancelBackup(); } catch { /* Local backup revocation runs before native cleanup. */ }
      try { actions?.endSettings(); } catch { /* Native lifetime independently revokes grants. */ }
    };
  }, [actions, closeDeletion, transition]);
  useEffect(() => () => {
    const pending = transition.getSnapshot().pending;
    if (pending) transition.cancel(pending);
  }, [transition]);
  if (deletion && actions) return <ScrollView contentContainerStyle={styles.body}>
    <DeleteIdentity review={deletion} transition={transition} actions={actions} npub={formatNpub(deletion.pubkey)}
      busy={state.phase === 'deleting'} onClose={closeDeletion} />
  </ScrollView>;
  if (backupReview && actions) return <ScrollView contentContainerStyle={styles.body}>
    <IdentityBackup actions={actions} session={state.session} npub={formatNpub(state.session.vault.selectedPubkey)} reviewing
      onReview={() => setBackupReview(true)} onClose={() => setBackupReview(false)} Action={Action} />
  </ScrollView>;
  if (state.phase === 'deleting') return <View style={styles.body}>
    <ActivityIndicator color={colors.accent} /><Text style={styles.title}>Finishing identity action…</Text>
  </View>;
  if (state.phase === 'switching') return <View style={styles.body}>
    <ActivityIndicator color={colors.accent} /><Text accessibilityRole="header" style={styles.title}>Switching identity…</Text>
  </View>;
  if (state.pending) return <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
    <ConfirmIdentity pending={state.pending} transition={transition} npub={formatNpub(state.pending.pubkey)} />
  </ScrollView>;
  return <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
    {state.failure && <Text testID="identity-change-error" accessibilityLiveRegion="polite" style={styles.detail}>{failureMessage(state.failure)}</Text>}
    {importing ? <ImportIdentity transition={transition} onClose={closeImport} /> : <>
      <Text selectable testID="settings-full-npub" style={styles.npub}>{formatNpub(state.session.vault.selectedPubkey)}</Text>
      {actions && <IdentityBackup actions={actions} session={state.session} npub={formatNpub(state.session.vault.selectedPubkey)} reviewing={false}
        onReview={() => setBackupReview(true)} onClose={() => setBackupReview(false)} Action={Action} />}
      <Text accessibilityRole="header" style={styles.title}>Saved identities</Text>
      {state.session.vault.identities.map(identity => <View key={identity.pubkey} style={styles.identity}><Pressable accessibilityRole="button"
        disabled={identity.pubkey === state.session.vault.selectedPubkey || identity.status !== 'active'}
        accessibilityState={{ selected: identity.pubkey === state.session.vault.selectedPubkey, disabled: identity.pubkey === state.session.vault.selectedPubkey || identity.status !== 'active' }}
        testID={`identity-select-${identity.pubkey}`} style={styles.identitySelect} onPress={() => transition.prepareSelect(identity.pubkey)}>
        <Text style={styles.npub}>{formatNpub(identity.pubkey)}</Text>
        <Text style={styles.detail}>{identity.pubkey === state.session.vault.selectedPubkey ? 'Selected' : identity.status === 'deleting' ? 'Deletion pending' : 'Use this identity'}</Text>
      </Pressable>
      {actions && identity.pubkey !== state.session.vault.selectedPubkey && (state.session.vault.pendingDeletion === null || state.session.vault.pendingDeletion === identity.pubkey) &&
        <Action title={identity.status === 'deleting' ? 'Finish deletion' : 'Delete identity'} testID={`identity-delete-${identity.pubkey}`}
          onPress={() => setDeletion(Object.freeze({ pubkey: identity.pubkey, session: state.session }))} subdued />}
      </View>)}
      <Action title="Import identity" testID="settings-import-identity" onPress={() => setImporting(true)} />
      <Text accessibilityRole="header" style={styles.title}>Bundled test napplets</Text>
      <Action title="Open UX Lab" testID="settings-open-ux-lab" onPress={openBundledTest} subdued />
      {runtime && <>
        <Action title="Open State Lab" testID="settings-open-state-lab" onPress={() => openStateLab('state-lab')} subdued />
        <Action title="Open State Lab Peer" testID="settings-open-state-lab-peer" onPress={() => openStateLab('state-lab-peer')} subdued />
        <Action title="Open State Lab · other publisher" testID="settings-open-state-lab-other-publisher" onPress={() => openStateLab('state-lab-other-publisher')} subdued />
      </>}
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
  identitySelect: { minHeight: 56, gap: 10 },
  action: { padding: 18, minHeight: 56, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center' },
  subdued: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  actionText: { color: colors.background, fontSize: 16, fontWeight: '600' },
  subduedText: { color: colors.text, fontSize: 16 },
});
