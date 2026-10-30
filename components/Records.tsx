import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { ArrowDown, ArrowUp, ReceiptText } from './icons';
import { MotionPressable as Pressable, MotionView } from './Motion';
import { GOLD, WHITE } from './theme';
import { sameDay, type DateRange } from './dateRanges';
import { demoRecords, groupRecords, recordAmount } from './transactionRecords';

export function Records({ bottomSpace, onScroll, range, onClearRange }: {
  bottomSpace: number;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  range: DateRange | null;
  onClearRange: () => void;
}) {
  const records = useMemo(() => demoRecords(), []);
  const groups = useMemo(() => groupRecords(records, range), [records, range]);
  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const dateLabel = (date: Date) => `${sameDay(date, today) ? 'Today, ' : sameDay(date, yesterday) ? 'Yesterday, ' : ''}${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  return <ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, { paddingBottom: bottomSpace }]}>
    {range && <View style={s.filterRow}>
      <Text style={s.date}>{groups.reduce((total, group) => total + group.records.length, 0)} records</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Show all records" onPress={onClearRange} style={s.clear}><Text style={s.clearText}>All dates</Text></Pressable>
    </View>}
    {groups.map((group, groupIndex) => <MotionView key={group.date.getTime()} delay={groupIndex * 50} distance={8} style={s.group}>
      <Text accessibilityRole="header" style={s.dateHeading}>{dateLabel(group.date)}</Text>
      {group.records.map(record => {
        const incoming = record.amount >= 0;
        const Icon = incoming ? ArrowUp : ArrowDown;
        const color = incoming ? '#59BD57' : '#F15B55';
        return <View key={record.id} style={s.row} accessible accessibilityLabel={`${record.title}, ${incoming ? 'received' : 'spent'} ${Math.abs(record.amount).toLocaleString('en-US')} dollars, ${record.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}>
          <View style={[s.icon, incoming ? s.incoming : s.outgoing]}><Icon size={23} color={color} strokeWidth={1.7} /></View>
          <View style={s.details}>
            <View style={s.copy}><Text style={s.name}>{record.title}</Text><Text style={s.time}>{record.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</Text></View>
            <Text style={s.amount}>{recordAmount(record.amount)}</Text>
          </View>
        </View>;
      })}
    </MotionView>)}
    {!groups.length && <View style={s.empty}>
      <ReceiptText size={34} color={WHITE[48]} strokeWidth={1.5} />
      <Text style={s.emptyTitle}>No records for these dates</Text>
      <Text style={s.date}>Choose another range to see your activity.</Text>
    </View>}
  </ScrollView>;
}
const s = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 88 },
  group: { marginBottom: 20 },
  dateHeading: { color: WHITE[64], fontSize: 12, lineHeight: 18, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: WHITE[24] },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  icon: { width: 36, height: 36, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  incoming: { backgroundColor: 'rgba(64,145,60,0.16)', borderColor: 'rgba(89,189,87,0.35)' },
  outgoing: { backgroundColor: 'rgba(178,51,44,0.16)', borderColor: 'rgba(241,91,85,0.35)' },
  details: { flex: 1, minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: WHITE[12] },
  copy: { flex: 1, gap: 4 },
  name: { color: '#fff', fontSize: 15, lineHeight: 20 },
  time: { color: WHITE[48], fontSize: 11, lineHeight: 15 },
  amount: { color: '#fff', fontSize: 15, lineHeight: 20, fontVariant: ['tabular-nums'] },
  filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  date: { color: WHITE[64], fontSize: 12, lineHeight: 18 },
  clear: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 8 },
  clearText: { color: GOLD, fontSize: 12 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingVertical: 80 },
  emptyTitle: { color: '#fff', fontSize: 17 },
});
