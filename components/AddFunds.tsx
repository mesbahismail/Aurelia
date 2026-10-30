import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, CreditCard, Landmark, ScanQrCode, UserRound } from './icons';
import { MotionView, MotionPressable } from './Motion';
import { GOLD, WHITE } from './theme';

const fundingOptions = [
  { title: 'Link bank', Icon: Landmark },
  { title: 'Request funds', Icon: UserRound },
  { title: 'Add new card', Icon: CreditCard },
  { title: 'Scan a QR code', Icon: ScanQrCode },
];

export function AddFunds({ onAddCard }: { onAddCard: () => void }) {
  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <MotionView duration={400} distance={12}>
      <Text style={styles.heading}>It’s always good to have more money on you.</Text>
      <View style={styles.accent} />
    </MotionView>
    {fundingOptions.map(({ title, Icon }, index) => (
      <MotionView key={title} delay={70 + index * 50} distance={10} style={styles.row}>
        <MotionPressable accessibilityRole={title === 'Add new card' ? 'button' : undefined} accessibilityLabel={title} onPress={title === 'Add new card' ? onAddCard : undefined} style={styles.option}>
        <View style={styles.iconTile}><Icon size={21} color={WHITE[64]} strokeWidth={1.8} /></View>
        <View style={[styles.copy, index < fundingOptions.length - 1 && styles.divider]}>
          <View style={styles.labels}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>Increase more to your wealth</Text>
          </View>
          <ChevronRight size={17} color={WHITE[64]} strokeWidth={1.8} />
        </View>
        </MotionPressable>
      </MotionView>
    ))}
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 },
  heading: { fontFamily: 'InstrumentSerif', fontSize: 32, lineHeight: 40, color: '#fff' },
  accent: { width: 32, height: 5, backgroundColor: GOLD, marginTop: 18, marginBottom: 21 },
  row: { minHeight: 82 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 82 },
  iconTile: { width: 48, height: 48, borderRadius: 13, borderWidth: 1.5, borderColor: WHITE[24], backgroundColor: '#242424', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 8, shadowOffset: { width: 0, height: 5 } },
  copy: { flex: 1, minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 4, paddingRight: 7, paddingVertical: 18 },
  divider: { borderBottomWidth: 1, borderBottomColor: WHITE[24] },
  labels: { flex: 1, gap: 4 },
  title: { color: '#fff', fontSize: 16, lineHeight: 21, letterSpacing: 0.2 },
  subtitle: { color: WHITE[64], fontSize: 12, lineHeight: 17, letterSpacing: 0.2 },
});
