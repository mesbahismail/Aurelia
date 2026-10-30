import { Fragment as ReactFragment, useId, useRef, useState, type ComponentRef } from 'react';
import { Platform, Text, StyleSheet, View } from 'react-native';
import { BlurTargetView, BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, Stop, Path, Line, Text as SvgText, Circle } from 'react-native-svg';
import { GOLD, WHITE } from './theme';
import { MotionView } from './Motion';

export const EXPENSES = [
  { label: 'Bills & Debt', value: 24, color: '#FFAA19' },
  { label: 'Food & Dining', value: 27, color: '#C36313' },
  { label: 'Shopping', value: 28, color: '#A33D12' },
  { label: 'Transport', value: 21, color: '#FFF685' },
];

function polar(angle: number, radius: number) {
  const radians = angle * Math.PI / 180;
  return [80 + Math.cos(radians) * radius, 80 + Math.sin(radians) * radius];
}
function segment(start: number, end: number) {
  const a = polar(start, 63), b = polar(end, 63);
  return `M ${a[0]} ${a[1]} A 63 63 0 ${end - start > 180 ? 1 : 0} 1 ${b[0]} ${b[1]}`;
}
export function ExpenseDonut() {
  let angle = -90;
  return <MotionView delay={140} duration={600} distance={0} fromScale={0.9} style={chartStyles.donut} accessible accessibilityLabel="Expenses: bills and debt 24%, food and dining 27%, shopping 28%, transport 21%">
    <Svg width="100%" height="100%" viewBox="0 0 160 160">
      {EXPENSES.map(({ value, color, label }) => {
        const start = angle + 2.5;
        angle += value / 100 * 360;
        return <Path key={label} d={segment(start, angle - 2.5)} fill="none" stroke={color} strokeWidth={28} strokeLinecap="butt" />;
      })}
    </Svg>
  </MotionView>;
}

const trend = [4,5,6,5.75,7.25,7.75,8.25,7.25,8.5,9,9.25,11,11.5,9.75,11,11.25,10.25,9.75,10.75,10.25,10.1,10];
const monthNames = ['Feb', 'Mar', 'Apr', 'May', 'Jun'];
export function TrendChart({ activity = false }: { activity?: boolean }) {
  const chartTarget = useRef<ComponentRef<typeof View>>(null);
  const [selected, setSelected] = useState<{ series: number; index: number } | null>(null);
  const series = [
    { label: 'Earnings', color: '#FFF48C', values: [80, 61, 70, 31, 61, 81, 104, 126], amounts: [7600, 9700, 8700, 12262, 9700, 7500, 4900, 2500] },
    { label: 'Expenses', color: '#DE8619', values: [120, 90, 99, 65, 50, 47, 39, 69], amounts: [3100, 6500, 5500, 9300, 10900, 11300, 12200, 10262] },
  ];
  const selectedPoint = selected && series[selected.series];
  const id = useId().replace(/:/g, '');
  const bottom = activity ? 148 : 172;
  const left = activity ? 0 : 38;
  const width = 328 - left;
  const points = trend.map((value, i) => [left + i / (trend.length - 1) * width, bottom - value / 15 * (bottom - 14)]);
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');
  const area = `${line} L 328 ${bottom} L ${left} ${bottom} Z`;
  return <MotionView delay={90} duration={450} distance={8} style={activity ? chartStyles.activity : chartStyles.trend} accessible accessibilityLabel={activity ? 'Activity chart: earnings $12,262 and expenses $10,262' : 'Spending trend from February to June, rising from $4,000 to $10,000'}>
    <BlurTargetView ref={chartTarget} style={StyleSheet.absoluteFill}>
    <Svg width="100%" height="100%" viewBox={`0 0 328 ${activity ? 148 : 202}`}>
      <Defs>
        <LinearGradient id={`${id}gold`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={activity ? '#FFF48C' : GOLD} stopOpacity={activity ? 0.78 : 0.2} />
          <Stop offset="1" stopColor="#D78B25" stopOpacity={activity ? 0.58 : 0.03} />
        </LinearGradient>
        <LinearGradient id={`${id}orange`} x1="0" y1="0" x2="0" y2="1"><Stop stopColor="#DE8619" stopOpacity={0.8} /><Stop offset="1" stopColor="#87451C" stopOpacity={0.62} /></LinearGradient>
      </Defs>
      {Array.from({ length: activity ? 8 : 5 }, (_, i) => {
        const x = left + i / (activity ? 7 : 4) * width;
        return <Line key={i} x1={x} y1={5} x2={x} y2={bottom} stroke={WHITE[12]} strokeWidth={1} />;
      })}
      {activity ? <>
        <Path d="M 0 120 L 48 90 L 94 99 L 141 65 L 187 50 L 234 47 L 281 39 L 328 69 L 328 148 L 0 148 Z" fill={`url(#${id}orange)`} />
        <Path d="M 0 80 L 48 61 L 94 70 L 141 31 L 187 61 L 234 81 L 281 104 L 328 126 L 328 148 L 0 148 Z" fill={`url(#${id}gold)`} />
        {series.map((item, seriesIndex) => {
          const d = item.values.map((y, index) => `${index ? 'L' : 'M'} ${index / 7 * 328} ${y}`).join(' ');
          return <ReactFragment key={item.label}>
            <Path d={d} fill="none" stroke={item.color} strokeWidth={selected?.series === seriesIndex ? 4 : 1.5} strokeLinejoin="round" />
            {item.values.slice(1).map((y, index) => <Path key={`segment-${index}`} d={`M ${index / 7 * 328} ${item.values[index]} L ${(index + 1) / 7 * 328} ${y}`} fill="none" stroke="transparent" strokeWidth={18} accessible accessibilityLabel={`Select ${item.label.toLowerCase()} segment ${index + 1}`} onPress={() => setSelected({ series: seriesIndex, index: index + 1 })} />)}
            {item.values.map((y, index) => <Circle key={index} cx={index / 7 * 328} cy={y} r={12} fill="transparent" accessible accessibilityLabel={`${item.label}, point ${index + 1}`} onPress={() => setSelected({ series: seriesIndex, index })} />)}
          </ReactFragment>;
        })}
        {selected && <Circle cx={selected.index / 7 * 328} cy={series[selected.series].values[selected.index]} r={5} fill={series[selected.series].color} stroke="#fff" strokeWidth={2} />}

      </> : <>
        {[12.5, 10, 7.5, 5, 2.5].map((value) => <SvgText key={value} x={3} y={bottom - value / 15 * (bottom - 14) + 3} fill={WHITE[48]} fontSize={9}>${value}k</SvgText>)}
        <Path d={area} fill={`url(#${id}gold)`} /><Path d={line} fill="none" stroke={GOLD} strokeWidth={2} strokeLinejoin="round" />
        <Line x1={0} y1={bottom + 5} x2={328} y2={bottom + 5} stroke={WHITE[12]} />
        {monthNames.map((name, i) => <SvgText key={name} x={left + i / 4 * width} y={197} textAnchor={i === 4 ? 'end' : 'middle'} fill={WHITE[48]} fontSize={10}>{name}</SvgText>)}
      </>}
    </Svg>
    </BlurTargetView>
    {activity && selected && selectedPoint && <MotionView motionKey={`${selected.series}-${selected.index}`} duration={170} distance={5} fromScale={0.97} pointerEvents="none" style={[chartStyles.tooltip, {
      left: `${Math.min(62, Math.max(0, selected.index / 7 * 100 - 8))}%`,
      top: `${Math.max(0, (selectedPoint.values[selected.index] - 58) / 148 * 100)}%`,
    }]}>
      <BlurView tint="dark" intensity={30} style={StyleSheet.absoluteFill} {...(Platform.OS === 'android' ? { blurTarget: chartTarget, blurMethod: 'dimezisBlurViewSdk31Plus' as const } : {})} />
      <Text style={chartStyles.tooltipLabel}>{selectedPoint.label}</Text>
      <Text style={[chartStyles.tooltipNumber, { color: selectedPoint.color }]}>{selected.series === 0 ? '+' : '−'}${selectedPoint.amounts[selected.index].toLocaleString('en-US')}</Text>
    </MotionView>}
  </MotionView>;
}
const chartStyles = StyleSheet.create({
  donut: { width: '47%', maxWidth: 160, aspectRatio: 1, borderRadius: 80, shadowColor: '#000', shadowOpacity: 0.32, shadowRadius: 18, shadowOffset: { width: 0, height: 12 } },
  tooltip: { position: 'absolute', width: 108, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, overflow: 'hidden', backgroundColor: 'rgba(38,38,38,0.35)', borderWidth: 1, borderColor: WHITE[24] },
  tooltipLabel: { color: WHITE[64], fontSize: 11, marginBottom: 3 },
  tooltipNumber: { fontSize: 14, fontWeight: '500' },
  activity: { width: '100%', aspectRatio: 328 / 148, marginTop: 20 },
  trend: { width: '100%', aspectRatio: 328 / 202, marginTop: 16 },
});
