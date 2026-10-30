import { useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CardVisual } from './CardVisual';
import { CARD_THEMES, digitsOnly, formatCardNumber, formatExpiry, validCardNumber, validExpiry, type CardTheme, type WalletCard } from './cards';
import { Check, Plus } from './icons';
import { MotionPressable as Pressable, MotionView } from './Motion';
import { GOLD_GRADIENT, GOLD_STOPS, WHITE } from './theme';

type Errors = Partial<Record<'owner' | 'number' | 'cvc' | 'expiry', string>>;
export function AddCard({ onSave }: { onSave: (card: WalletCard) => void }) {
  const { width } = useWindowDimensions();
  const [theme, setTheme] = useState<CardTheme>('violet');
  const [owner, setOwner] = useState('Aurelia Kaizer');
  const [number, setNumber] = useState('');
  const [cvc, setCvc] = useState('');
  const [expiry, setExpiry] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const inputs = useRef<Partial<Record<keyof Errors, ComponentRef<typeof TextInput> | null>>>({});
  const clearError = (field: keyof Errors) => setErrors(current => ({ ...current, [field]: undefined }));
  const save = () => {
    const nextErrors: Errors = {};
    if (owner.trim().length < 2) nextErrors.owner = 'Enter the name on your card.';
    if (!validCardNumber(number)) nextErrors.number = 'Enter a valid card number.';
    if (!/^\d{3,4}$/.test(cvc)) nextErrors.cvc = 'Enter 3 or 4 digits.';
    if (!validExpiry(expiry)) nextErrors.expiry = 'Enter a valid future date.';
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0] as keyof Errors | undefined;
    if (firstError) { inputs.current[firstError]?.focus(); return; }
    // Only the display details are retained in the local prototype; never retain the CVC or full number.
    onSave({ id: `card-${Date.now()}`, title: 'Personal Card', owner: owner.trim(), last4: digitsOnly(number).slice(-4), expiry, theme, balance: 0, isDefault });
  };
  const field = (key: keyof Errors, label: string, value: string, update: (value: string) => void, placeholder: string, maxLength: number, secure = false) => <View style={s.field}>
    <Text style={s.label}>{label}</Text>
    <TextInput ref={input => { inputs.current[key] = input; }} accessibilityLabel={label} value={value} onChangeText={text => { update(text); clearError(key); }} placeholder={placeholder} placeholderTextColor={WHITE[48]} keyboardType={key === 'owner' ? 'default' : 'number-pad'} autoCapitalize={key === 'owner' ? 'words' : 'none'} autoCorrect={false} maxLength={maxLength} secureTextEntry={secure} style={[s.input, errors[key] && s.inputError]} />
    {errors[key] && <Text accessibilityRole="alert" style={s.error}>{errors[key]}</Text>}
  </View>;

  return <KeyboardAvoidingView style={s.panel} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={s.heading}>Add new card</Text>
      <MotionView motionKey={theme} distance={0} fromScale={0.98} duration={220} style={s.preview}>
        <CardVisual width={Math.min(300, width - 88)} theme={theme} owner={owner} number={number || '••••  ••••  ••••  ••••'} expiry={expiry} />
      </MotionView>
      <View style={s.swatches}>{(Object.keys(CARD_THEMES) as CardTheme[]).map(color => <Pressable key={color} accessibilityRole="button" accessibilityLabel={`${color} card color`} accessibilityState={{ selected: theme === color }} onPress={() => setTheme(color)} style={[s.swatchTarget, theme === color && s.selectedSwatch]}><LinearGradient colors={[CARD_THEMES[color][3], CARD_THEMES[color][1]]} style={s.swatch} /></Pressable>)}</View>
      {field('owner', 'Name on card', owner, setOwner, 'Aurelia Kaizer', 60)}
      {field('number', 'Card number', number, value => setNumber(formatCardNumber(value)), '2375 6482 0397 3434', 23)}
      <View style={s.fieldRow}>
        <View style={s.half}>{field('cvc', 'CVC', cvc, value => setCvc(digitsOnly(value).slice(0, 4)), '234', 4, true)}</View>
        <View style={s.half}>{field('expiry', 'Expiration date', expiry, value => setExpiry(formatExpiry(value)), 'MM/YY', 5)}</View>
      </View>
      <Pressable accessibilityRole="checkbox" accessibilityLabel="Set this card as my default payment method" accessibilityState={{ checked: isDefault }} onPress={() => setIsDefault(value => !value)} style={s.defaultRow}>
        <View style={[s.checkbox, isDefault && s.checked]}>{isDefault && <Check size={13} color="#111" strokeWidth={2} />}</View>
        <Text style={s.defaultText}>Set this card as my default payment method for future transactions.</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Add new card" onPress={save} style={s.addButton}>
        <LinearGradient colors={GOLD_GRADIENT} locations={GOLD_STOPS} style={StyleSheet.absoluteFill} />
        <Plus size={18} color="#111" /><Text style={s.addText}>Add new card</Text>
      </Pressable>
    </ScrollView>
  </KeyboardAvoidingView>;
}
const s = StyleSheet.create({
  panel: { flex: 1, marginTop: 8, borderTopLeftRadius: 32, borderTopRightRadius: 32, borderWidth: 1, borderBottomWidth: 0, borderColor: WHITE[24], overflow: 'hidden' },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 },
  heading: { fontFamily: 'InstrumentSerif', color: '#fff', fontSize: 34, lineHeight: 42, marginBottom: 24 },
  preview: { alignItems: 'center' },
  swatches: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, marginBottom: 24 },
  swatchTarget: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  selectedSwatch: { borderColor: WHITE[64] },
  swatch: { width: 20, height: 20, borderRadius: 10 },
  field: { marginBottom: 20 },
  label: { color: WHITE[64], fontSize: 13, marginBottom: 5 },
  input: { color: '#fff', fontSize: 14, minHeight: 28, paddingHorizontal: 4, paddingBottom: 8, paddingTop: 0, borderBottomWidth: 1.5, borderBottomColor: WHITE[48] },
  inputError: { borderBottomColor: '#F09180' },
  error: { color: '#F09180', fontSize: 12, lineHeight: 17, marginTop: 5 },
  fieldRow: { flexDirection: 'row', gap: 24 },
  half: { flex: 1 },
  defaultRow: { flexDirection: 'row', gap: 9, marginTop: 6, marginBottom: 30, paddingHorizontal: 7 },
  checkbox: { width: 16, height: 16, borderRadius: 4, borderWidth: 1, borderColor: WHITE[64], alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checked: { backgroundColor: '#FFD345', borderColor: '#FFD345' },
  defaultText: { flex: 1, color: '#fff', fontSize: 14, lineHeight: 19 },
  addButton: { marginTop: 'auto', minHeight: 42, borderRadius: 12, overflow: 'hidden', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  addText: { color: '#111', fontSize: 15, fontWeight: '600' },
});
