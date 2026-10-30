import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Platform, StyleSheet, View } from 'react-native';
import { CardVisual } from './CardVisual';
import { snapCardIndex, type WalletCard } from './cards';
import { MotionPressable as Pressable, useReducedMotion } from './Motion';
import { GOLD, WHITE } from './theme';

export function CardsCarousel({ cards, index, onSelect }: { cards: WalletCard[]; index: number; onSelect: (index: number) => void }) {
  const [width, setWidth] = useState(390);
  const reduced = useReducedMotion();
  const cardWidth = Math.min(320, width * 0.79);
  const stride = cardWidth + 16;
  const x = useRef(new Animated.Value(-index * stride)).current;
  const latest = useRef({ index, stride, count: cards.length, onSelect, reduced });
  latest.current = { index, stride, count: cards.length, onSelect, reduced };
  const start = useRef(0);
  const settle = (selected: number) => {
    const target = -selected * latest.current.stride;
    x.stopAnimation();
    if (latest.current.reduced) x.setValue(target);
    else Animated.spring(x, { toValue: target, stiffness: 230, damping: 28, mass: 0.85, useNativeDriver: Platform.OS !== 'web' }).start();
  };
  useEffect(() => {
    settle(index);
    return () => x.stopAnimation();
  }, [index, stride, reduced, x]);
  const responder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 6 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.25,
    onPanResponderGrant: () => x.stopAnimation(value => { start.current = value; }),
    onPanResponderMove: (_, gesture) => {
      const min = -(latest.current.count - 1) * latest.current.stride;
      const position = start.current + gesture.dx;
      x.setValue(position > 0 ? position * 0.2 : position < min ? min + (position - min) * 0.2 : position);
    },
    onPanResponderRelease: (_, gesture) => {
      const selected = snapCardIndex(start.current + gesture.dx, gesture.vx, latest.current.stride, latest.current.count);
      latest.current.onSelect(selected);
      settle(selected);
    },
    onPanResponderTerminate: () => settle(latest.current.index),
    onPanResponderTerminationRequest: () => true,
  }), [x]);

  return <View style={s.container} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
    <View {...responder.panHandlers} accessibilityRole="adjustable" accessibilityLabel="Payment cards" accessibilityValue={{ min: 1, max: cards.length, now: index + 1, text: `${cards[index]?.title}, card ${index + 1} of ${cards.length}` }} accessibilityActions={[{ name: 'increment', label: 'Next card' }, { name: 'decrement', label: 'Previous card' }]} onAccessibilityAction={event => onSelect(Math.max(0, Math.min(cards.length - 1, index + (event.nativeEvent.actionName === 'increment' ? 1 : -1))))} style={[s.viewport, { height: cardWidth / 1.56 + 32 }]}>
      <Animated.View style={[s.track, { paddingHorizontal: (width - cardWidth) / 2, transform: [{ translateX: x }] }]}>
        {cards.map((card, i) => <Animated.View key={card.id} style={{ width: cardWidth, marginRight: 16, transform: [{ scale: x.interpolate({ inputRange: [-(i + 1) * stride, -i * stride, -(i - 1) * stride], outputRange: [0.94, 1, 0.94], extrapolate: 'clamp' }) }] }}>
          <CardVisual width={cardWidth} theme={card.theme} title={card.title} owner={card.owner} number={`••••  ••••  ••••  ${card.last4}`} expiry={card.expiry} />
        </Animated.View>)}
      </Animated.View>
    </View>
    <View style={s.controls}>
      <View style={s.dots}>{cards.map((card, i) => <Pressable key={card.id} accessibilityRole="button" accessibilityLabel={`Show ${card.title}, ending ${card.last4}`} accessibilityState={{ selected: index === i }} onPress={() => onSelect(i)} style={s.dotTarget}><View style={[s.dot, index === i && s.activeDot]} /></Pressable>)}</View>
    </View>
  </View>;
}
const s = StyleSheet.create({
  container: { marginHorizontal: -20, marginBottom: 16 },
  viewport: { overflow: 'hidden', justifyContent: 'center' },
  track: { flexDirection: 'row', alignSelf: 'flex-start' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '65%' },
  dotTarget: { width: 24, height: 32, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: WHITE[24] },
  activeDot: { backgroundColor: GOLD, width: 20 },
});
