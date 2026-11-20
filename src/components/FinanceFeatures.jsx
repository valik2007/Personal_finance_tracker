import { useState } from "react";
import {
  DEFAULT_CURRENCY,
  formatCurrency,
  getTransactionCurrency,
} from "../currency.js";

const inputClass =
  "min-w-0 rounded-lg border border-gray-800 bg-gray-900 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none";
const buttonClass =
  "cursor-pointer rounded-lg border border-gray-700 px-3 py-2 text-[11px] font-medium text-gray-300 transition hover:border-emerald-500 hover:text-white";

function localDateInputValue(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function formatTransactionDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TransactionEditForm({
  transaction,
  currencyOptions,
  expenseCategories,
  incomeCategories,
  onCancel,
  onSave,
}) {
  const [draft, setDraft] = useState({
    text: transaction.text || "",
    amount: String(transaction.amount ?? ""),
    type: transaction.type === "income" ? "income" : "expense",
    category: transaction.category || "Other",
    currency: getTransactionCurrency(transaction),
    date: localDateInputValue(transaction.date),
  });
  const categoryOptions =
    draft.type === "income" ? incomeCategories : expenseCategories;
  const options = categoryOptions.includes(draft.category)
    ? categoryOptions
    : [draft.category, ...categoryOptions];

  const handleSubmit = (event) => {
    event.preventDefault();
    const amount = Number(draft.amount);
    if (!draft.text.trim() || !Number.isFinite(amount) || amount <= 0 || !draft.date) {
      return;
    }
    onSave({
      ...draft,
      text: draft.text.trim(),
      amount,
      date: formatTransactionDate(draft.date),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 py-3 sm:grid-cols-2 lg:grid-cols-4">
      <input
        className={inputClass}
        aria-label="Edit transaction description"
        required
        value={draft.text}
        onChange={(event) => setDraft({ ...draft, text: event.target.value })}
      />
      <input
        className={inputClass}
        aria-label="Edit transaction amount"
        type="number"
        min="0.01"
        step="0.01"
        required
        value={draft.amount}
        onChange={(event) => setDraft({ ...draft, amount: event.target.value })}
      />
      <input
        className={inputClass}
        aria-label="Edit transaction date"
        type="date"
        required
        value={draft.date}
        onChange={(event) => setDraft({ ...draft, date: event.target.value })}
      />
      <select
        className={inputClass}
        aria-label="Edit transaction currency"
        value={draft.currency}
        onChange={(event) => setDraft({ ...draft, currency: event.target.value })}
      >
        {currencyOptions.map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
      <select
        className={inputClass}
        aria-label="Edit transaction type"
        value={draft.type}
        onChange={(event) => {
          const type = event.target.value;
          setDraft({
            ...draft,
            type,
            category: type === "income" ? incomeCategories[0] : expenseCategories[0],
          });
        }}
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
      <select
        className={inputClass}
        aria-label="Edit transaction category"
        value={draft.category}
        onChange={(event) => setDraft({ ...draft, category: event.target.value })}
      >
        {options.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <div className="flex gap-2 sm:col-span-2">
        <button
          type="submit"
          className="flex-1 cursor-pointer rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-black hover:bg-emerald-500"
        >
          Save
        </button>
        <button type="button" className={buttonClass} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export function TransactionManager({
  transactions,
  currencyOptions,
  expenseCategories,
  incomeCategories,
  onUpdate,
  onDelete,
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [throughDate, setThroughDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const categories = [...new Set(transactions.map((item) => item.category || "Other"))].sort();
  const search = query.trim().toLowerCase();
  const filteredTransactions = transactions.filter((transaction) => {
    const currency = getTransactionCurrency(transaction);
    const date = new Date(transaction.date);
    const searchable = `${transaction.text || ""} ${transaction.category || "Other"}`
      .toLowerCase();
    return (
      (!search || searchable.includes(search)) &&
      (typeFilter === "all" || transaction.type === typeFilter) &&
      (categoryFilter === "all" || (transaction.category || "Other") === categoryFilter) &&
      (currencyFilter === "all" || currency === currencyFilter) &&
      (!fromDate || (!Number.isNaN(date.getTime()) && date >= new Date(`${fromDate}T00:00:00`))) &&
      (!throughDate ||
        (!Number.isNaN(date.getTime()) && date <= new Date(`${throughDate}T23:59:59`)))
    );
  });
  const hasFilters =
    Boolean(search || fromDate || throughDate) ||
    typeFilter !== "all" ||
    categoryFilter !== "all" ||
    currencyFilter !== "all";

  return (
    <section className="rounded-2xl border border-gray-800/80 bg-[#121513] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">Transactions</h3>
          <p className="mt-1 text-[10px] text-gray-500">
            {filteredTransactions.length} of {transactions.length} records
          </p>
        </div>
        {hasFilters && (
          <button
            type="button"
            className={buttonClass}
            onClick={() => {
              setQuery("");
              setTypeFilter("all");
              setCategoryFilter("all");
              setCurrencyFilter("all");
              setFromDate("");
              setThroughDate("");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <input
          className={inputClass}
          aria-label="Search transactions"
          placeholder="Search description or category"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          className={inputClass}
          aria-label="Filter by transaction type"
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
        >
          <option value="all">All types</option>
          <option value="expense">Expenses</option>
          <option value="income">Income</option>
        </select>
        <select
          className={inputClass}
          aria-label="Filter by transaction category"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          className={inputClass}
          aria-label="Filter by transaction currency"
          value={currencyFilter}
          onChange={(event) => setCurrencyFilter(event.target.value)}
        >
          <option value="all">All currencies</option>
          {currencyOptions.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-[10px] text-gray-500">
          From
          <input
            className={inputClass}
            aria-label="Filter transactions from date"
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-[10px] text-gray-500">
          Through
          <input
            className={inputClass}
            aria-label="Filter transactions through date"
            type="date"
            value={throughDate}
            onChange={(event) => setThroughDate(event.target.value)}
          />
        </label>
      </div>

      {filteredTransactions.length ? (
        <div className="divide-y divide-gray-800/60">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="py-2">
              {editingId === transaction.id ? (
                <TransactionEditForm
                  transaction={transaction}
                  currencyOptions={currencyOptions}
                  expenseCategories={expenseCategories}
                  incomeCategories={incomeCategories}
                  onCancel={() => setEditingId(null)}
                  onSave={(draft) => {
                    onUpdate(transaction.id, draft);
                    setEditingId(null);
                  }}
                />
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 py-2 text-xs">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-gray-800 bg-gray-900 font-bold text-emerald-400">
                      {transaction.type === "income" ? "↓" : "↑"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{transaction.text}</p>
                      <p className="text-[10px] text-gray-500">
                        {transaction.category || "Other"} · {transaction.date || "Today"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-semibold ${
                        transaction.type === "income" ? "text-emerald-400" : "text-gray-200"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount, getTransactionCurrency(transaction))}
                    </span>
                    <button
                      type="button"
                      className="cursor-pointer text-[10px] text-emerald-400 hover:text-emerald-300"
                      onClick={() => setEditingId(transaction.id)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${transaction.text}`}
                      className="cursor-pointer text-gray-500 hover:text-red-400"
                      onClick={() => {
                        if (window.confirm(`Delete "${transaction.text}"?`)) {
                          onDelete(transaction.id);
                        }
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-xs text-gray-500">
          {transactions.length ? "No transactions match these filters." : "No transactions added yet."}
        </p>
      )}
    </section>
  );
}

const emptyGoal = (currency) => ({ name: "", target: "", saved: "0", currency });

export function SavingsGoalsPanel({
  goals,
  currencyOptions,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const openNew = () => {
    setEditingId(null);
    setForm(emptyGoal(DEFAULT_CURRENCY));
    setError("");
  };
  const openEdit = (goal) => {
    setEditingId(goal.id);
    setForm({
      name: goal.name,
      target: String(goal.target),
      saved: String(goal.saved),
      currency: getTransactionCurrency(goal),
    });
    setError("");
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const target = Number(form.target);
    const saved = Number(form.saved);
    if (!form.name.trim() || !Number.isFinite(target) || target <= 0 ||
      !Number.isFinite(saved) || saved < 0) {
      setError("Enter a name, a target above zero, and a valid saved amount.");
      return;
    }
    const goal = {
      name: form.name.trim(),
      target,
      saved,
      currency: form.currency,
    };
    if (editingId !== null) onUpdate(editingId, goal);
    else onAdd(goal);
    setForm(null);
    setEditingId(null);
    setError("");
  };

  return (
    <section className="rounded-2xl border border-gray-800/80 bg-[#121513] p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">Savings goals</h3>
          <p className="mt-1 text-[10px] text-gray-500">Track progress in each currency separately.</p>
        </div>
        <button
          type="button"
          className={buttonClass}
          onClick={() => (form ? setForm(null) : openNew())}
        >
          {form ? "Cancel" : "Add goal"}
        </button>
      </div>

      {form && (
        <form onSubmit={handleSubmit} className="mb-4 grid gap-2 sm:grid-cols-2">
          <input
            className={inputClass}
            aria-label="Savings goal name"
            placeholder="Goal name"
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <input
            className={inputClass}
            aria-label="Savings goal target"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Target amount"
            required
            value={form.target}
            onChange={(event) => setForm({ ...form, target: event.target.value })}
          />
          <input
            className={inputClass}
            aria-label="Current saved amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="Already saved"
            required
            value={form.saved}
            onChange={(event) => setForm({ ...form, saved: event.target.value })}
          />
          <select
            className={inputClass}
            aria-label="Savings goal currency"
            value={form.currency}
            onChange={(event) => setForm({ ...form, currency: event.target.value })}
          >
            {currencyOptions.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
          {error && <p role="alert" className="text-[11px] text-red-400 sm:col-span-2">{error}</p>}
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-black hover:bg-emerald-500 sm:col-span-2"
          >
            {editingId !== null ? "Save goal" : "Create goal"}
          </button>
        </form>
      )}

      {goals.length ? (
        <div className="space-y-4">
          {goals.map((goal) => {
            const currency = getTransactionCurrency(goal);
            const saved = Number(goal.saved) || 0;
            const target = Number(goal.target) || 0;
            const progress = target ? Math.min((saved / target) * 100, 100) : 0;
            return (
              <div key={goal.id}>
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="truncate text-xs font-medium text-gray-200">{goal.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">
                      {formatCurrency(saved, currency)} / {formatCurrency(target, currency)}
                    </span>
                    <button
                      type="button"
                      className="cursor-pointer text-[10px] text-emerald-400 hover:text-emerald-300"
                      onClick={() => openEdit(goal)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${goal.name} savings goal`}
                      className="cursor-pointer text-gray-500 hover:text-red-400"
                      onClick={() => {
                        if (window.confirm(`Delete the "${goal.name}" savings goal?`)) {
                          onDelete(goal.id);
                        }
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-900">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-gray-500">
                  {progress >= 100
                    ? "Goal reached"
                    : `${formatCurrency(Math.max(target - saved, 0), currency)} left`}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="py-2 text-center text-[11px] text-gray-500">
          No savings goals yet. Create one to track your progress.
        </p>
      )}
    </section>
  );
}

const emptyRecurring = (currency, expenseCategories) => ({
  description: "",
  amount: "",
  type: "expense",
  category: expenseCategories[0] || "Other",
  currency,
  frequency: "monthly",
  nextDate: localDateInputValue(),
});

export function RecurringPaymentsPanel({
  recurringPayments,
  currencyOptions,
  expenseCategories,
  incomeCategories,
  onAdd,
  onDelete,
  onRecord,
}) {
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const today = localDateInputValue();
  const categoryOptions =
    form?.type === "income" ? incomeCategories : expenseCategories;

  const handleSubmit = (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.description.trim() || !Number.isFinite(amount) || amount <= 0 ||
      !form.nextDate) {
      setError("Enter a description, an amount above zero, and a next due date.");
      return;
    }
    onAdd({ ...form, description: form.description.trim(), amount });
    setForm(null);
    setError("");
  };

  return (
    <section className="rounded-2xl border border-gray-800/80 bg-[#121513] p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">Recurring reminders</h3>
          <p className="mt-1 text-[10px] text-gray-500">
            Due items are added only after you confirm.
          </p>
        </div>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            setForm(form ? null : emptyRecurring(
              DEFAULT_CURRENCY,
              expenseCategories
            ));
            setError("");
          }}
        >
          {form ? "Cancel" : "Add reminder"}
        </button>
      </div>

      {form && (
        <form onSubmit={handleSubmit} className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <input
            className={inputClass}
            aria-label="Recurring transaction description"
            placeholder="Description"
            required
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
          <input
            className={inputClass}
            aria-label="Recurring transaction amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Amount"
            required
            value={form.amount}
            onChange={(event) => setForm({ ...form, amount: event.target.value })}
          />
          <select
            className={inputClass}
            aria-label="Recurring transaction type"
            value={form.type}
            onChange={(event) => {
              const type = event.target.value;
              setForm({
                ...form,
                type,
                category: type === "income" ? incomeCategories[0] : expenseCategories[0],
              });
            }}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <select
            className={inputClass}
            aria-label="Recurring transaction category"
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            className={inputClass}
            aria-label="Recurring transaction currency"
            value={form.currency}
            onChange={(event) => setForm({ ...form, currency: event.target.value })}
          >
            {currencyOptions.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
          <select
            className={inputClass}
            aria-label="Recurring frequency"
            value={form.frequency}
            onChange={(event) => setForm({ ...form, frequency: event.target.value })}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <label className="flex items-center gap-2 text-[10px] text-gray-500 sm:col-span-2 lg:col-span-1">
            Next due
            <input
              className={inputClass}
              aria-label="Next recurring transaction date"
              type="date"
              required
              value={form.nextDate}
              onChange={(event) => setForm({ ...form, nextDate: event.target.value })}
            />
          </label>
          {error && <p role="alert" className="text-[11px] text-red-400 sm:col-span-2 lg:col-span-3">{error}</p>}
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-black hover:bg-emerald-500 sm:col-span-2 lg:col-span-3"
          >
            Save reminder
          </button>
        </form>
      )}

      {recurringPayments.length ? (
        <div className="divide-y divide-gray-800/60">
          {recurringPayments.map((item) => {
            const due = item.nextDate <= today;
            const days = Math.max(
              0,
              Math.floor(
                (new Date(`${today}T00:00:00`) - new Date(`${item.nextDate}T00:00:00`)) /
                  86_400_000
              )
            );
            return (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white">{item.description}</p>
                  <p className="text-[10px] text-gray-500">
                    {item.category} · {item.frequency} · next {item.nextDate}
                  </p>
                  <p className={`mt-1 text-[10px] ${due ? "text-amber-300" : "text-gray-500"}`}>
                    {due ? (days ? `${days} day${days === 1 ? "" : "s"} overdue` : "Due today") : "Upcoming"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-200">
                    {item.type === "income" ? "+" : "-"}
                    {formatCurrency(item.amount, getTransactionCurrency(item))}
                  </span>
                  <button
                    type="button"
                    className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-40`}
                    disabled={!due}
                    onClick={() => onRecord(item)}
                  >
                    Record
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${item.description} reminder`}
                    className="cursor-pointer text-gray-500 hover:text-red-400"
                    onClick={() => {
                      if (window.confirm(`Delete the "${item.description}" reminder?`)) {
                        onDelete(item.id);
                      }
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="py-2 text-center text-[11px] text-gray-500">
          No recurring reminders yet.
        </p>
      )}
    </section>
  );
}

export function BackupTools({ onExportJson, onExportCsv, onRestore, status, error }) {
  const [file, setFile] = useState(null);
  return (
    <section className="rounded-2xl border border-gray-800/80 bg-[#121513] p-5">
      <h3 className="text-sm font-semibold text-white">Backup & export</h3>
      <p className="mb-4 mt-1 text-[10px] leading-relaxed text-gray-500">
        JSON includes transactions, budgets, savings goals, and recurring reminders. Restore merges data and skips duplicates; it does not replace existing records.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={buttonClass} onClick={onExportJson}>
          Download JSON backup
        </button>
        <button type="button" className={buttonClass} onClick={onExportCsv}>
          Export transactions CSV
        </button>
        <label className={`${buttonClass} cursor-pointer`}>
          Restore JSON
          <input
            className="sr-only"
            type="file"
            accept=".json,application/json"
            aria-label="Choose a JSON backup to restore"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </label>
        <button
          type="button"
          className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-40`}
          disabled={!file}
          onClick={async () => {
            if (!file) return;
            await onRestore(file);
            setFile(null);
          }}
        >
          Import backup
        </button>
      </div>
      {file && <p className="mt-2 text-[10px] text-gray-400">Selected: {file.name}</p>}
      {error && <p role="alert" className="mt-3 text-xs text-red-400">{error}</p>}
      {status && <p role="status" className="mt-3 text-xs text-emerald-400">{status}</p>}
    </section>
  );
}
