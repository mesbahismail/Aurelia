export type DateRange = { start: Date; end: Date };
export type DatePreset = 'custom' | 'today' | 'lastWeek' | 'lastMonth';

export const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
export const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
export const shiftMonth = (date: Date, offset: number) => new Date(date.getFullYear(), date.getMonth() + offset, 1);
export const sameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();

export function orderedRange(a: Date, b: Date): DateRange {
  const first = startOfDay(a), second = startOfDay(b);
  return first <= second ? { start: first, end: second } : { start: second, end: first };
}

export function presetRange(preset: Exclude<DatePreset, 'custom'>, now = new Date()): DateRange {
  const today = startOfDay(now);
  if (preset === 'today') return { start: today, end: today };
  if (preset === 'lastMonth') return {
    start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
    end: new Date(today.getFullYear(), today.getMonth(), 0),
  };
  const mondayOffset = (today.getDay() + 6) % 7;
  return {
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - mondayOffset - 7),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - mondayOffset - 1),
  };
}

export function monthDays(month: Date) {
  const first = startOfMonth(month);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, index) =>
    new Date(first.getFullYear(), first.getMonth(), index - offset + 1));
}

export function formatRange(range: DateRange) {
  const format = (date: Date) => `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  return sameDay(range.start, range.end) ? format(range.start) : `${format(range.start)} – ${format(range.end)}`;
}
