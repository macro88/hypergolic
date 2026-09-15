import { useRef } from 'react';
import { AccessibilityInfo, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

interface Props { title: string | null; onKeepOpen: () => void; onClose: () => void; onDismiss: () => void }
export function ClosePrompt({ title, onKeepOpen, onClose, onDismiss }: Props) {
  const keep = useRef<View>(null);
  return (
    <Modal visible={title !== null} transparent animationType="none" onRequestClose={onKeepOpen} onDismiss={onDismiss} onShow={() => {
      keep.current?.focus();
      if (keep.current) AccessibilityInfo.sendAccessibilityEvent(keep.current, 'focus');
    }}>
      <View style={styles.backdrop}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <Text accessibilityRole="header" style={styles.title}>Close {title}?</Text>
          <Text style={styles.body}>Unsaved work may be lost. Saved data will remain available when you open it again.</Text>
          <Pressable ref={keep} testID="close-keep-open" accessibilityRole="button" onPress={onKeepOpen} style={({ pressed }) => [styles.keep, pressed && styles.pressed]}><Text style={styles.keepText}>Keep open</Text></Pressable>
          <Pressable testID="close-confirm" accessibilityRole="button" onPress={onClose} style={({ pressed }) => [styles.close, pressed && styles.pressed]}><Text style={styles.closeText}>Close anyway</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000000b3', justifyContent: 'center', padding: 24 },
  dialog: { padding: 24, borderRadius: 24, backgroundColor: colors.surface, gap: 18, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.text, fontSize: 23, fontWeight: '600', letterSpacing: -0.5 },
  body: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  keep: { minHeight: 50, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', padding: 12 },
  keepText: { color: colors.background, fontSize: 16, fontWeight: '700' },
  close: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 },
  closeText: { color: colors.text, fontSize: 16 },
  pressed: { opacity: 0.7 },
});
