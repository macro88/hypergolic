import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ApprovalItem, ApprovalService } from '../security/approval-service.ts';
import { ApprovalSheet } from './ApprovalSheet';
import { ApprovalProvider } from './ApprovalContext';
import { Shell, type ShellProps } from './Shell';
import { colors } from './theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RelayOutcome } from '../network/relay-service';

type Props = Omit<ShellProps, 'pendingApprovals' | 'onBeforeClose'> & { service: ApprovalService; epoch: number };

function publicationStatus(results: readonly RelayOutcome[]): string {
  const accepted = results.filter(result => result.status === 'accepted').length;
  const unknown = results.filter(result => result.status === 'unknown').length;
  if (accepted > 0) return `Published to ${accepted} of ${results.length} relays.${unknown ? ' Other delivery could not be confirmed.' : ''}`;
  return unknown ? 'Publication could not be confirmed.' : 'No relay accepted the event.';
}

/** Joins trusted presentation to the native-authoritative queue without blocking the guest host. */
export function ApprovalWorkspace({ service, epoch, workspace, ...shell }: Props) {
  const insets = useSafeAreaInsets();
  const subscribe = useCallback((listener: () => void) => service.subscribe(listener), [service]);
  const getSnapshot = useCallback(() => service.getSnapshot(), [service]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  const [held, setHeld] = useState<ApprovalItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<string | null>(null);
  const shown = busy ? held : snapshot.current;
  useEffect(() => {
    service.revisionChanged(epoch);
    if (AppState.currentState === 'active') service.foreground(); else service.background();
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') service.foreground(); else if (state === 'background') service.background(); });
    return () => subscription.remove();
  }, [epoch, service]);
  useEffect(() => {
    if (snapshot.pending === 0) return;
    const timer = setInterval(() => service.refresh(), 250);
    return () => clearInterval(timer);
  }, [service, snapshot.pending]);
  const title = workspace?.sessions.find(session => session.id === shown?.origin.sessionId)?.title ?? 'Napplet';
  return <ApprovalProvider value={service}>
    <Shell {...shell} workspace={workspace} pendingApprovals={new Set(snapshot.pendingSessionIds)}
      onBeforeClose={session => service.close(session.id)} />
    {snapshot.reviewPaused && snapshot.pending > 0 && snapshot.focusedSessionId !== null && <View pointerEvents="box-none" style={[styles.resumeArea, { paddingBottom: Math.max(24, insets.bottom + 12) }]}><Pressable testID="approval-resume" accessibilityRole="button" onPress={() => service.resume()} style={styles.resume}><Text style={styles.resumeText}>Resume approvals</Text></Pressable></View>}
    {outcome && !shown && snapshot.focusedSessionId !== null && <Pressable testID="approval-outcome" accessibilityRole="button" accessibilityLabel={`${outcome} Dismiss status`} onPress={() => setOutcome(null)} style={styles.outcome}><Text accessibilityLiveRegion="polite" style={styles.outcomeText}>{outcome}</Text></Pressable>}
    <ApprovalSheet item={shown} nappletTitle={title} busy={busy} error={null}
      onApprove={id => { if (busy || snapshot.current?.id !== id) return; setHeld(snapshot.current); setBusy(true); setOutcome(null); void service.approve(id).then(results => setOutcome(publicationStatus(results))).catch(() => setOutcome('Approval was not completed.')).finally(() => { setHeld(null); setBusy(false); }); }}
      onReject={id => { if (!busy) service.reject(id); }} onDismiss={id => { if (!busy) service.dismiss(id); }} />
  </ApprovalProvider>;
}

const styles = StyleSheet.create({
  resumeArea: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 32 },
  resume: { minHeight: 52, borderRadius: 26, justifyContent: 'center', paddingHorizontal: 24, backgroundColor: colors.accent },
  resumeText: { color: colors.background, fontSize: 16, fontWeight: '700' },
  outcome: { position: 'absolute', left: 24, right: 24, bottom: 96, alignItems: 'center' },
  outcomeText: { color: colors.text, backgroundColor: colors.raised, borderColor: colors.border, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15 },
});
