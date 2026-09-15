import { requireNativeView } from 'expo';
import { Platform, Text, type NativeSyntheticEvent, type ViewProps } from 'react-native';

export type HostEvent = { type: 'ready'; sessionId: string } | { type: 'error'; sessionId: string; code: string };
interface Props extends ViewProps {
  sessionId: string;
  onHostEvent: (event: NativeSyntheticEvent<HostEvent>) => void;
}
const NativeHost = Platform.OS === 'android' ? requireNativeView<Props>('HypergolicNappletHost') : null;

/** A session ID is shell-owned. This view accepts neither napplet HTML nor URLs. */
export function NappletHost(props: Props) {
  if (NativeHost === null) return <Text>Napplet execution is available in the Android build.</Text>;
  return <NativeHost {...props} />;
}
