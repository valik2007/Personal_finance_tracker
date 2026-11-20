import { getTransactionCurrency } from "./currency.js";
import { getTransactionFingerprint } from "./statementImport.js";

const recurringFrequencies = new Set(["weekly", "monthly", "yearly"]);

function isPositiveAmount(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0;
}

function isValidId(value) {
  return (typeof value === "string" && value.length > 0) ||
    (typeof value === "number" && Number.isFinite(value));
}

function hasValidCurrency(item) {
  return item.currency === undefined ||
    (typeof item.currency === "string" && /^[A-Za-z]{3}$/.test(item.currency));
}

function isValidDateOnly(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
}

function assertRecords(records, isValidRecord, label) {
  if (!Array.isArray(records) || !records.every(isValidRecord)) {
    throw new Error(`The backup contains invalid ${label} data.`);
  }
}

export function parseFinanceBackup(value) {
  if (!value || value.schemaVersion !== 1) {
    throw new Error("This backup format is not supported.");
  }

  const { transactions, budgets, savingsGoals, recurringPayments } = value;
  assertRecords(
    transactions,
    (item) =>
      item &&
      isValidId(item.id) &&
      typeof item.text === "string" &&
      item.text.trim() &&
      isPositiveAmount(item.amount) &&
      ["income", "expense"].includes(item.type) &&
      typeof item.category === "string" &&
      typeof item.date === "string" &&
      !Number.isNaN(new Date(item.date).getTime()) &&
      hasValidCurrency(item),
    "transaction"
  );
  assertRecords(
    budgets,
    (item) =>
      item &&
      typeof item.category === "string" &&
      item.category.trim() &&
      isPositiveAmount(item.limit) &&
      hasValidCurrency(item),
    "budget"
  );
  assertRecords(
    savingsGoals,
    (item) =>
      item &&
      isValidId(item.id) &&
      typeof item.name === "string" &&
      item.name.trim() &&
      isPositiveAmount(item.target) &&
      Number.isFinite(Number(item.saved)) &&
      Number(item.saved) >= 0 &&
      hasValidCurrency(item),
    "savings goal"
  );
  assertRecords(
    recurringPayments,
    (item) =>
      item &&
      isValidId(item.id) &&
      typeof item.description === "string" &&
      item.description.trim() &&
      isPositiveAmount(item.amount) &&
      ["income", "expense"].includes(item.type) &&
      typeof item.category === "string" &&
      recurringFrequencies.has(item.frequency) &&
      isValidDateOnly(item.nextDate) &&
      hasValidCurrency(item),
    "recurring payment"
  );

  return {
    transactions,
    budgets,
    savingsGoals,
    recurringPayments,
  };
}

export function mergeFinanceBackup(current, incoming) {
  const seenTransactions = new Set(
    current.transactions.map(getTransactionFingerprint)
  );
  const transactions = [...current.transactions];
  let addedTransactions = 0;
  incoming.transactions.forEach((transaction) => {
    const fingerprint = getTransactionFingerprint(transaction);
    if (seenTransactions.has(fingerprint)) return;
    seenTransactions.add(fingerprint);
    transactions.push(transaction);
    addedTransactions += 1;
  });

  const budgetsByKey = new Map(
    current.budgets.map((budget) => [
      `${getTransactionCurrency(budget)}::${budget.category}`,
      budget,
    ])
  );
  let addedBudgets = 0;
  incoming.budgets.forEach((budget) => {
    const key = `${getTransactionCurrency(budget)}::${budget.category}`;
    if (budgetsByKey.has(key)) return;
    budgetsByKey.set(key, budget);
    addedBudgets += 1;
  });

  const mergeById = (existing, added) => {
    const ids = new Set(existing.map((item) => String(item.id)));
    const merged = [...existing];
    let addedCount = 0;
    added.forEach((item) => {
      const id = String(item.id);
      if (ids.has(id)) return;
      ids.add(id);
      merged.push(item);
      addedCount += 1;
    });
    return { merged, addedCount };
  };

  const goals = mergeById(current.savingsGoals, incoming.savingsGoals);
  const recurring = mergeById(
    current.recurringPayments,
    incoming.recurringPayments
  );

  return {
    data: {
      transactions,
      budgets: [...budgetsByKey.values()],
      savingsGoals: goals.merged,
      recurringPayments: recurring.merged,
    },
    added: {
      transactions: addedTransactions,
      budgets: addedBudgets,
      savingsGoals: goals.addedCount,
      recurringPayments: recurring.addedCount,
    },
  };
}

function csvCell(value) {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function transactionsToCsv(transactions) {
  const rows = [
    ["Date", "Description", "Type", "Category", "Currency", "Amount"],
    ...transactions.map((transaction) => [
      transaction.date || "",
      transaction.text || "",
      transaction.type || "",
      transaction.category || "Other",
      getTransactionCurrency(transaction),
      Number(transaction.amount) || 0,
    ]),
  ];
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}
