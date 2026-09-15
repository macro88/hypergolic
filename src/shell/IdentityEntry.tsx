import { useEffect, useSyncExternalStore } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getIdentityState, startIdentity, subscribeIdentity } from '../security/identity-state';
import { Shell } from './Shell';
import { colors } from './theme';

const unavailableMessages = {
  'restart-required': {
    heading: 'Restart Hypergolic',
    detail: 'Close the app completely, then open it again to continue.',
  },
  'recovery-required': {
    heading: 'Your identity needs attention',
    detail: 'Your saved identity could not be opened. Restart the app to try again. Hypergolic has not replaced your identity.',
  },
  'device-required': {
    heading: 'Use a physical iPhone',
    detail: 'Simulator cannot provide the file protection required for identity storage. Open Hypergolic on an iPhone to continue.',
  },
} as const;

export function IdentityEntry() {
  const state = useSyncExternalStore(subscribeIdentity, getIdentityState);
  useEffect(() => { startIdentity(); }, []);
  if (state.status === 'ready') return <Shell identity={{ npub: state.identity.npub }} />;
  const message = state.status === 'opening' ? null : unavailableMessages[state.status];
  return <SafeAreaView style={styles.screen}>
    <View style={styles.brand}>
      <Image source={require('../../assets/brand/hypergolic-logo.png')} style={styles.logo} contentFit="contain" accessible={false} />
      <Text style={styles.name}>Hypergolic</Text>
    </View>
    <View style={styles.message} testID="identity-entry-status" accessibilityLiveRegion="polite">
      {message === null ? <><ActivityIndicator color={colors.accent} accessibilityLabel="Opening your identity" /><Text style={styles.detail}>Opening your identity…</Text></>
        : <><Text accessibilityRole="header" style={styles.heading}>{message.heading}</Text>
          <Text style={styles.detail}>{message.detail}</Text></>}
    </View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 72, paddingHorizontal: 20 },
  logo: { width: 32, height: 32 },
  name: { color: colors.text, fontWeight: '600', fontSize: 18 },
  message: { flex: 1, justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 72, gap: 18 },
  heading: { color: colors.text, fontSize: 27, fontWeight: '600' },
  detail: { color: colors.muted, fontSize: 16, lineHeight: 24 },
});
