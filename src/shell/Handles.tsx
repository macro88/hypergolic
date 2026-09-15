import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { directionForHandle, handlePosition, handleRelease, absolutePointerDrag, type HandleSide } from './motion';
import { colors, HANDLE_GUTTER } from './theme';

interface Props {
  width: number;
  top: number;
  index: number;
  count: number;
  position: SharedValue<number>;
  disabled: boolean;
  canPrevious: boolean;
  canNext: boolean;
  onStart: (side: HandleSide) => void;
  onEnd: (side: HandleSide, result: 'overview' | 'switch' | 'cancel') => void;
}

function Handle({ side, width, top, index, count, position, disabled, canPrevious, canNext, onStart, onEnd }: Props & { side: HandleSide }) {
  const multiTouch = useSharedValue(false);
  const panActive = useSharedValue(false);
  const origin = useSharedValue({ x: 0, y: 0 });
  const canMove = side === 'left' ? canPrevious : canNext;
  const moveLabel = directionForHandle(side) === -1 ? 'Previous napplet' : 'Next napplet';
  const pan = Gesture.Pan().enabled(!disabled).minDistance(8).maxPointers(1).shouldCancelWhenOutside(false)
    .onBegin(event => { multiTouch.set(false); panActive.set(false); origin.set({ x: event.absoluteX, y: event.absoluteY }); })
    .onStart(() => { panActive.set(true); scheduleOnRN(onStart, side); })
    .onTouchesDown((event, manager) => { if (event.numberOfTouches > 1) { multiTouch.set(true); manager.fail(); } })
    .onUpdate(event => {
      if (event.numberOfPointers > 1) multiTouch.set(true);
      if (!multiTouch.get()) position.set(handlePosition(index, count, side, event.absoluteX - origin.get().x, width));
    })
    .onFinalize((event, success) => {
      // A failed, inactive pan must not cancel the tap that won this gesture.
      if (!panActive.get()) return;
      panActive.set(false);
      const result = success ? handleRelease(side, absolutePointerDrag(event, origin.get(), multiTouch.get()), width, canMove) : 'cancel';
      scheduleOnRN(onEnd, side, result);
    });
  const tap = Gesture.Tap().enabled(!disabled).maxDistance(8)
    .onTouchesDown((event, manager) => { if (event.numberOfTouches > 1) manager.fail(); })
    .onEnd((_event, success) => { if (success) scheduleOnRN(onEnd, side, 'overview'); });
  return <GestureDetector gesture={Gesture.Race(pan, tap)}>
    <View testID={`handle-${side}`} accessible accessibilityRole="button" focusable
      accessibilityLabel={`${side === 'left' ? 'Left' : 'Right'} napplet handle`}
      accessibilityHint={`Tap for overview.${canMove ? ` Swipe inward for ${moveLabel.toLowerCase()}.` : ' End of loaded napplets.'}`}
      accessibilityActions={[{ name: 'activate', label: 'Show napplet overview' }, ...(canMove ? [{ name: 'move', label: moveLabel }] : [])]}
      onAccessibilityTap={() => !disabled && onEnd(side, 'overview')}
      onAccessibilityAction={({ nativeEvent }) => {
        if (!disabled) onEnd(side, nativeEvent.actionName === 'move' && canMove ? 'switch' : 'overview');
      }}
      style={[styles.target, side === 'left' ? styles.left : styles.right, { top }]}>
      <View style={styles.pill}><View style={[styles.line, !canMove && styles.end]} /></View>
    </View>
  </GestureDetector>;
}

export function Handles(props: Props) {
  return <View pointerEvents={props.disabled ? 'none' : 'box-none'} style={[StyleSheet.absoluteFill, styles.layer, props.disabled && styles.hidden]} accessibilityElementsHidden={props.disabled} importantForAccessibility={props.disabled ? 'no-hide-descendants' : 'auto'}><Handle {...props} side="left" /><Handle {...props} side="right" /></View>;
}
const styles = StyleSheet.create({
  layer: { zIndex: 20 }, hidden: { opacity: 0 },
  target: { position: 'absolute', width: 44, height: 88, justifyContent: 'center', alignItems: 'center' },
  left: { left: 0, alignItems: 'flex-start' }, right: { right: 0, alignItems: 'flex-end' },
  pill: { width: HANDLE_GUTTER, height: 66, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  line: { width: 3, height: 28, backgroundColor: colors.accent, borderRadius: 2 },
  end: { backgroundColor: colors.muted, height: 18 },
});
