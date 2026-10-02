import { memo, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View, type ListRenderItemInfo } from 'react-native';
import type { UploadService, UploadPresentation } from '../uploads/upload-service.ts';
import type { UploadRecoveryService, UploadRecoveryRecord } from '../uploads/upload-recovery.ts';
import type { Workspace } from './workspace.ts';
import { colors } from './theme';

function recoveryText(row: UploadRecoveryRecord, attempted: boolean): string {
  if (row.state === 'present') return 'A matching copy is present. This check does not prove which attempt stored it.';
  if (row.state === 'absent') return 'No copy was found at this server now. An earlier interrupted request could still finish. Any new upload needs fresh approval.';
  return attempted ? 'The outcome is still unknown. This upload remains blocked until a check succeeds.' : 'The upload outcome is unknown. A copy may remain on this server.';
}
const RecoveryRow = memo(function RecoveryRow({row, checking, attempted, onCheck}: {
  row: UploadRecoveryRecord; checking: boolean; attempted: boolean; onCheck: (uploadId: string) => void;
}) {
  const check = useCallback(() => onCheck(row.uploadId), [onCheck, row.uploadId]);
  const accessibilityState = useMemo(() => ({disabled: checking}), [checking]);
  return <View testID="upload-recovery-record" style={styles.record}>
          <Text selectable style={styles.detail}>{row.appId}</Text>
          <Text selectable style={styles.mono}>{row.destination}</Text>
          <Text selectable style={styles.mono}>{row.sha256}</Text>
          <Text style={styles.detail}>{row.size.toLocaleString()} bytes · {row.mimeType}</Text>
          <Text testID="upload-recovery-state" accessibilityLiveRegion="polite" style={styles.detail}>{recoveryText(row, attempted)}</Text>
          {row.state === 'unknown' && <Pressable testID="upload-recovery-check" accessibilityRole="button" accessibilityState={accessibilityState}
            disabled={checking} onPress={check} style={styles.cancel}>
            <Text style={styles.cancelText}>{checking ? 'Checking saved server…' : 'Check saved server'}</Text>
          </Pressable>}
          </View>;
});
const recoveryKey = (row: UploadRecoveryRecord): string => row.uploadId;
function Recovery({service, blocked}: {service: UploadRecoveryService; blocked: boolean}) {
  const snapshot = useSyncExternalStore(service.subscribe, service.getSnapshot);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    service.refresh(); const timer = setInterval(() => service.refresh(), 1000); return () => clearInterval(timer);
  }, [service]);
  const records = snapshot.records.filter(row => ['unknown','present','absent'].includes(row.state));
  const unknown = records.filter(row => row.state === 'unknown').length;
  const checking = useMemo(() => new Set(snapshot.checking), [snapshot.checking]);
  const check = useCallback((uploadId: string) => {void service.check(uploadId);}, [service]);
  const renderRow = useCallback(({item}: ListRenderItemInfo<UploadRecoveryRecord>) =>
    <RecoveryRow row={item} checking={checking.has(item.uploadId)} attempted={Object.hasOwn(snapshot.feedback, item.uploadId)} onCheck={check} />,
  [check, checking, snapshot.feedback]);
  return <>
    {!blocked && records.length > 0 && <Pressable testID="upload-recovery-open" accessibilityRole="button" onPress={() => setOpen(true)} style={styles.cancel}>
      <Text style={styles.cancelText}>{unknown ? `${unknown} upload${unknown === 1 ? ' needs' : 's need'} checking` : 'View checked uploads'}</Text>
    </Pressable>}
    <Modal visible={open && !blocked && snapshot.available && records.length > 0} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.backdrop}><View accessibilityViewIsModal style={styles.sheet}>
        <Text accessibilityRole="header" style={styles.heading}>Check interrupted uploads</Text>
        <Text style={styles.detail}>Checks read the saved server and hash. They do not retry an upload, sign in to another provider, or delete a remote file.</Text>
        <FlatList data={records} keyExtractor={recoveryKey} contentContainerStyle={styles.records} renderItem={renderRow} />
        <Pressable testID="upload-recovery-close" accessibilityRole="button" onPress={() => setOpen(false)} style={styles.cancel}><Text style={styles.cancelText}>Close upload checks</Text></Pressable>
      </View></View>
    </Modal>
  </>;
}
function outcomeText(item: UploadPresentation['outcomes'][number]): string {
  if (item.result.status === 'complete') return 'Upload confirmed by server.';
  if (item.result.error === 'outcome unknown') return 'Upload outcome unknown. A copy may remain on the server. Check the same server before retrying.';
  return 'Upload stopped: ' + item.result.error + '.';
}
export function UploadProgress({service, snapshot, workspace, blocked, reviewing}: {
  service: UploadService | undefined; snapshot: UploadPresentation; workspace: Workspace | undefined; blocked: boolean; reviewing: boolean;
}) {
  const outcome = snapshot.outcomes.at(-1);
  return <View pointerEvents="box-none" style={styles.progress}>
    {snapshot.active.map(item => <View key={item.id} testID="upload-progress" style={styles.card}>
      <Text accessibilityLiveRegion="polite" style={styles.text}>Uploading from {workspace?.sessions.find(session => session.id === item.origin.sessionId)?.title ?? 'Napplet'}: {item.bytesSent.toLocaleString()} / {item.bytesTotal.toLocaleString()} bytes sent. Waiting for server confirmation.</Text>
      <Pressable testID="upload-cancel" accessibilityRole="button" accessibilityLabel="Cancel upload" onPress={() => service?.cancel(item.id)} style={styles.cancel}><Text style={styles.cancelText}>Cancel upload</Text></Pressable>
    </View>)}
    {outcome && !blocked && !reviewing && <Pressable testID="upload-outcome" accessibilityRole="button" accessibilityLabel={outcomeText(outcome)} accessibilityHint="Dismiss upload result" onPress={() => service?.dismissOutcome(outcome.id)}>
      <Text accessibilityLiveRegion="polite" style={styles.text}>{outcomeText(outcome)}</Text>
    </Pressable>}
    {service?.recovery && <Recovery service={service.recovery} blocked={blocked || reviewing} />}
  </View>;
}
const styles = StyleSheet.create({progress: {paddingHorizontal: 16, gap: 8}, card: {gap: 6},
  text: {color: colors.text, backgroundColor: colors.raised, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, fontSize: 15},
  cancel: {minHeight: 44, backgroundColor: colors.accent, borderRadius: 12, justifyContent: 'center', alignItems: 'center', padding: 12},
  cancelText: {color: colors.background, fontSize: 16, fontWeight: '700'}, backdrop: {flex: 1, backgroundColor: '#000a', justifyContent: 'center', padding: 20},
  sheet: {maxHeight: '85%', backgroundColor: colors.raised, borderRadius: 20, padding: 20, gap: 16}, heading: {color: colors.text, fontSize: 23, fontWeight: '600'},
  detail: {color: colors.text, fontSize: 15, lineHeight: 21}, mono: {color: colors.text, fontFamily: 'monospace', fontSize: 12},
  records: {gap: 16}, record: {gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12}});
