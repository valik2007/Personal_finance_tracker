import assert from "node:assert/strict";
import test from "node:test";
import {
  getCashFlowSeries,
  getMonthComparison,
  getMonthlyTotals,
  getPercentChange,
  getSpendingByCategory,
} from "../src/financeMetrics.js";

const now = new Date(2026, 10, 20, 12);
const transactions = [
  { date: "2026-10-02", type: "income", amount: 500, currency: "USD" },
  { date: "2026-10-04", type: "expense", amount: 400, category: "Food", currency: "USD" },
  { date: "2026-11-03", type: "income", amount: 1000, currency: "USD" },
  { date: "2026-11-05", type: "expense", amount: 300, category: "Food", currency: "USD" },
  { date: "2026-11-06", type: "expense", amount: 50, category: "Housing", currency: "USD" },
  { date: "2026-11-07", type: "income", amount: 700, currency: "RON" },
  { date: "2026-11-22", type: "income", amount: 2000, currency: "USD" },
  { date: "2026-11-25", type: "expense", amount: 800, category: "Housing", currency: "USD" },
];

test("monthly totals and cash flow use the selected currency and month", () => {
  assert.deepEqual(getMonthlyTotals(transactions, now, "USD", now), {
    income: 1000,
    expenses: 350,
  });

  const series = getCashFlowSeries(transactions, now, "USD");
  assert.deepEqual(series.slice(-2), [
    { label: "Oct", income: 500, expenses: 400 },
    { label: "Nov", income: 1000, expenses: 350 },
  ]);
});

test("month comparison uses prior month values and excludes future transactions", () => {
  const comparison = getMonthComparison(transactions, "USD", now);
  assert.deepEqual(comparison.current, { income: 1000, expenses: 350 });
  assert.deepEqual(comparison.previous, { income: 500, expenses: 400 });
  assert.deepEqual(comparison.balance, { current: 750, previous: 100 });
  assert.equal(getPercentChange(comparison.current.income, comparison.previous.income), 100);
  assert.equal(getPercentChange(comparison.current.expenses, comparison.previous.expenses), -12.5);
  assert.equal(getPercentChange(100, 0), null);
});

test("spending breakdown groups actual expenses by category", () => {
  assert.deepEqual(getSpendingByCategory(transactions, now, "USD", "expense", now), {
    Food: 300,
    Housing: 50,
  });
});
