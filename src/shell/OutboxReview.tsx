import {StyleSheet,Text,View} from 'react-native';
import type {OutboxPublicationPlan,OutboxDestinationSource} from '../outbox/publication-plan';
import {colors} from './theme';
function sourceLabel(source:OutboxDestinationSource):string {
  if(source.kind==='own')return 'Your write relays';
  if(source.kind==='network-fallback')return 'Your Network fallback';
  if(source.kind==='inbox')return `Required inbox for ${source.author}`;
  return 'Explicit destination';
}
/** Exact destinations and the existing signed list are part of the same one-time review. */
export function OutboxReview({plan}:{plan:OutboxPublicationPlan}){
 return <View style={styles.group} testID="outbox-approval-routing">
  <Text accessibilityRole="header" style={styles.heading}>Publication destinations</Text>
  {plan.destinations.map(row=><View key={row.relay} style={styles.group}><Text selectable style={styles.mono}>{row.relay}</Text><Text style={styles.label}>{row.sources.map(sourceLabel).join(' · ')}</Text></View>)}
  {plan.ancillary&&<View style={styles.group} testID="outbox-approval-ancillary">
   <Text accessibilityRole="header" style={styles.heading}>Also send your existing relay list</Text>
   <Text style={styles.label}>Approve once sends this already signed event to the same destinations. Its results are shown separately.</Text>
   <Text selectable style={styles.mono}>{JSON.stringify(plan.ancillary,null,2)}</Text>
  </View>}
 </View>;
}
const styles=StyleSheet.create({group:{gap:8},heading:{color:colors.text,fontSize:17,fontWeight:'700',marginTop:12},label:{color:colors.muted,fontSize:14,lineHeight:21},mono:{color:colors.text,fontFamily:'monospace',fontSize:12,lineHeight:19}});
