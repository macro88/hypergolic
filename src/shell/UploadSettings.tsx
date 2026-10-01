import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { UploadSettings as SettingsPort } from '../uploads/upload-settings.ts';
import { colors } from './theme';
export function UploadSettings({service}: {service: SettingsPort | null}) {
  const [input, setInput] = useState(() => service?.server() ?? '');
  const [busy, setBusy] = useState(false), [status, setStatus] = useState('');
  const save = async (defaults: boolean) => {
    if (!service || busy) return;
    Keyboard.dismiss(); setBusy(true); setStatus('');
    try {
      if (defaults) await service.restoreDefault(); else await service.replace(input.trim() || null);
      setInput(service.server() ?? ''); setStatus(service.server() ? 'Upload server saved.' : 'Uploads disabled.');
    } catch { setStatus('Could not save. Enter one public HTTPS origin, without a path.'); }
    finally { setBusy(false); }
  };
  return <View style={styles.section}>
    <Text accessibilityRole="header" style={styles.heading}>Blossom uploads</Text>
    <Text style={styles.detail}>Each upload needs your approval and names this server. Clearing the field disables uploads. These device settings apply to all identities. Your chosen server may charge for some file types or sizes.</Text>
    {service ? <>
      <TextInput testID="upload-server" accessibilityLabel="Blossom upload server" value={input} onChangeText={setInput}
        editable={!busy} autoCapitalize="none" autoCorrect={false} keyboardType="url" style={styles.input} />
      <Pressable testID="upload-server-save" accessibilityRole="button" accessibilityState={{disabled: busy}} disabled={busy} onPress={() => {void save(false);}} style={styles.button}><Text style={styles.label}>Save upload server</Text></Pressable>
      <Pressable testID="upload-server-default" accessibilityRole="button" accessibilityState={{disabled: busy}} disabled={busy} onPress={() => {void save(true);}} style={styles.button}><Text style={styles.label}>Restore upload default</Text></Pressable>
      {status && <Text testID="upload-settings-status" accessibilityLiveRegion="polite" style={styles.detail}>{status}</Text>}
    </> : <Text style={styles.detail}>Upload settings are unavailable.</Text>}
  </View>;
}
const styles = StyleSheet.create({section: {gap: 14}, heading: {color: colors.text, fontSize: 20, fontWeight: '600'},
  detail: {color: colors.muted, fontSize: 15, lineHeight: 22}, input: {color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 14, minHeight: 52, padding: 14, fontSize: 14},
  button: {minHeight: 52, padding: 15, borderRadius: 14, alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border}, label: {color: colors.text, fontSize: 15, fontWeight: '600'}});
