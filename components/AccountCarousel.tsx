import { useRef, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function AccountCarousel({ children }: { children: ReactNode }) {
  const measurements = useRef({ offset: 0, content: 0, viewport: 0 });
  const [edges, setEdges] = useState({ left: false, right: false });

  const updateEdges = () => {
    const { offset, content, viewport } = measurements.current;
    const overflow = Math.max(0, content - viewport);
    const left = overflow > 1 && offset > 1;
    const right = viewport > 0 && overflow - offset > 1;
    setEdges(current => current.left === left && current.right === right ? current : { left, right });
  };

  return <View style={styles.viewport}>
    <ScrollView
      horizontal
      bounces={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      scrollEventThrottle={16}
      onLayout={event => {
        measurements.current.viewport = event.nativeEvent.layout.width;
        updateEdges();
      }}
      onContentSizeChange={width => {
        measurements.current.content = width;
        updateEdges();
      }}
      onScroll={event => {
        measurements.current.offset = event.nativeEvent.contentOffset.x;
        updateEdges();
      }}
    >{children}</ScrollView>
    {edges.left && <LinearGradient pointerEvents="none" colors={['#262626', 'rgba(38,38,38,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.fade, styles.left]} />}
    {edges.right && <LinearGradient pointerEvents="none" colors={['rgba(38,38,38,0)', '#262626']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.fade, styles.right]} />}
  </View>;
}

const styles = StyleSheet.create({
  // Move the panel gutter into the scrolling content, letting cards reach either edge.
  viewport: { marginHorizontal: -19, marginTop: 14, overflow: 'hidden' },
  content: { gap: 12, paddingHorizontal: 19 },
  fade: { position: 'absolute', top: 0, bottom: 0, width: 28 },
  left: { left: 0 },
  right: { right: 0 },
});
