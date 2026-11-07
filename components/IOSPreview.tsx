import { useEffect, useState, type ReactNode } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';

const TOP = 54;
const BOTTOM = 34;

export function PreviewSafeArea({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  if (Platform.OS !== 'web') return children;
  return <SafeAreaInsetsContext.Provider value={{ ...insets, top: Math.max(TOP, insets.top), bottom: Math.max(BOTTOM, insets.bottom) }}>
    {children}
  </SafeAreaInsetsContext.Provider>;
}

// Browser-only decoration. Native iOS draws its own status bar and home indicator.
export function IOSPreviewBars({ dark = false }: { dark?: boolean }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (Platform.OS !== 'web') return null;
  const color = dark ? '#171717' : '#fff';
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?[AP]M$/, '');
  return <View pointerEvents="none" aria-hidden style={[StyleSheet.absoluteFill, s.overlay]}>
    <View style={s.status}>
      <Text style={[s.time, { color }]}>{time}</Text>
      <View style={s.icons}>
        <Svg width={19} height={14} viewBox="0 0 19 14" fill={color}>
          <Rect x={0} y={9} width={3} height={5} rx={0.8} />
          <Rect x={5} y={6} width={3} height={8} rx={0.8} />
          <Rect x={10} y={3} width={3} height={11} rx={0.8} />
          <Rect x={15} y={0} width={3} height={14} rx={0.8} />
        </Svg>
        <Svg width={18} height={14} viewBox="0 0 18 14" fill="none" stroke={color} strokeWidth={2.3} strokeLinecap="round">
          <Path d="M1.5 3.5a11.7 11.7 0 0 1 15 0M4.3 6.6a7.4 7.4 0 0 1 9.4 0M7.1 9.7a3 3 0 0 1 3.8 0" />
          <Path d="M9 12.5h0" strokeWidth={2.8} />
        </Svg>
        <Svg width={27} height={14} viewBox="0 0 27 14">
          <Rect x={0.5} y={0.5} width={23} height={13} rx={4} fill="none" stroke={color} strokeOpacity={0.45} />
          <Rect x={2.5} y={2.5} width={19} height={9} rx={2} fill={color} />
          <Path d="M25 4.5v5c2-0.5 2-4.5 0-5" fill={color} opacity={0.45} />
        </Svg>
      </View>
    </View>
    <View style={s.bottom}><View style={[s.home, { backgroundColor: color }]} /></View>
  </View>;
}

const s = StyleSheet.create({
  overlay: { zIndex: 100, justifyContent: 'space-between' },
  status: { height: TOP, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 28 },
  time: { fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },
  icons: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  bottom: { height: BOTTOM, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8 },
  home: { width: 134, height: 5, borderRadius: 3 },
});
