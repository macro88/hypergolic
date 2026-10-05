import {useRef} from 'react';
import {AccessibilityInfo,Modal,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {OutboxPublicationReceipt} from '../outbox/publication-receipt';
import type {RelayOutcome} from '../network/relay-service';
import {colors} from './theme';
function Group({title,id,rows}:{title:string;id:string;rows:readonly RelayOutcome[]}){
 return <View style={styles.group}><Text accessibilityRole="header" style={styles.heading}>{title}</Text><Text selectable style={styles.mono}>{id}</Text>
  {rows.map(row=><View key={row.relay} style={styles.group}><Text selectable style={styles.mono}>{row.relay}</Text><Text style={styles.text}>{row.status==='cancelled-before-send'?'Cancelled before send':row.status==='unknown'?'Unknown':row.status==='accepted'?'Accepted':'Rejected'}{row.reason?` · ${row.reason}`:''}</Text></View>)}
 </View>;
}
/** Primary and existing-list ACKs stay separate; acceptance does not prove recipient consumption. */
export function PublicationReceiptSheet({receipt,onDismiss}:{receipt:OutboxPublicationReceipt;onDismiss:()=>void}){
 const insets=useSafeAreaInsets(),heading=useRef<Text>(null);
 return <Modal visible transparent animationType="none" onRequestClose={onDismiss} onShow={()=>{if(heading.current)AccessibilityInfo.sendAccessibilityEvent(heading.current,'focus');}}><View style={styles.backdrop}><View accessibilityViewIsModal style={[styles.sheet,{paddingBottom:Math.max(16,insets.bottom)}]} testID="outbox-publication-receipts">
  <ScrollView contentContainerStyle={styles.scroll}><Text ref={heading} accessibilityRole="header" style={styles.heading}>Publication results</Text><Text accessibilityLiveRegion="polite" style={styles.text}>{receipt.primary.ok?'Primary event accepted.':receipt.response.error}</Text>
   <Group title="Primary event" id={receipt.primary.event.id} rows={receipt.primary.outcomes}/>
   {receipt.ancillary&&<Group title="Existing relay list" id={receipt.ancillary.event.id} rows={receipt.ancillary.outcomes}/>}</ScrollView>
  <Pressable accessibilityRole="button" onPress={onDismiss} style={styles.close}><Text style={styles.closeText}>Close results</Text></Pressable>
 </View></View></Modal>;
}
const styles=StyleSheet.create({backdrop:{flex:1,backgroundColor:'#000000b3',justifyContent:'flex-end'},sheet:{maxHeight:'90%',backgroundColor:colors.surface,paddingTop:24,borderTopLeftRadius:28,borderTopRightRadius:28},scroll:{paddingHorizontal:24,paddingBottom:24,gap:16},group:{gap:8},heading:{color:colors.text,fontSize:19,fontWeight:'700'},text:{color:colors.text,fontSize:15,lineHeight:22},mono:{color:colors.muted,fontFamily:'monospace',fontSize:12,lineHeight:19},close:{marginHorizontal:24,minHeight:52,justifyContent:'center',alignItems:'center',backgroundColor:colors.accent,borderRadius:14},closeText:{color:colors.background,fontSize:17,fontWeight:'700'}});
