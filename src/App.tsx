import { useCallback, useState } from 'react';
import { Image, StatusBar, StyleSheet, Text, View, type NativeSyntheticEvent } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NappletHost, type HostEvent } from './runtime/NappletHost';

const sessionId = 'ux-lab-native-proof';

function RuntimeProof() {
  const [status, setStatus] = useState('Starting runtime');
  const onHostEvent = useCallback(({ nativeEvent }: NativeSyntheticEvent<HostEvent>) => {
    if (nativeEvent.sessionId !== sessionId) return;
    setStatus(nativeEvent.type === 'ready' ? 'Runtime connected' : `Runtime unavailable: ${nativeEvent.code}`);
  }, []);
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Image source={require('../assets/brand/hypergolic-logo.png')} accessibilityLabel="Hypergolic" style={styles.logo} />
        <Text accessibilityRole="header" style={styles.title}>UX Lab</Text>
        <Text style={styles.build}>Native proof</Text>
      </View>
      <View style={styles.stage}>
        <NappletHost sessionId={sessionId} onHostEvent={onHostEvent} style={styles.host} />
      </View>
      <Text accessibilityLiveRegion="polite" testID="runtime-status" style={styles.status}>{status}</Text>
    </SafeAreaView>
  );
}

export default function App() {
  return <SafeAreaProvider><RuntimeProof /></SafeAreaProvider>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#120e0a' },
  header: { height: 72, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 32, height: 32, resizeMode: 'contain' },
  title: { color: '#f4efeb', fontSize: 20, fontWeight: '600', flex: 1 },
  build: { color: '#b5aaa3', fontSize: 12 },
  stage: { flex: 1, overflow: 'hidden', marginHorizontal: 12, borderRadius: 24, borderColor: '#312923', borderWidth: 1 },
  host: { flex: 1 },
  status: { color: '#b5aaa3', textAlign: 'center', fontSize: 12, padding: 12 },
});
