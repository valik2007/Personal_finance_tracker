export const DEFAULT_CURRENCY = "USD";
export const SUPPORTED_CURRENCIES = ["EUR", "RON", "USD"];

export function normalizeCurrency(value) {
  const match = String(value || "").trim().toUpperCase().match(/\b[A-Z]{3}\b/);
  return match ? match[0] : DEFAULT_CURRENCY;
}

export function getTransactionCurrency(transaction) {
  return normalizeCurrency(transaction?.currency);
}

export function formatCurrency(value, currency = DEFAULT_CURRENCY) {
  const code = normalizeCurrency(currency);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    currencyDisplay: code === "USD" ? "symbol" : "code",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function sumByCurrency(transactions, predicate = () => true) {
  return transactions.reduce((totals, transaction) => {
    if (!predicate(transaction)) return totals;

    const currency = getTransactionCurrency(transaction);
    totals[currency] = (totals[currency] || 0) + (Number(transaction.amount) || 0);
    return totals;
  }, {});
}
