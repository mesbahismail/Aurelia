const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadLogic(filename) {
  const source = fs.readFileSync(path.join(__dirname, '..', 'components', filename), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const context = { exports: {}, require: name => {
    if (name.startsWith('./')) return loadLogic(`${name.slice(2)}.ts`);
    throw new Error(`Unexpected dependency: ${name}`);
  } };
  vm.runInNewContext(compiled, context);
  return context.exports;
}
const cards = loadLogic('cards.ts');
const dates = loadLogic('dateRanges.ts');
const date = (year, month, day, hour = 0) => new Date(year, month - 1, day, hour);
const stamp = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const rangeStamp = range => `${stamp(range.start)} / ${stamp(range.end)}`;

test('card validation accepts common test numbers and rejects invalid entries', () => {
  for (const number of ['4242 4242 4242 4242', '5555555555554444', '378282246310005']) assert.equal(cards.validCardNumber(number), true);
  for (const number of ['', '1234', '4242424242424241', '0000000000000000', '42424242424242424242']) assert.equal(cards.validCardNumber(number), false);
});
test('card formatting keeps the expected digit limits', () => {
  assert.equal(cards.formatCardNumber('4242-4242 4242a4242'), '4242 4242 4242 4242');
  assert.equal(cards.digitsOnly(cards.formatCardNumber('12345678901234567890123')).length, 19);
  assert.equal(cards.formatExpiry('1228'), '12/28');
  assert.equal(cards.formatExpiry('1'), '1');
});
test('expiration remains valid until the end of its month', () => {
  const now = date(2026, 10, 30);
  assert.equal(cards.validExpiry('10/26', now), true);
  assert.equal(cards.validExpiry('09/26', now), false);
  for (const invalid of ['00/28', '13/28', '1/28', '']) assert.equal(cards.validExpiry(invalid, now), false);
  assert.equal(cards.validExpiry('12/26', date(2027, 1, 1)), false);
});
test('carousel snaps with distance and velocity and clamps to its ends', () => {
  assert.equal(cards.snapCardIndex(-180, 0, 320, 4), 1);
  assert.equal(cards.snapCardIndex(-80, 0, 320, 4), 0);
  assert.equal(cards.snapCardIndex(-80, -0.8, 320, 4), 1);
  assert.equal(cards.snapCardIndex(-200, 0.6, 320, 4), 0);
  assert.equal(cards.snapCardIndex(300, 1, 320, 4), 0);
  assert.equal(cards.snapCardIndex(-2000, -1, 320, 4), 3);
});
test('quick date presets handle week and year boundaries', () => {
  assert.equal(rangeStamp(dates.presetRange('today', date(2026, 10, 30, 15))), '2026-10-30 / 2026-10-30');
  assert.equal(rangeStamp(dates.presetRange('lastWeek', date(2026, 10, 30))), '2026-10-19 / 2026-10-25');
  assert.equal(rangeStamp(dates.presetRange('lastWeek', date(2026, 11, 1))), '2026-10-19 / 2026-10-25');
  assert.equal(rangeStamp(dates.presetRange('lastMonth', date(2024, 3, 10))), '2024-2-1 / 2024-2-29');
  assert.equal(rangeStamp(dates.presetRange('lastMonth', date(2026, 1, 10))), '2025-12-1 / 2025-12-31');
});
test('calendar grids contain full Monday-to-Sunday weeks including leap days', () => {
  const august = dates.monthDays(date(2026, 8, 1));
  assert.equal(august.length, 42);
  assert.equal(stamp(august[0]), '2026-7-27');
  assert.equal(stamp(august[41]), '2026-9-6');
  const february = dates.monthDays(date(2024, 2, 1));
  assert.equal(february.filter(day => day.getMonth() === 1).length, 29);
  assert.equal(february[0].getDay(), 1);
  assert.equal(february.at(-1).getDay(), 0);
});
test('custom ranges normalize reverse selection and format single days', () => {
  assert.equal(rangeStamp(dates.orderedRange(date(2026, 10, 30), date(2026, 9, 1))), '2026-9-1 / 2026-10-30');
  assert.equal(dates.formatRange(dates.orderedRange(date(2026, 10, 30), date(2026, 10, 30))), '30/10/2026');
  assert.equal(dates.formatRange(dates.orderedRange(date(2026, 8, 8), date(2026, 9, 10))), '8/8/2026 – 10/9/2026');
});

const records = loadLogic('transactionRecords.ts');
test('records are grouped by day with the newest group first', () => {
  const groups = records.groupRecords(records.demoRecords(date(2026, 10, 30)));
  assert.equal(groups.length, 3);
  assert.equal(stamp(groups[0].date), '2026-10-30');
  assert.equal(stamp(groups[2].date), '2026-10-28');
  assert.equal(groups[0].records.length, 2);
  assert.equal(groups[1].records.length, 3);
  assert.equal(groups[2].records.length, 2);
});
test('record filtering includes every transaction on the last selected day', () => {
  const transactions = records.demoRecords(date(2026, 10, 30));
  const today = records.groupRecords(transactions, { start: date(2026, 10, 30), end: date(2026, 10, 30) });
  assert.equal(today.length, 1);
  assert.equal(today[0].records.length, 2);
  const range = records.groupRecords(transactions, { start: date(2026, 10, 28), end: date(2026, 10, 29) });
  assert.equal(range.reduce((count, group) => count + group.records.length, 0), 5);
  assert.equal(records.groupRecords(transactions, { start: date(2026, 11, 1), end: date(2026, 11, 2) }).length, 0);
});
test('record amounts distinguish deposits from expenses', () => {
  assert.equal(records.recordAmount(23000), '+$23,000.00');
  assert.equal(records.recordAmount(-200), '−$200.00');
});
