import { useCallback, useContext, useState } from 'react';
import { requireNativeView } from 'expo';
import { Platform, Text, type NativeSyntheticEvent, type ViewProps } from 'react-native';
import type { NappletDescriptor } from '../shell/workspace';
import type { NativeCapabilityEvent } from './runtime-owner';
import { RuntimeContext } from './RuntimeContext';

export type HostEvent = { type: 'ready'; sessionId: string } | { type: 'error'; sessionId: string; code: string };
interface Props extends ViewProps {
  session: NappletDescriptor;
  active?: boolean;
  onHostEvent: (event: NativeSyntheticEvent<HostEvent>) => void;
}
type NativeEvent = HostEvent | NativeCapabilityEvent;
interface NativeProps extends ViewProps {
  sessionId?: string;
  configuration?: string;
  active?: boolean;
  onHostEvent: (event: NativeSyntheticEvent<NativeEvent>) => void;
}
const NativeHost = (Platform.OS === 'android' || Platform.OS === 'ios') ? requireNativeView<NativeProps>('HypergolicNappletHost') : null;

/** A component lifetime owns one immutable native generation, despite workspace snapshot updates. */
export function NappletHost({ session, onHostEvent, ...props }: Props) {
  const runtime = useContext(RuntimeContext);
  const [binding] = useState(() => runtime?.open(session) ?? null);
  const receive = useCallback((event: NativeSyntheticEvent<NativeEvent>) => {
    const message = event.nativeEvent;
    if (message.sessionId !== session.id) return;
    if (message.type === 'capability') { binding?.receive(message); return; }
    if (message.type === 'error') binding?.revoke();
    onHostEvent(event as NativeSyntheticEvent<HostEvent>);
  }, [binding, onHostEvent, session.id]);
  if (NativeHost === null) return <Text>Napplet execution is available in the Android and iOS builds.</Text>;
  return <NativeHost {...props} {...(binding ? { configuration: binding.configuration } : { sessionId: session.id })} onHostEvent={receive} />;
}
