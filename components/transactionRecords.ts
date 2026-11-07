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
    { id: 'dinner', title: 'Dinner with friends', amount: -86.50, timestamp: at(2, 20, 15) },
    { id: 'transport', title: 'City Transport', amount: -12.80, timestamp: at(3, 8, 42) },
    { id: 'freelance', title: 'Freelance Payment', amount: 1250, timestamp: at(3, 14, 20) },
    { id: 'bookshop', title: 'Bookshop', amount: -34.90, timestamp: at(3, 17, 5) },
    { id: 'internet', title: 'Internet Bill', amount: -59.99, timestamp: at(4, 9, 0) },
    { id: 'refund', title: 'Shopping Refund', amount: 79.50, timestamp: at(4, 12, 35) },
    { id: 'lunch', title: 'Lunch', amount: -18.75, timestamp: at(4, 13, 10) },
    { id: 'electricity', title: 'Electricity Bill', amount: -94.20, timestamp: at(5, 10, 15) },
    { id: 'savings', title: 'Savings Transfer', amount: -500, timestamp: at(5, 15, 30) },
    { id: 'emily', title: 'Emily Johnson', amount: 120, timestamp: at(5, 18, 45) },
    { id: 'market', title: 'Weekend Market', amount: -63.40, timestamp: at(6, 10, 25) },
    { id: 'streaming', title: 'Streaming Subscription', amount: -14.99, timestamp: at(6, 7, 0) },
    { id: 'hotel', title: 'Hotel Reservation', amount: -240, timestamp: at(7, 16, 20) },
    { id: 'cashback', title: 'Card Cashback', amount: 24.80, timestamp: at(7, 9, 10) },
    { id: 'pharmacy', title: 'Pharmacy', amount: -22.60, timestamp: at(8, 11, 45) },
    { id: 'project', title: 'Project Payment', amount: 2800, timestamp: at(8, 15, 5) },
    { id: 'bakery', title: 'Bakery', amount: -9.20, timestamp: at(9, 8, 15) },
    { id: 'phone', title: 'Mobile Plan', amount: -35, timestamp: at(9, 10, 0) },
    { id: 'train', title: 'Train Tickets', amount: -48, timestamp: at(10, 12, 40) },
    { id: 'charlotte', title: 'Charlotte Anderson', amount: 65, timestamp: at(10, 17, 30) },
    { id: 'home', title: 'Home Supplies', amount: -112.35, timestamp: at(11, 14, 10) },
    { id: 'music', title: 'Music Subscription', amount: -10.99, timestamp: at(12, 8, 0) },
    { id: 'salary', title: 'Salary Deposit', amount: 5200, timestamp: at(13, 9, 0) },
    { id: 'rent', title: 'Rent Payment', amount: -1400, timestamp: at(13, 10, 0) },
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
  return [...groups.values()]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map(group => ({ ...group, records: group.records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) }));
}
export function recordAmount(amount: number) {
  return `${amount >= 0 ? '+' : '−'}${Math.abs(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
}
