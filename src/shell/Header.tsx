import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image, type ImageProps } from 'expo-image';
import { useState } from 'react';
import { colors } from './theme';

/** Supplied by the trusted identity service. This component never resolves profile URLs. */
export interface ShellIdentity { npub: string; avatar?: ImageProps['source'] }
interface Props { title: string; identity?: ShellIdentity; onSettings: () => void }

function Avatar({ identity }: { identity: ShellIdentity }) {
  const [failed, setFailed] = useState(false);
  return identity.avatar && !failed
    ? <Image source={identity.avatar} style={styles.avatar} onError={() => setFailed(true)} accessible={false} />
    : <View style={styles.avatar} accessible={false}><Text style={styles.avatarText}>{identity.npub.slice(-2).toUpperCase()}</Text></View>;
}

export function Header({ title, identity, onSettings }: Props) {
  return (
    <View style={styles.header}>
      <Image source={require('../../assets/brand/hypergolic-logo.png')} style={styles.logo} contentFit="contain" accessibilityLabel="Hypergolic" />
      <Text accessibilityRole="header" numberOfLines={1} style={styles.title} testID="focused-napplet-name">{title}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={identity ? `Settings for ${identity.npub}` : 'Settings'} onPress={onSettings} testID="shell-settings" style={({ pressed }) => [styles.settings, pressed && styles.pressed]}>
        {identity ? <Avatar key={identity.npub} identity={identity} /> : <View style={styles.settingsMark} accessible={false}><View style={styles.settingsDot} /></View>}
        <Text numberOfLines={1} style={[styles.identity, identity && styles.npub]}>{identity ? `${identity.npub.slice(0, 8)}…${identity.npub.slice(-4)}` : 'Settings'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 72, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 32, height: 32 },
  title: { flex: 1, fontSize: 18, fontWeight: '600', color: colors.text, letterSpacing: -0.35 },
  settings: { minHeight: 48, maxWidth: '55%', paddingLeft: 7, paddingRight: 12, borderRadius: 26, backgroundColor: colors.surface, flexDirection: 'row', gap: 8, alignItems: 'center' },
  pressed: { backgroundColor: colors.raised },
  identity: { color: colors.text, fontSize: 12, flexShrink: 1 },
  npub: { fontFamily: 'monospace', color: colors.muted },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700', fontSize: 11, color: colors.background },
  settingsMark: { width: 30, height: 30, borderWidth: 1.5, borderColor: colors.muted, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  settingsDot: { width: 8, height: 8, borderWidth: 1.5, borderColor: colors.muted, borderRadius: 4 },
});
