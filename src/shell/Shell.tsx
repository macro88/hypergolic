import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ComponentType } from 'react';
import { AccessibilityInfo, BackHandler, Keyboard, Modal, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { cancelAnimation, Easing, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { HostEvent } from '../runtime/NappletHost';
import { ClosePrompt } from './ClosePrompt';
import { Header, type ShellIdentity } from './Header';
import type { OverviewHandle } from './Overview';
import { WorkspaceStage } from './WorkspaceStage';
import { directionForHandle, type HandleSide } from './motion';
import { adjacentNapplet, closeNapplet, focusNapplet, openNapplet, showOverview, type NappletDescriptor, type Workspace } from './workspace';
import { colors } from './theme';

import { bundledUXDescriptor, initialTestWorkspace } from './fixtures';

const noPending = new Set<string>();
export interface SettingsActions { closeSettings: () => void; openBundledTest: () => void }
export interface ShellProps {
  initialWorkspace?: Workspace;
  workspace?: Workspace;
  onWorkspaceChange?: (workspace: Workspace) => void;
  identity?: ShellIdentity;
  pendingApprovals?: ReadonlySet<string>;
  onBeforeClose?: (session: NappletDescriptor) => void;
  onHostEvent?: (event: HostEvent) => void;
  settingsComponent?: ComponentType<SettingsActions>;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduced(value); }).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { active = false; subscription.remove(); };
  }, []);
  return reduced;
}

export function Shell({ initialWorkspace, workspace: controlledWorkspace, onWorkspaceChange, identity, pendingApprovals, onBeforeClose, onHostEvent, settingsComponent: SettingsContent }: ShellProps) {
  const [localWorkspace, setLocalWorkspace] = useState(() => initialWorkspace ?? initialTestWorkspace());
  const workspace = controlledWorkspace ?? localWorkspace;
  const current = useRef(workspace);
  useLayoutEffect(() => { current.current = workspace; }, [workspace]);
  const change = useCallback((next: Workspace) => {
    current.current = next;
    if (controlledWorkspace === undefined) setLocalWorkspace(next);
    onWorkspaceChange?.(next);
  }, [onWorkspaceChange, controlledWorkspace]);
  const [settings, setSettings] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [handleDragging, setHandleDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const lastCloseId = useRef<string | null>(null);
  const overview = useRef<OverviewHandle>(null);
  const settingsClose = useRef<View>(null);
  const focusedIndex = Math.max(0, workspace.sessions.findIndex(session => session.id === workspace.focusedId));
  const focused = workspace.sessions.find(session => session.id === workspace.focusedId);
  const nextFixtureNumber = useRef(Math.max(3, ...workspace.sessions.map(session => Number(session.id.match(/^ux-lab-(\d+)$/)?.[1] ?? 0))) + 1);
  const progress = useSharedValue(workspace.overview ? 1 : 0);
  const position = useSharedValue(focusedIndex);
  const scrollY = useSharedValue(0);
  const swipeY = useSharedValue(0);
  const swipeId = useSharedValue<string | null>(null);
  const animation = useRef<{ value: SharedValue<number>; token: symbol } | null>(null);
  const reduced = useReducedMotion();
  const keyboardVisible = useRef(false);
  const runAnimation = useCallback((value: SharedValue<number>, toValue: number, done: () => void, duration = 280) => {
    if (animation.current) cancelAnimation(animation.current.value);
    const token = Symbol('transition');
    animation.current = { value, token };
    busyRef.current = true;
    setBusy(true);
    const finish = (finished: boolean) => {
      if (animation.current?.token !== token) return;
      animation.current = null;
      busyRef.current = false;
      setBusy(false);
      if (finished) done();
    };
    value.set(withTiming(toValue, { duration: reduced ? 0 : duration, easing: Easing.out(Easing.cubic) }, finished => {
      scheduleOnRN(finish, finished === true);
    }));
  }, [reduced]);
  useEffect(() => () => {
    const running = animation.current;
    animation.current = null;
    if (running) cancelAnimation(running.value);
  }, []);
  useEffect(() => {
    const shown = Keyboard.addListener('keyboardDidShow', () => { keyboardVisible.current = true; });
    const hidden = Keyboard.addListener('keyboardDidHide', () => { keyboardVisible.current = false; });
    return () => { shown.remove(); hidden.remove(); };
  }, []);
  useEffect(() => {
    if (!busyRef.current) { position.set(focusedIndex); progress.set(workspace.overview ? 1 : 0); }
  }, [focusedIndex, position, progress, workspace.overview]);

  const focusSession = useCallback((id: string) => {
    if (busyRef.current) return;
    const state = current.current;
    const index = state.sessions.findIndex(session => session.id === id);
    if (index < 0) return;
    Keyboard.dismiss();
    position.set(index);
    change(focusNapplet(state, id));
    runAnimation(progress, 0, () => AccessibilityInfo.announceForAccessibility(state.sessions[index].title));
  }, [change, position, progress, runAnimation]);
  const openOverview = useCallback(() => {
    if (busyRef.current) return;
    Keyboard.dismiss();
    overview.current?.revealCard(current.current.focusedId);
    change(showOverview(current.current));
    runAnimation(progress, 1, () => overview.current?.focusCard(current.current.focusedId));
  }, [change, progress, runAnimation]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (keyboardVisible.current) { Keyboard.dismiss(); return true; }
      if (busyRef.current) return true;
      if (!workspace.overview) { openOverview(); return true; }
      if (workspace.focusedId) { focusSession(workspace.focusedId); return true; }
      return false;
    });
    return () => subscription.remove();
  }, [focusSession, openOverview, workspace.focusedId, workspace.overview]);
  const onHandleEnd = (side: HandleSide, result: 'overview' | 'switch' | 'cancel') => {
    setHandleDragging(false);
    if (busyRef.current) return;
    if (result === 'overview') { position.set(focusedIndex); openOverview(); return; }
    const id = result === 'switch' ? adjacentNapplet(current.current, directionForHandle(side)) : null;
    const destination = id ? current.current.sessions.findIndex(session => session.id === id) : focusedIndex;
    runAnimation(position, destination, () => {
      if (id) { change(focusNapplet(current.current, id)); AccessibilityInfo.announceForAccessibility(current.current.sessions[destination].title); }
    }, 190);
  };
  const requestClose = (id: string) => {
    if (busyRef.current || !current.current.sessions.some(session => session.id === id)) return;
    Keyboard.dismiss();
    lastCloseId.current = id;
    setClosingId(id);
  };
  const keepOpen = () => {
    setClosingId(null);
    // Modal's Android onDismiss is not guaranteed; focus follows the next commit too.
    requestAnimationFrame(() => overview.current?.focusCard(lastCloseId.current));
  };
  const confirmClose = () => {
    const session = current.current.sessions.find(item => item.id === closingId);
    if (!session) return;
    onBeforeClose?.(session);
    change(closeNapplet(current.current, session.id));
    setClosingId(null);
    lastCloseId.current = null;
    requestAnimationFrame(() => overview.current?.focusCard(null));
  };
  const openSettings = () => { if (!busyRef.current) { Keyboard.dismiss(); setSettings(true); } };
  const openBundledTest = () => {
    while (current.current.sessions.some(session => session.id === `ux-lab-${nextFixtureNumber.current}`)) nextFixtureNumber.current++;
    const descriptor = bundledUXDescriptor(nextFixtureNumber.current++);
    const next = openNapplet(current.current, descriptor);
    position.set(next.sessions.length - 1);
    progress.set(0);
    change(next);
    setSettings(false);
  };
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'right', 'bottom', 'left']}>
      <StatusBar barStyle="light-content" />
      <View accessibilityElementsHidden={settings || closingId !== null} importantForAccessibility={settings || closingId ? 'no-hide-descendants' : 'auto'} style={styles.screen}>
        <Header title={focused?.title ?? 'Hypergolic'} identity={identity} onSettings={openSettings} />
        <WorkspaceStage workspace={workspace} progress={progress} position={position} scrollY={scrollY} swipeY={swipeY} swipeId={swipeId} busy={busy} blocked={settings || closingId !== null} interactive={!handleDragging}
          pending={pendingApprovals ?? noPending} ref={overview} onHostEvent={onHostEvent} onFocus={focusSession} onClose={requestClose} onOpen={openSettings}
          onDragEnd={(id, close) => { runAnimation(swipeY, 0, () => { swipeId.set(null); if (close) requestClose(id); }, 140); }}
          onHandleStart={() => { setHandleDragging(true); Keyboard.dismiss(); cancelAnimation(position); }}
          onHandleEnd={onHandleEnd} />
      </View>
      <ClosePrompt title={workspace.sessions.find(session => session.id === closingId)?.title ?? null} onKeepOpen={keepOpen} onClose={confirmClose} onDismiss={() => overview.current?.focusCard(lastCloseId.current)} />
      <Modal visible={settings} animationType="none" onRequestClose={() => setSettings(false)} onShow={() => {
        settingsClose.current?.focus();
        if (settingsClose.current) AccessibilityInfo.sendAccessibilityEvent(settingsClose.current, 'focus');
      }}>
        <SafeAreaView style={styles.settingsScreen}>
          <View style={styles.settingsHeader}><Text accessibilityRole="header" style={styles.settingsTitle}>Settings</Text><Pressable ref={settingsClose} accessibilityRole="button" testID="settings-done" onPress={() => setSettings(false)} style={styles.done}><Text style={styles.doneText}>Done</Text></Pressable></View>
          {SettingsContent ? <SettingsContent closeSettings={() => setSettings(false)} openBundledTest={openBundledTest} /> : <View style={styles.settingsBody}>
            <Text style={styles.settingsText}>{identity ? identity.npub : 'Identity is not configured in this build.'}</Text>
            <Text accessibilityRole="header" style={styles.settingsSection}>Bundled test napplets</Text>
            <Pressable testID="settings-open-ux-lab" accessibilityRole="button" onPress={openBundledTest} style={styles.openTest}><Text style={styles.openTestText}>Open UX Lab</Text><Text style={styles.addMark} accessible={false}>+</Text></Pressable>
          </View>}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  settingsScreen: { flex: 1, backgroundColor: colors.background },
  settingsHeader: { minHeight: 72, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingsTitle: { fontSize: 26, fontWeight: '600', color: colors.text },
  done: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  doneText: { fontSize: 16, color: colors.accent },
  settingsBody: { padding: 24, gap: 24 },
  settingsText: { color: colors.muted, fontSize: 15, lineHeight: 23 },
  settingsSection: { color: colors.text, fontSize: 17, fontWeight: '600', marginTop: 16 },
  openTest: { padding: 18, minHeight: 60, borderRadius: 16, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  openTestText: { color: colors.text, fontSize: 16 },
  addMark: { color: colors.accent, fontSize: 26 },
});
