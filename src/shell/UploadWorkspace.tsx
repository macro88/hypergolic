import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import type { UploadService, UploadPresentation } from '../uploads/upload-service.ts';
import type { Workspace } from './workspace.ts';
import { UploadSheet } from './UploadSheet';
import { colors } from './theme';
const empty: UploadPresentation = Object.freeze({current: null, pending: 0, pendingSessionIds: Object.freeze([]), active: Object.freeze([]), outcomes: Object.freeze([])});
export function useUploadPresentation(service: UploadService | undefined, epoch: number): UploadPresentation {
  const snapshot = useSyncExternalStore(useCallback(listener => service?.subscribe(listener) ?? (() => {}), [service]),
    useCallback(() => service?.getSnapshot() ?? empty, [service]));
  useEffect(() => {
    service?.revisionChanged(epoch);
    if (AppState.currentState === 'active') service?.foreground(); else service?.background();
    const listener = AppState.addEventListener('change', state => {if (state === 'active') service?.foreground(); else service?.background();});
    return () => listener.remove();
  }, [service, epoch]);
  useEffect(() => {
    if (!service || snapshot.pending + snapshot.active.length === 0) return;
    const timer = setInterval(() => service.refresh(), 250);
    return () => clearInterval(timer);
  }, [service, snapshot.pending, snapshot.active.length]);
  return snapshot;
}
function outcomeText(item: UploadPresentation['outcomes'][number]): string {
  if (item.result.status === 'complete') return 'Upload confirmed by server.';
  if (item.result.error === 'outcome unknown') return 'Upload outcome unknown. A copy may remain on the server. Check the same server before retrying.';
  return 'Upload stopped: ' + item.result.error + '.';
}
export function UploadWorkspace({service, snapshot, workspace, blocked}: {
  service: UploadService | undefined; snapshot: UploadPresentation; workspace: Workspace | undefined; blocked: boolean;
}) {
  const shown = blocked ? null : snapshot.current;
  const title = workspace?.sessions.find(session => session.id === shown?.origin.sessionId)?.title ?? 'Napplet';
  const outcome = snapshot.outcomes.at(-1);
  return <>
    <View pointerEvents="box-none" style={styles.progress}>
      {snapshot.active.map(item => <View key={item.id} testID="upload-progress" style={styles.card}>
        <Text accessibilityLiveRegion="polite" style={styles.text}>Uploading from {workspace?.sessions.find(session => session.id === item.origin.sessionId)?.title ?? 'Napplet'}: {item.bytesSent.toLocaleString()} / {item.bytesTotal.toLocaleString()} bytes sent. Waiting for server confirmation.</Text>
        <Pressable testID="upload-cancel" accessibilityRole="button" accessibilityLabel="Cancel upload" onPress={() => service?.cancel(item.id)} style={styles.cancel}><Text style={styles.cancelText}>Cancel upload</Text></Pressable>
      </View>)}
      {outcome && !blocked && !shown && <Pressable testID="upload-outcome" accessibilityRole="button" accessibilityLabel={outcomeText(outcome)} accessibilityHint="Dismiss upload result" onPress={() => service?.dismissOutcome(outcome.id)}>
        <Text accessibilityLiveRegion="polite" style={styles.text}>{outcomeText(outcome)}</Text>
      </Pressable>}
    </View>
    <UploadSheet item={shown} title={title} onApprove={id => {void service?.approve(id).catch(() => {});}} onReject={id => service?.reject(id)} />
  </>;
}
const styles = StyleSheet.create({progress: {position: 'absolute', left: 16, right: 16, bottom: 96, gap: 8}, card: {gap: 6},
  text: {color: colors.text, backgroundColor: colors.raised, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, fontSize: 15},
  cancel: {minHeight: 44, backgroundColor: colors.accent, borderRadius: 12, justifyContent: 'center', alignItems: 'center'}, cancelText: {color: colors.background, fontSize: 16, fontWeight: '700'}});
