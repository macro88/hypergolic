import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>Hypergolic</Text>
      <Text style={styles.description}>Development build</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#101415' },
  title: { color: '#f5f7f7', fontSize: 28, fontWeight: '600' },
  description: { color: '#b6c1c2', fontSize: 16, marginTop: 12 },
});
