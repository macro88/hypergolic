import { useSyncExternalStore } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { WorkspaceController } from '../storage/workspace-controller';
import type { ShellIdentity } from './Header';
import { Shell } from './Shell';
import { colors } from './theme';

interface Props { identity: ShellIdentity; controller: WorkspaceController }
export function WorkspaceEntry({ identity, controller }: Props) {
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  return <View style={styles.screen} collapsable={false} testID={state.saving ? 'workspace-saving' : 'workspace-saved'}>
    <Shell identity={identity} workspace={state.workspace} onWorkspaceChange={controller.change} />
    <Modal visible={state.error !== null} animationType="none" onRequestClose={() => undefined}>
      <SafeAreaView style={styles.problem}>
        <Text accessibilityRole="header" style={styles.heading}>Workspace changes could not be saved</Text>
        <Text style={styles.detail}>Your open napplets are still loaded. Restart the app to reopen your workspace from saved data.</Text>
      </SafeAreaView>
    </Modal>
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  problem: { flex: 1, justifyContent: 'center', padding: 32, gap: 18, backgroundColor: colors.background },
  heading: { color: colors.text, fontSize: 27, fontWeight: '600' },
  detail: { color: colors.muted, fontSize: 16, lineHeight: 24 },
});
