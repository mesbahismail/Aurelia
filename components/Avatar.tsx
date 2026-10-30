import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DARK_GRADIENT, WHITE } from './theme';

const portraitIndex: Record<string, number> = {
  'Asher Allen': 0, 'Amelia Archer': 1, 'Aaron Adams': 2, 'Ava Anderson': 3,
  'Brandon Cole': 4, 'Emily Johnson': 5, 'Christopher Wilson': 6, 'Charlotte Anderson': 7,
  'Oliver Smith': 8, 'Aurelia Kaiser': 9, 'Aurelia Kaizer': 9, 'Isak Taylor': 10, 'Ava Brown': 11,
};
export function Avatar({ name, size = 60 }: { name: string; size?: number }) {
  const index = portraitIndex[name] ?? [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 12;
  const cell = size - 2;
  return <LinearGradient colors={DARK_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.tile, { width: size, height: size, borderRadius: size * 0.27 }]}>
    <View style={{ width: cell, height: cell, overflow: 'hidden' }}>
      <Image source={require('../assets/recipient-portraits.png')} accessibilityLabel={`${name} avatar`} resizeMode="stretch" style={{ position: 'absolute', width: cell * 4, height: cell * 3, left: -(index % 4) * cell, top: -Math.floor(index / 4) * cell }} />
    </View>
  </LinearGradient>;
}
const s = StyleSheet.create({ tile: { borderWidth: 1, borderColor: WHITE[12], overflow: 'hidden', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } });
