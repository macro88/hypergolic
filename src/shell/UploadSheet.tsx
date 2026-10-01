import { useMemo, useState } from 'react';
import { Image } from 'expo-image';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { UploadItem } from '../uploads/upload-service.ts';
import { formatNpub } from '../security/identity-crypto.ts';
import { colors } from './theme';
interface Props {item: UploadItem | null; title: string; onApprove(id: string): void; onReject(id: string): void}
function preview(item: UploadItem): string | null {
  const bytes = item.copyPreview(); if (!bytes || item.review.mimeType !== 'image/png') return null;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const chunks: string[] = [];
  try {
    for (let start = 0; start < bytes.length; start += 3 * 4096) {
      let output = '';
      for (let offset = start; offset < Math.min(start + 3 * 4096, bytes.length); offset += 3) {
        const a = bytes[offset]!, b = bytes[offset + 1] ?? 0, c = bytes[offset + 2] ?? 0;
        output += alphabet[a >> 2]! + alphabet[((a & 3) << 4) | (b >> 4)]! +
          (offset + 1 < bytes.length ? alphabet[((b & 15) << 2) | (c >> 6)]! : '=') +
          (offset + 2 < bytes.length ? alphabet[c & 63]! : '=');
      }
      chunks.push(output);
    }
    return 'data:image/png;base64,' + chunks.join('');
  } finally {bytes.fill(0);}
}
function Review({item, title, onApprove, onReject}: Omit<Props, 'item'> & {item: UploadItem}) {
  const insets = useSafeAreaInsets(), [decoded, setDecoded] = useState(false);
  const uri = useMemo(() => item.previewReady ? preview(item) : null, [item]);
  return <Modal transparent animationType="none" visible onRequestClose={() => onReject(item.id)}>
    <View style={styles.backdrop}><View testID="upload-sheet" accessibilityViewIsModal style={[styles.sheet, {paddingBottom: Math.max(16, insets.bottom)}]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>Approve file upload</Text>
        {uri ? <Image testID="upload-preview" accessibilityLabel="Exact photo selected for upload" source={{uri}} contentFit="contain" cachePolicy="none" recyclingKey={item.id} style={styles.preview}
          onLoad={() => setDecoded(true)} onError={() => setDecoded(false)} /> : <Text style={styles.detail}>Preparing reviewed file…</Text>}
        <Text style={styles.label}>Requesting napplet</Text><Text style={styles.detail}>{title}</Text>
        <Text style={styles.label}>Publisher</Text><Text selectable style={styles.mono}>{item.origin.publisher === 'f'.repeat(64) && item.origin.appId === 'upload-lab' ? 'Unsigned bundled fixture' : formatNpub(item.origin.publisher)}</Text>
        <Text style={styles.label}>Selected identity</Text><Text testID="upload-review-identity" selectable style={styles.mono}>{formatNpub(item.review.identity)}</Text>
        <Text style={styles.label}>Upload to</Text><Text testID="upload-review-destination" selectable style={styles.mono}>{item.review.destination}</Text>
        <Text style={styles.detail}>{item.filename || 'Selected file'}{'\n'}{item.review.mimeType} · {item.review.size.toLocaleString()} bytes</Text>
        {item.caption !== '' && <Text selectable style={styles.detail}>Caption requested by napplet: {item.caption}</Text>}
        <Text style={styles.detail}>{item.review.metadataPolicy === 'photo-stripped' ? 'This reviewed photo contains no embedded personal metadata. Its pixels, size and color information have been preserved.' : 'This attachment is unchanged. Embedded metadata may still be included.'}</Text>
        <Text style={styles.detail}>Approval sends this file using your selected identity. Cancelling after transfer starts may leave a copy on the server.</Text>
        <Text style={styles.label}>Reviewed SHA-256</Text><Text testID="upload-review-hash" selectable style={styles.mono}>{item.review.sha256}</Text>
      </ScrollView>
      <View style={styles.actions}>
        <Pressable testID="upload-approve" accessibilityRole="button" accessibilityState={{disabled: !decoded || !item.previewReady}} disabled={!decoded || !item.previewReady} onPress={() => onApprove(item.id)} style={[styles.approve, (!decoded || !item.previewReady) && styles.disabled]}><Text style={styles.approveText}>Approve once</Text></Pressable>
        <Pressable testID="upload-reject" accessibilityRole="button" onPress={() => onReject(item.id)} style={styles.reject}><Text style={styles.detail}>Reject upload</Text></Pressable>
      </View>
    </View></View>
  </Modal>;
}
export function UploadSheet(props: Props) {return props.item ? <Review key={props.item.id} {...props} item={props.item} /> : null;}
const styles = StyleSheet.create({backdrop: {flex: 1, backgroundColor: '#000000b3', justifyContent: 'flex-end'},
  sheet: {maxHeight: '92%', backgroundColor: colors.surface, borderTopWidth: 1, borderColor: colors.border, borderTopLeftRadius: 28, borderTopRightRadius: 28},
  content: {padding: 24, gap: 10}, title: {color: colors.text, fontSize: 26, fontWeight: '600'}, preview: {width: '100%', height: 220, backgroundColor: colors.background},
  label: {color: colors.muted, fontSize: 14, fontWeight: '700', marginTop: 8}, detail: {color: colors.text, fontSize: 15, lineHeight: 22}, mono: {color: colors.text, fontFamily: 'monospace', fontSize: 12, lineHeight: 19},
  actions: {padding: 24, gap: 10, borderTopWidth: 1, borderColor: colors.border}, approve: {minHeight: 52, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center'}, approveText: {color: colors.background, fontSize: 17, fontWeight: '700'},
  reject: {minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 14}, disabled: {opacity: 0.5}});
