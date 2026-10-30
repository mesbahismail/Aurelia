import { startOfDay, type DateRange } from './dateRanges';

export type TransactionRecord = { id: string; title: string; amount: number; timestamp: Date };
export function demoRecords(now = new Date()): TransactionRecord[] {
  const at = (daysAgo: number, hour: number, minute: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, hour, minute);
  return [
    { id: 'bank-transfer', title: 'Bank Transfer', amount: 23000, timestamp: at(0, 9, 53) },
    { id: 'groceries', title: 'Groceries', amount: -200, timestamp: at(0, 11, 30) },
    { id: 'coffee', title: 'Coffee Subscription', amount: -100, timestamp: at(1, 11, 30) },
    { id: 'direct-deposit', title: 'Direct Deposit', amount: 4000, timestamp: at(1, 9, 53) },
    { id: 'wire-transfer', title: 'Wire Transfer', amount: 3000, timestamp: at(1, 9, 53) },
    { id: 'gym', title: 'Gym Membership', amount: -4400, timestamp: at(2, 11, 30) },
    { id: 'paypal', title: 'PayPal Deposit', amount: 4000, timestamp: at(2, 9, 53) },
  ];
}
export function groupRecords(records: TransactionRecord[], range: DateRange | null = null) {
  const groups = new Map<number, { date: Date; records: TransactionRecord[] }>();
  for (const record of records) {
    const day = startOfDay(record.timestamp);
    if (range && (day < startOfDay(range.start) || day > startOfDay(range.end))) continue;
    const key = day.getTime();
    if (!groups.has(key)) groups.set(key, { date: day, records: [] });
    groups.get(key)!.records.push(record);
  }
  return [...groups.values()].sort((a, b) => b.date.getTime() - a.date.getTime());
}
export function recordAmount(amount: number) {
  return `${amount >= 0 ? '+' : '−'}${Math.abs(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
}
