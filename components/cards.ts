export type CardTheme = 'violet' | 'gold' | 'green' | 'rose' | 'blue';
export type WalletCard = { id: string; title: string; owner: string; last4: string; expiry: string; theme: CardTheme; balance: number; isDefault: boolean };
export const CARD_THEMES: Record<CardTheme, readonly [string, string, string, string, string]> = {
  violet: ['#26152C', '#5C14D4', '#762CF0', '#78A6FF', '#FFEFF8'],
  gold: ['#463019', '#AD701D', '#E3AF35', '#FFE699', '#FFF6DA'],
  green: ['#102D29', '#267B5F', '#4CA878', '#A6DCAA', '#E4F1D6'],
  rose: ['#431D2C', '#B84C61', '#DD7580', '#F6B1A3', '#FFE8DB'],
  blue: ['#102A46', '#2059A5', '#5088D8', '#96C6FF', '#E4F0FF'],
};
export const INITIAL_CARDS: WalletCard[] = [
  { id: 'junior', title: 'Junior Card', owner: 'Aurelia Kaizer', last4: '3756', expiry: '04/28', theme: 'violet', balance: 31204.94, isDefault: true },
  { id: 'everyday', title: 'Everyday Card', owner: 'Aurelia Kaizer', last4: '8042', expiry: '09/29', theme: 'gold', balance: 7430.52, isDefault: false },
  { id: 'travel', title: 'Travel Card', owner: 'Aurelia Kaizer', last4: '1938', expiry: '12/28', theme: 'green', balance: 7480.52, isDefault: false },
  { id: 'digital', title: 'Digital Card', owner: 'Aurelia Kaizer', last4: '6205', expiry: '06/29', theme: 'blue', balance: 23480.52, isDefault: false },
];
export const digitsOnly = (value: string) => value.replace(/\D/g, '');
export const formatCardNumber = (value: string) => digitsOnly(value).slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
export const formatExpiry = (value: string) => digitsOnly(value).slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');
export function validCardNumber(value: string) {
  const digits = digitsOnly(value);
  if (!/^\d{13,19}$/.test(digits) || /^0+$/.test(digits)) return false;
  let sum = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if ((digits.length - 1 - i) % 2) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
  }
  return sum % 10 === 0;
}
export function validExpiry(value: string, today = new Date()) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]), year = 2000 + Number(match[2]);
  return month >= 1 && month <= 12 && new Date(year, month, 1) > today;
}
export function snapCardIndex(offset: number, velocity: number, stride: number, count: number) {
  return Math.max(0, Math.min(count - 1, Math.round(-(offset + velocity * 100) / stride)));
}
