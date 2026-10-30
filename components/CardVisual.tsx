import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { CARD_THEMES, type CardTheme } from './cards';

export function CardVisual({ width, theme = 'violet', title = 'Junior Card', owner, number, expiry }: {
  width: number; theme?: CardTheme; title?: string; owner: string; number: string; expiry: string;
}) {
  return <LinearGradient colors={CARD_THEMES[theme]} locations={[0, 0.4, 0.65, 0.82, 1]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={[s.card, { width }]}>
    <View style={s.row}><Text selectable={false} style={s.name}>{title}</Text><View style={s.mastercard}><View style={[s.disc, { backgroundColor: '#EB001B' }]} /><View style={[s.disc, { backgroundColor: '#FFAA00', marginLeft: -9, opacity: 0.95 }]} /></View></View>
    <View style={s.chip}><View style={s.chipHorizontal} /><View style={s.chipVertical} /></View>
    <Text selectable={false} numberOfLines={1} adjustsFontSizeToFit style={[s.number, { fontSize: Math.min(20, (width - 36) * 0.071) }]}>{number}</Text>
    <View style={s.row}><Text selectable={false} numberOfLines={1} style={s.owner}>{owner || 'Name on card'}</Text><Text selectable={false} style={s.expiry}>{expiry || 'MM/YY'}</Text></View>
  </LinearGradient>;
}
const s = StyleSheet.create({
  card: { aspectRatio: 1.56, borderRadius: 22, padding: 19, justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  name: { color: '#fff', fontSize: 14, fontWeight: '600' },
  mastercard: { flexDirection: 'row' },
  disc: { width: 24, height: 24, borderRadius: 12 },
  chip: { width: 35, height: 27, borderRadius: 5, backgroundColor: '#D5B568', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 0.5, borderColor: '#8D753D' },
  chipHorizontal: { position: 'absolute', width: '100%', height: 11, borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#8D753D' },
  chipVertical: { width: 14, height: '100%', borderLeftWidth: 0.5, borderRightWidth: 0.5, borderColor: '#8D753D', borderRadius: 4 },
  number: { color: '#fff', fontWeight: '500' },
  owner: { flex: 1, color: '#fff', fontSize: 11 },
  expiry: { color: '#fff', fontSize: 11 },
});
