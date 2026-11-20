import { getTransactionCurrency } from "./currency.js";

function parseTransactionDate(value) {
  const text = String(value || "").trim();
  const isoDate = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDate) {
    const [, year, month, day] = isoDate.map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
      ? date
      : null;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime())
    ? null
    : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function getAmount(transaction) {
  const amount = Number(transaction.amount);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export function getMonthlyTotals(transactions, month, currency, throughDate = null) {
  const cutoff = throughDate ? new Date(throughDate) : null;
  if (cutoff) cutoff.setHours(23, 59, 59, 999);

  return transactions.reduce(
    (totals, transaction) => {
      const date = parseTransactionDate(transaction.date);
      if (
        !date ||
        getTransactionCurrency(transaction) !== currency ||
        date.getFullYear() !== month.getFullYear() ||
        date.getMonth() !== month.getMonth() ||
        (cutoff && date > cutoff)
      ) {
        return totals;
      }

      if (transaction.type === "income") totals.income += getAmount(transaction);
      if (transaction.type === "expense") totals.expenses += getAmount(transaction);
      return totals;
    },
    { income: 0, expenses: 0 }
  );
}

export function getCashFlowSeries(transactions, now, currency, monthCount = 6) {
  return Array.from({ length: monthCount }, (_, index) => {
    const month = new Date(
      now.getFullYear(),
      now.getMonth() - monthCount + index + 1,
      1
    );
    const isCurrentMonth =
      month.getFullYear() === now.getFullYear() &&
      month.getMonth() === now.getMonth();
    return {
      label: month.toLocaleDateString("en-US", { month: "short" }),
      ...getMonthlyTotals(
        transactions,
        month,
        currency,
        isCurrentMonth ? now : null
      ),
    };
  });
}

export function getSpendingByCategory(
  transactions,
  month,
  currency,
  type = "expense",
  throughDate = null
) {
  const cutoff = throughDate ? new Date(throughDate) : null;
  if (cutoff) cutoff.setHours(23, 59, 59, 999);

  return transactions.reduce((totals, transaction) => {
    const date = parseTransactionDate(transaction.date);
    if (
      !date ||
      transaction.type !== type ||
      getTransactionCurrency(transaction) !== currency ||
      date.getFullYear() !== month.getFullYear() ||
      date.getMonth() !== month.getMonth() ||
      (cutoff && date > cutoff)
    ) {
      return totals;
    }

    const category = transaction.category || "Other";
    totals[category] = (totals[category] || 0) + getAmount(transaction);
    return totals;
  }, {});
}

export function getBalanceAtDate(transactions, throughDate, currency) {
  const cutoff = new Date(throughDate);
  cutoff.setHours(23, 59, 59, 999);

  return transactions.reduce((balance, transaction) => {
    const date = parseTransactionDate(transaction.date);
    if (
      !date ||
      date > cutoff ||
      getTransactionCurrency(transaction) !== currency
    ) {
      return balance;
    }

    if (transaction.type === "income") return balance + getAmount(transaction);
    if (transaction.type === "expense") return balance - getAmount(transaction);
    return balance;
  }, 0);
}

export function getMonthComparison(transactions, currency, now) {
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
    999
  );

  return {
    current: getMonthlyTotals(transactions, currentMonth, currency, now),
    previous: getMonthlyTotals(transactions, previousMonth, currency),
    balance: {
      current: getBalanceAtDate(transactions, now, currency),
      previous: getBalanceAtDate(transactions, previousMonthEnd, currency),
    },
  };
}

export function getPercentChange(current, previous) {
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}
