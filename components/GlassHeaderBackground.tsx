import { useEffect, useRef, type RefObject, type ComponentRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useReducedMotion } from './Motion';
import { WHITE } from './theme';

export function GlassHeaderBackground({ active, blurTarget }: { active: boolean; blurTarget?: RefObject<ComponentRef<typeof View> | null> }) {
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    opacity.stopAnimation();
    if (reduced) { opacity.setValue(active ? 1 : 0); return; }
    const animation = Animated.timing(opacity, {
      toValue: active ? 1 : 0, duration: 220, easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web', isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [active, reduced, opacity]);

  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.shadow, { opacity }]}>
    <View style={styles.glass}>
      <BlurView
        tint="dark" intensity={65} style={StyleSheet.absoluteFill}
        {...(Platform.OS === 'android' ? { blurTarget, blurMethod: 'dimezisBlurViewSdk31Plus' as const } : {})}
      />
      <LinearGradient colors={['rgba(255,255,255,0.07)', 'rgba(26,26,26,0.24)']} style={StyleSheet.absoluteFill} />
    </View>
  </Animated.View>;
}

const styles = StyleSheet.create({
  shadow: { borderRadius: 999, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  glass: { flex: 1, borderRadius: 999, overflow: 'hidden', borderWidth: 1, borderColor: WHITE[12], borderBottomColor: WHITE[24], borderBottomWidth: 1.5 },
});
