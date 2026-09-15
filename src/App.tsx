import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Shell } from './shell/Shell';

export default function App() {
  return <GestureHandlerRootView style={styles.root}><SafeAreaProvider><Shell /></SafeAreaProvider></GestureHandlerRootView>;
}
const styles = StyleSheet.create({ root: { flex: 1 } });
