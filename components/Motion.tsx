import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, StyleSheet, type PressableProps, type ViewProps } from 'react-native';
import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient';

const ReducedMotion = createContext(true);
const nativeDriver = Platform.OS !== 'web';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export function MotionProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    let receivedChange = false;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', value => {
      receivedChange = true;
      if (active) setReduced(value);
    });
    AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (active && !receivedChange) setReduced(value);
    }).catch(() => { if (active && !receivedChange) setReduced(true); });
    return () => { active = false; subscription?.remove(); };
  }, []);
  // Resolve the preference before mounting animated content, avoiding a flash or unwanted motion.
  return <ReducedMotion.Provider value={reduced ?? true}>{reduced !== null && children}</ReducedMotion.Provider>;
}

export const useReducedMotion = () => useContext(ReducedMotion);

type Entrance = {
  motionKey?: string | number;
  delay?: number;
  duration?: number;
  distance?: number;
  fromScale?: number;
};

function useEntrance({ motionKey, delay = 0, duration = 380, distance = 12, fromScale = 1 }: Entrance) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    progress.stopAnimation();
    if (reduced) { progress.setValue(1); return; }
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1, duration, delay, easing: Easing.out(Easing.cubic),
      useNativeDriver: nativeDriver, isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, reduced, motionKey, delay, duration]);
  return {
    opacity: progress,
    transform: [
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) },
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [fromScale, 1] }) },
    ],
  };
}

export function MotionView({ motionKey, delay, duration, distance, fromScale, style, ...props }: ViewProps & Entrance) {
  const motion = useEntrance({ motionKey, delay, duration, distance, fromScale });
  return <Animated.View {...props} style={[style, motion]} />;
}

export function MotionGradient({ motionKey, delay, duration, distance, fromScale, style, ...props }: LinearGradientProps & Entrance) {
  const motion = useEntrance({ motionKey, delay, duration, distance, fromScale });
  return <AnimatedGradient {...props} style={[style, motion]} />;
}

/** Animate the control itself so flex sizing, hit targets, and accessibility remain intact. */
export function MotionPressable({ style, children, onPressIn, onPressOut, onHoverIn, onHoverOut, disabled, ...props }: PressableProps) {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    scale.stopAnimation();
    if (reduced || disabled) { scale.setValue(1); return; }
    const animation = Animated.spring(scale, {
      toValue: pressed ? 0.97 : hovered ? 1.015 : 1,
      stiffness: 420, damping: 30, mass: 0.7,
      useNativeDriver: nativeDriver, isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [scale, pressed, hovered, reduced, disabled]);
  const baseStyle = typeof style === 'function' ? style({ pressed }) : style;
  const transform = StyleSheet.flatten(baseStyle)?.transform;
  return <AnimatedPressable {...props} disabled={disabled}
    onPressIn={event => { setPressed(true); onPressIn?.(event); }}
    onPressOut={event => { setPressed(false); onPressOut?.(event); }}
    onHoverIn={event => { setHovered(true); onHoverIn?.(event); }}
    onHoverOut={event => { setHovered(false); onHoverOut?.(event); }}
    style={[baseStyle, { transform: [...(Array.isArray(transform) ? transform : []), { scale }] }]}
  >{typeof children === 'function' ? children({ pressed }) : children}</AnimatedPressable>;
}
