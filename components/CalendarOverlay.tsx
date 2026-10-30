import { useEffect, useRef, useState, type ComponentRef, type RefObject } from 'react';
import { Animated, Easing, Modal, Platform, Pressable as BackdropPressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BlurTargetView, BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarDays, Check, ChevronLeft, ChevronRight, X } from './icons';
import { GOLD, GOLD_GRADIENT, GOLD_STOPS, WHITE } from './theme';
import { MotionView, MotionPressable as Pressable, useReducedMotion } from './Motion';
import { formatRange, monthDays, orderedRange, presetRange, sameDay, shiftMonth, startOfDay, startOfMonth, type DatePreset, type DateRange } from './dateRanges';

const presets = [
  ['custom', 'Custom'], ['today', 'Today'], ['lastWeek', 'Last week'], ['lastMonth', 'Last month'],
] as const;

export function CalendarOverlay({ visible, range, onApply, onClose, blurTarget }: {
  visible: boolean;
  range: DateRange;
  onApply: (range: DateRange) => void;
  onClose: () => void;
  blurTarget?: RefObject<ComponentRef<typeof View> | null>;
}) {
  const [month, setMonth] = useState(() => startOfMonth(range.start));
  const [draftStart, setDraftStart] = useState(range.start);
  const [draftEnd, setDraftEnd] = useState<Date | null>(range.end);
  const [preset, setPreset] = useState<DatePreset>('custom');
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const sheetHeight = Math.min(height - insets.top - 12, height * 0.86);
  const [mounted, setMounted] = useState(visible);
  const reveal = useRef(new Animated.Value(0)).current;
  const calendarTarget = useRef<ComponentRef<typeof View>>(null);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const startTime = range.start.getTime(), endTime = range.end.getTime();

  useEffect(() => {
    if (!visible) return;
    const start = startOfDay(new Date(startTime));
    const end = startOfDay(new Date(endTime));
    setDraftStart(start);
    setDraftEnd(end);
    setMonth(startOfMonth(start));
    const matchingPreset = presets.find(([key]) => {
      if (key === 'custom') return false;
      const candidate = presetRange(key);
      return sameDay(start, candidate.start) && sameDay(end, candidate.end);
    });
    setPreset(matchingPreset?.[0] ?? 'custom');
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [visible, startTime, endTime]);

  useEffect(() => {
    reveal.stopAnimation();
    if (reduced) {
      reveal.setValue(visible ? 1 : 0);
      setMounted(visible);
      return;
    }
    if (visible) setMounted(true);
    const animation = Animated.timing(reveal, {
      toValue: visible ? 1 : 0, duration: visible ? 320 : 220,
      easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web', isInteraction: false,
    });
    animation.start(({ finished }) => { if (finished && !visible) setMounted(false); });
    return () => animation.stop();
  }, [visible, reduced, reveal]);

  const chooseDay = (date: Date) => {
    setPreset('custom');
    if (draftEnd) {
      setDraftStart(startOfDay(date));
      setDraftEnd(null);
    } else {
      const selection = orderedRange(draftStart, date);
      setDraftStart(selection.start);
      setDraftEnd(selection.end);
    }
  };
  const choosePreset = (key: DatePreset) => {
    setPreset(key);
    if (key === 'custom') return;
    const selection = presetRange(key);
    setDraftStart(selection.start);
    setDraftEnd(selection.end);
    setMonth(startOfMonth(selection.start));
    scroll.current?.scrollTo({ y: 0, animated: !reduced });
  };
  const navigateMonth = (direction: number) => {
    setMonth(current => shiftMonth(current, direction));
    scroll.current?.scrollTo({ y: 0, animated: !reduced });
  };
  const draft = orderedRange(draftStart, draftEnd ?? draftStart);
  const today = startOfDay(new Date());

  if (!mounted) return null;
  return <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
    <View style={s.backdrop}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: reveal }]}>
        <BlurView tint="dark" intensity={24} style={StyleSheet.absoluteFill} {...(Platform.OS === 'android' ? { blurTarget, blurMethod: 'dimezisBlurViewSdk31Plus' as const } : {})} />
        <View style={[StyleSheet.absoluteFill, s.dim]} />
      </Animated.View>
      <BackdropPressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Dismiss date picker without applying" onPress={onClose} />
      <Animated.View style={[s.sheet, { height: sheetHeight, transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [sheetHeight, 0] }) }] }]} accessibilityViewIsModal>
        <View style={s.handleArea}><View style={s.handle} /></View>
        <View style={s.heading}>
          <Text accessibilityRole="header" style={s.title}>Date picker</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close date picker" onPress={onClose} hitSlop={8} style={s.close}><X size={18} color={WHITE[64]} /></Pressable>
        </View>
        <View style={s.tabs}>
          {presets.map(([key, label]) => <Pressable key={key} accessibilityRole="tab" accessibilityState={{ selected: preset === key }} onPress={() => choosePreset(key)} style={[s.tab, preset === key && s.activeTab]}><Text style={[s.tabText, preset === key && s.activeTabText]}>{label}</Text></Pressable>)}
        </View>
        <BlurTargetView ref={calendarTarget} style={s.calendarBody}>
          <ScrollView ref={scroll} showsVerticalScrollIndicator={false} contentContainerStyle={[s.months, { paddingBottom: insets.bottom + 100 }]}>
            {[month, shiftMonth(month, 1)].map(displayMonth => <MotionView key={displayMonth.getTime()} duration={200} distance={5} style={s.monthBlock}>
              <View style={s.monthHeading}>
                <Pressable accessibilityRole="button" accessibilityLabel={`Previous month from ${displayMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`} style={s.monthControl} onPress={() => navigateMonth(-1)}><ChevronLeft size={19} color={WHITE[64]} /></Pressable>
                <Text accessibilityRole="header" style={s.monthName}>{displayMonth.toLocaleDateString('en-GB', { month: 'long' })} <Text style={s.year}>{displayMonth.getFullYear()}</Text></Text>
                <Pressable accessibilityRole="button" accessibilityLabel={`Next month from ${displayMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`} style={s.monthControl} onPress={() => navigateMonth(1)}><ChevronRight size={19} color={WHITE[64]} /></Pressable>
              </View>
              <View style={s.grid}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => <View key={`weekday-${i}`} style={s.cell}><Text style={s.weekday}>{day}</Text></View>)}
                {monthDays(displayMonth).map(date => {
                  const endpoint = sameDay(date, draftStart) || (draftEnd !== null && sameDay(date, draftEnd));
                  const inside = date >= draft.start && date <= draft.end;
                  const outsideMonth = date.getMonth() !== displayMonth.getMonth();
                  return <Pressable key={date.getTime()} accessibilityRole="button" accessibilityLabel={date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} accessibilityHint={draftEnd ? 'Choose the start of a new range' : 'Choose the end of the range'} accessibilityState={{ selected: inside }} style={s.cell} onPress={() => chooseDay(date)}>
                    <View style={[s.day, sameDay(date, today) && !inside && s.today, inside && s.inRange, endpoint && s.endpoint]}>
                      <Text style={[s.number, outsideMonth && s.mutedNumber, inside && s.rangeNumber, endpoint && s.endpointNumber]}>{date.getDate()}</Text>
                    </View>
                  </Pressable>;
                })}
              </View>
            </MotionView>)}
          </ScrollView>
        </BlurTargetView>
        <View style={[s.applyBar, { bottom: insets.bottom + 18 }]}>
          <BlurView tint="dark" intensity={45} style={StyleSheet.absoluteFill} {...(Platform.OS === 'android' ? { blurTarget: calendarTarget, blurMethod: 'dimezisBlurViewSdk31Plus' as const } : {})} />
          <CalendarDays size={19} color={WHITE[64]} />
          <Text style={s.rangeText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} accessibilityLabel={`Selected range: ${draft.start.toDateString()} to ${draft.end.toDateString()}`}>{formatRange(draft)}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Apply date range" onPress={() => { onApply(draft); onClose(); }} style={s.applyButton}>
            <LinearGradient colors={GOLD_GRADIENT} locations={GOLD_STOPS} style={StyleSheet.absoluteFill} />
            <Check size={15} color="#111" strokeWidth={1.8} /><Text style={s.applyText}>Apply</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  </Modal>;
}

const s = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  dim: { backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { width: '100%', maxWidth: 440, backgroundColor: '#191919', borderTopLeftRadius: 32, borderTopRightRadius: 32, borderWidth: 1.5, borderBottomWidth: 0, borderColor: WHITE[24], overflow: 'hidden' },
  handleArea: { height: 22, alignItems: 'center', paddingTop: 6 },
  handle: { width: 36, height: 5, borderRadius: 3, backgroundColor: WHITE[24] },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 6, paddingBottom: 28 },
  title: { color: '#fff', fontFamily: 'InstrumentSerif', fontSize: 32, lineHeight: 40 },
  close: { width: 32, height: 32, borderRadius: 10, borderWidth: 1, borderColor: WHITE[24], backgroundColor: '#242424', alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: WHITE[12], marginHorizontal: 15 },
  tab: { flex: 1, minHeight: 46, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  activeTab: { borderBottomColor: GOLD },
  tabText: { color: WHITE[64], fontSize: 14 },
  activeTabText: { color: '#fff' },
  calendarBody: { flex: 1 },
  months: { paddingHorizontal: 22, paddingTop: 24 },
  monthBlock: { marginBottom: 28 },
  monthHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  monthControl: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  monthName: { color: '#fff', fontSize: 20, lineHeight: 28, fontWeight: '500' },
  year: { color: WHITE[64], fontWeight: '400' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.285714%', height: 42, alignItems: 'center', justifyContent: 'center' },
  weekday: { color: WHITE[64], fontSize: 12 },
  day: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1, borderColor: WHITE[24] },
  inRange: { backgroundColor: 'rgba(255,173,22,0.12)' },
  endpoint: { backgroundColor: GOLD },
  number: { color: '#fff', fontSize: 13 },
  mutedNumber: { color: WHITE[48] },
  rangeNumber: { color: GOLD },
  endpointNumber: { color: '#111', fontWeight: '500' },
  applyBar: { position: 'absolute', left: 16, right: 16, minHeight: 56, borderRadius: 20, borderWidth: 1, borderColor: WHITE[24], backgroundColor: 'rgba(48,48,48,0.65)', overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  rangeText: { flex: 1, color: '#fff', fontSize: 12, fontWeight: '500' },
  applyButton: { minWidth: 83, minHeight: 34, borderRadius: 12, overflow: 'hidden', flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  applyText: { color: '#111', fontSize: 14, fontWeight: '500' },
});
