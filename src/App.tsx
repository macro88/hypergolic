import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { IdentityEntry } from './shell/IdentityEntry';

export default function App() {
  return <GestureHandlerRootView style={styles.root}><SafeAreaProvider><IdentityEntry /></SafeAreaProvider></GestureHandlerRootView>;
}
const styles = StyleSheet.create({ root: { flex: 1 } });
