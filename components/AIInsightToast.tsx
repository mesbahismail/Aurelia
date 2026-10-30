import { useEffect, useRef, useState } from 'react';
import { Animated, AppState, Easing, Image, Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from './icons';
import { MotionPressable, useReducedMotion } from './Motion';
import { WHITE } from './theme';

export type AIInsight = { title: string; detail: string; prompt: string };

const CYCLE_MS = 30_000;
const VISIBLE_MS = 3_000;
const EXIT_MS = 200;

export function AIInsightToast({ insights, bottom, onOpen, onHeightChange }: {
  insights: readonly AIInsight[];
  bottom: number;
  onOpen: (prompt: string) => void;
  onHeightChange: (height: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(AppState.currentState == null || AppState.currentState === 'active');
  const reveal = useRef(new Animated.Value(0)).current;
  const nextInsight = useRef(0);
  const dismiss = useRef<() => void>(() => {});
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => setForeground(state === 'active'));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (reduced) {
      reveal.stopAnimation();
      reveal.setValue(visible ? 1 : 0);
    }
  }, [reduced, visible, reveal]);

  useEffect(() => {
    if (!foreground || !insights.length) {
      reveal.setValue(0);
      setVisible(false);
      return;
    }
    let exitTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;
    let expiresAt = 0;
    dismiss.current = () => {
      clearTimeout(exitTimer);
      reveal.stopAnimation();
      if (reducedRef.current) { reveal.setValue(0); setVisible(false); return; }
      Animated.timing(reveal, {
        toValue: 0, duration: Math.min(EXIT_MS, Math.max(0, expiresAt - Date.now())),
        easing: Easing.in(Easing.quad), useNativeDriver: Platform.OS !== 'web', isInteraction: false,
      }).start(({ finished }) => { if (finished) setVisible(false); });
    };
    const show = () => {
      expiresAt = Date.now() + VISIBLE_MS;
      setIndex(nextInsight.current % insights.length);
      nextInsight.current += 1;
      setVisible(true);
      reveal.stopAnimation();
      reveal.setValue(reducedRef.current ? 1 : 0);
      if (!reducedRef.current) {
        Animated.timing(reveal, {
          toValue: 1, duration: 220, easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web', isInteraction: false,
        }).start();
      }
      // Entrance and exit both fit inside the three-second visibility window.
      exitTimer = setTimeout(() => {
        if (reducedRef.current) return;
        Animated.timing(reveal, {
          toValue: 0, duration: EXIT_MS, easing: Easing.in(Easing.quad),
          useNativeDriver: Platform.OS !== 'web', isInteraction: false,
        }).start();
      }, VISIBLE_MS - EXIT_MS);
      hideTimer = setTimeout(() => {
        reveal.stopAnimation();
        reveal.setValue(0);
        setVisible(false);
      }, VISIBLE_MS);
    };
    show();
    const cycleTimer = setInterval(show, CYCLE_MS);
    return () => {
      clearInterval(cycleTimer);
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
      reveal.stopAnimation();
      reveal.setValue(0);
      dismiss.current = () => {};
    };
  }, [foreground, insights.length, reveal]);

  if (!insights.length) return null;
  const insight = insights[index % insights.length];

  return <Animated.View
    pointerEvents={visible ? 'box-none' : 'none'}
    accessibilityElementsHidden={!visible}
    importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
    style={[styles.overlay, { bottom, opacity: reveal }]}
    onLayout={event => onHeightChange(event.nativeEvent.layout.height)}
  >
    <LinearGradient
      pointerEvents="none"
      colors={['rgba(24,24,24,0)', 'rgba(24,24,24,0.75)', 'rgba(24,24,24,0.98)']}
      locations={[0, 0.55, 1]}
      style={StyleSheet.absoluteFill}
    />
    <Animated.View style={[styles.toast, { transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
      <MotionPressable
        accessibilityRole="button"
        accessibilityLabel={`Aurelia AI: ${insight.title}. ${insight.detail}`}
        accessibilityHint="Opens AI chat with this question ready to send"
        disabled={!visible}
        onPress={() => onOpen(insight.prompt)}
        style={styles.content}
      >
        <Image source={require('../assets/aurelia-logo.png')} style={styles.logo} />
        <View style={styles.copy}>
          <Text style={styles.title}>{insight.title}</Text>
          <Text style={styles.detail}>{insight.detail}</Text>
        </View>
      </MotionPressable>
      <MotionPressable accessibilityRole="button" accessibilityLabel="Dismiss AI notification" disabled={!visible} onPress={() => dismiss.current()} hitSlop={5} style={styles.close}>
        <X size={13} color={WHITE[64]} strokeWidth={1.8} />
      </MotionPressable>
    </Animated.View>
  </Animated.View>;
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', left: 0, right: 0, paddingTop: 30, paddingHorizontal: 12, paddingBottom: 12, zIndex: 3 },
  toast: { borderRadius: 20, backgroundColor: '#292929', borderWidth: 1, borderColor: WHITE[12], shadowColor: '#000', shadowOpacity: 0.38, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingLeft: 14, paddingRight: 38, paddingVertical: 13, minHeight: 76, borderRadius: 20 },
  close: { position: 'absolute', right: 7, top: 7, width: 24, height: 24, borderRadius: 12, backgroundColor: WHITE[12], alignItems: 'center', justifyContent: 'center' },
  logo: { width: 36, height: 36 },
  copy: { flex: 1, gap: 4 },
  title: { color: '#fff', fontSize: 14, lineHeight: 19, fontWeight: '500' },
  detail: { color: WHITE[64], fontSize: 12, lineHeight: 17 },
});
