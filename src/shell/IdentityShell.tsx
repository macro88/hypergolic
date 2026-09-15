import { createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import { AppState, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { TrustedIdentityOwner } from '../security/trusted-identity-owner';
import { IdentitySettings } from './IdentitySettings';
import { WorkspaceEntry } from './WorkspaceEntry';
import { colors } from './theme';

const OwnerContext = createContext<TrustedIdentityOwner | null>(null);
export function useIdentityOwner(): TrustedIdentityOwner {
  const owner = useContext(OwnerContext);
  if (owner === null) throw new Error('Identity settings require the trusted owner');
  return owner;
}
export function IdentityShell({ owner }: { owner: TrustedIdentityOwner }) {
  const { transition, formatNpub } = owner;
  const state = useSyncExternalStore(transition.subscribe, transition.getSnapshot);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', next => {
      const pending = transition.getSnapshot().pending;
      if (next !== 'active' && pending) transition.cancel(pending);
    });
    return () => subscription.remove();
  }, [transition]);
  if (state.phase === 'recovery') return <SafeAreaView style={styles.problem}>
    <Text accessibilityRole="header" style={styles.heading}>Your identity needs attention</Text>
    <Text style={styles.detail}>The identity change could not be confirmed. Restart Hypergolic to reopen your saved identity and workspace.</Text>
  </SafeAreaView>;
  return <OwnerContext value={owner}>
    <WorkspaceEntry key={state.session.epoch} identity={{ npub: formatNpub(state.session.vault.selectedPubkey) }}
      controller={state.session.workspace} blocked={state.phase === 'switching'} settingsComponent={IdentitySettings} />
  </OwnerContext>;
}
const styles = StyleSheet.create({
  problem: { flex: 1, justifyContent: 'center', padding: 32, gap: 18, backgroundColor: colors.background },
  heading: { color: colors.text, fontSize: 27, fontWeight: '600' },
  detail: { color: colors.muted, fontSize: 16, lineHeight: 24 },
});
