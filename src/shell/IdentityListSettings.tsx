import {useState, useSyncExternalStore} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {IdentityListAccess} from '../identity/identity-permissions';
import {formatNpub} from '../security/identity-crypto';
import {colors} from './theme';
export function IdentityListSettings({service, user}: {service: IdentityListAccess | null; user: string}) {
  return service ? <Available service={service} user={user} /> : <Text style={styles.text}>Public list permissions are unavailable.</Text>;
}
function Available({service, user}: {service: IdentityListAccess; user: string}) {
  const state = useSyncExternalStore(service.subscribe, service.getSnapshot), [failure, setFailure] = useState('');
  const grants = state.grants.filter(value => value.user === user);
  return <View style={styles.section}>
    <Text accessibilityRole="header" style={styles.title}>Public list permissions</Text>
    <Text style={styles.text}>Remembered access to public mutes and categorized lists for the selected identity.</Text>
    {grants.length === 0 && <Text style={styles.text}>No remembered public list access.</Text>}
    {grants.map(grant => <View key={JSON.stringify([grant.publisher, grant.appId])} style={styles.row}>
      <Text selectable style={styles.text}>{grant.appId}</Text><Text selectable style={styles.mono}>{formatNpub(grant.publisher)}</Text>
      {state.denied.some(value => value.publisher === grant.publisher && value.appId === grant.appId && value.user === grant.user) && <Text style={styles.text}>Access is denied in this session. Retry to save revocation.</Text>}
      <Pressable accessibilityRole="button" accessibilityLabel={'Revoke public lists for ' + grant.appId} accessibilityState={{disabled: state.busy}} disabled={state.busy} style={styles.button} onPress={() => {
        setFailure(''); void service.revoke(grant).catch(() => setFailure('Public list revocation could not be completed.'));
      }}><Text style={styles.action}>Revoke public list access</Text></Pressable>
    </View>)}
    {(state.error || failure) && <Text accessibilityLiveRegion="polite" style={styles.text}>{state.error ?? failure}</Text>}
  </View>;
}
const styles = StyleSheet.create({section: {gap: 12}, row: {gap: 8, borderWidth: 1, borderColor: colors.border, padding: 12}, title: {color: colors.text, fontSize: 20, fontWeight: '600'}, text: {color: colors.muted, fontSize: 15, lineHeight: 22}, mono: {color: colors.text, fontSize: 12}, button: {minHeight: 48, justifyContent: 'center', alignItems: 'center'}, action: {color: colors.accent, fontSize: 16}});
