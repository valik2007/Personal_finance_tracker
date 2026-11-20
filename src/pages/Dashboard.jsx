import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  detectCsvColumns,
  getTransactionFingerprint,
  parseCsv,
  parsePdfStatement,
  previewCsvTransactions,
} from "../statementImport.js";
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  formatCurrency,
  getTransactionCurrency,
  sumByCurrency,
} from "../currency.js";
import {
  BackupTools,
  RecurringPaymentsPanel,
  SavingsGoalsPanel,
  TransactionManager,
} from "../components/FinanceFeatures.jsx";
import {
  mergeFinanceBackup,
  parseFinanceBackup,
  transactionsToCsv,
} from "../financeBackup.js";
import {
  getCashFlowSeries,
  getMonthComparison,
  getPercentChange,
} from "../financeMetrics.js";

const expenseCategories = ["Housing", "Food & groceries", "Shopping", "Transport", "Other"];
const incomeCategories = ["Salary", "Freelance", "Investment", "Gift", "Other"];
const chartColors = ["#10b981", "#34d399", "#059669", "#6ee7b7", "#047857", "#a3e635"];

function getCashFlow(transactions, now, currency) {
  const points = getCashFlowSeries(transactions, now, currency);
  const maxAmount = Math.max(1, ...points.flatMap(({ income, expenses }) => [income, expenses]));
  const makePath = (key) =>
    points
      .map((point, index) => {
        const x = (index / (points.length - 1)) * 500;
        const y = 130 - (point[key] / maxAmount) * 100;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

  return { points, incomePath: makePath("income"), expensesPath: makePath("expenses") };
}

function getComparisonNote(current, previous) {
  const change = getPercentChange(current, previous);
  if (change === null) {
    return current === 0 ? "No previous-month baseline" : "New this month";
  }
  if (change === 0) return "No change vs. last month";
  return `${change > 0 ? "↗" : "↘"} ${Math.abs(change).toFixed(1)}% vs. last month`;
}

function getSavedUser() {
  const savedUser =
    localStorage.getItem("currentUser") ||
    sessionStorage.getItem("currentUser");
  return savedUser ? JSON.parse(savedUser) : null;
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function localDateInputValue(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function transactionDateFromInput(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function advanceRecurringDate(value, frequency) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (frequency === "weekly") {
    date.setDate(date.getDate() + 7);
  } else if (frequency === "monthly") {
    date.setDate(1);
    date.setMonth(date.getMonth() + 1);
    date.setDate(Math.min(day, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
  } else {
    const nextYear = date.getFullYear() + 1;
    date.setDate(1);
    date.setFullYear(nextYear);
    date.setDate(Math.min(day, new Date(nextYear, month, 0).getDate()));
  }
  return localDateInputValue(date);
}

function Dashboard() {
  const navigate = useNavigate();
  const [user] = useState(getSavedUser);
  const [transactions, setTransactions] = useState(() =>
    user
      ? JSON.parse(localStorage.getItem(`transactions_${user.email}`) || "[]")
      : []
  );
  const [budgets, setBudgets] = useState(() =>
    user
      ? JSON.parse(localStorage.getItem(`budgets_${user.email}`) || "[]")
      : []
  );
  const [savingsGoals, setSavingsGoals] = useState(() =>
    user
      ? JSON.parse(localStorage.getItem(`savingsGoals_${user.email}`) || "[]")
      : []
  );
  const [recurringPayments, setRecurringPayments] = useState(() =>
    user
      ? JSON.parse(localStorage.getItem(`recurringPayments_${user.email}`) || "[]")
      : []
  );
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(incomeCategories[0]);
  const [type, setType] = useState("income");
  const [transactionCurrency, setTransactionCurrency] = useState(DEFAULT_CURRENCY);
  const [cashFlowCurrency, setCashFlowCurrency] = useState(DEFAULT_CURRENCY);
  const [breakdownCurrency, setBreakdownCurrency] = useState(DEFAULT_CURRENCY);
  const [breakdownType, setBreakdownType] = useState("expense");
  const [transactionError, setTransactionError] = useState("");
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState(expenseCategories[0]);
  const [budgetCurrency, setBudgetCurrency] = useState(DEFAULT_CURRENCY);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetError, setBudgetError] = useState("");
  const [statement, setStatement] = useState(null);
  const [statementMapping, setStatementMapping] = useState(null);
  const [statementCategoryOverrides, setStatementCategoryOverrides] = useState({});
  const [statementError, setStatementError] = useState("");
  const [statementStatus, setStatementStatus] = useState("");
  const [backupError, setBackupError] = useState("");
  const [backupStatus, setBackupStatus] = useState("");
  const [currentMonth] = useState(() => new Date());

  useEffect(() => {
    if (!user) navigate("/login");
  }, [navigate, user]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    setTransactionError("");
    const parsedAmount = Number(amount);
    if (!text.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setTransactionError("Enter a description and an amount greater than zero.");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      text: text.trim(),
      amount: parsedAmount,
      category,
      type,
      currency: transactionCurrency,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);

    localStorage.setItem(
      `transactions_${user.email}`,
      JSON.stringify(updatedTransactions)
    );

    setText("");
    setAmount("");
    setTransactionError("");
  };

  const handleDeleteTransaction = (id) => {
    const updatedTransactions = transactions.filter((t) => t.id !== id);
    setTransactions(updatedTransactions);
    localStorage.setItem(
      `transactions_${user.email}`,
      JSON.stringify(updatedTransactions)
    );
  };

  const handleUpdateTransaction = (id, changes) => {
    const updatedTransactions = transactions.map((transaction) =>
      transaction.id === id ? { ...transaction, ...changes } : transaction
    );
    setTransactions(updatedTransactions);
    localStorage.setItem(
      `transactions_${user.email}`,
      JSON.stringify(updatedTransactions)
    );
  };

  const saveSavingsGoals = (updatedGoals) => {
    setSavingsGoals(updatedGoals);
    localStorage.setItem(
      `savingsGoals_${user.email}`,
      JSON.stringify(updatedGoals)
    );
  };

  const handleAddSavingsGoal = (goal) => {
    saveSavingsGoals([{ ...goal, id: createId() }, ...savingsGoals]);
  };

  const handleUpdateSavingsGoal = (id, changes) => {
    saveSavingsGoals(
      savingsGoals.map((goal) =>
        goal.id === id ? { ...goal, ...changes } : goal
      )
    );
  };

  const handleDeleteSavingsGoal = (id) => {
    saveSavingsGoals(savingsGoals.filter((goal) => goal.id !== id));
  };

  const saveRecurringPayments = (updatedPayments) => {
    setRecurringPayments(updatedPayments);
    localStorage.setItem(
      `recurringPayments_${user.email}`,
      JSON.stringify(updatedPayments)
    );
  };

  const handleAddRecurringPayment = (payment) => {
    saveRecurringPayments([
      { ...payment, id: createId() },
      ...recurringPayments,
    ]);
  };

  const handleDeleteRecurringPayment = (id) => {
    saveRecurringPayments(
      recurringPayments.filter((payment) => payment.id !== id)
    );
  };

  const handleRecordRecurringPayment = (payment) => {
    if (!window.confirm(`Add "${payment.description}" as a transaction now?`)) {
      return;
    }

    const updatedTransactions = [
      {
        id: createId(),
        text: payment.description,
        amount: Number(payment.amount),
        category: payment.category,
        type: payment.type,
        currency: payment.currency,
        date: transactionDateFromInput(localDateInputValue()),
      },
      ...transactions,
    ];
    setTransactions(updatedTransactions);
    localStorage.setItem(
      `transactions_${user.email}`,
      JSON.stringify(updatedTransactions)
    );
    saveRecurringPayments(
      recurringPayments.map((item) =>
        item.id === payment.id
          ? { ...item, nextDate: advanceRecurringDate(item.nextDate, item.frequency) }
          : item
      )
    );
  };

  const downloadFile = (name, contents, type) => {
    const url = URL.createObjectURL(new Blob([contents], { type }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleExportJson = () => {
    const backup = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      transactions,
      budgets,
      savingsGoals,
      recurringPayments,
    };
    downloadFile(
      `velto-backup-${localDateInputValue()}.json`,
      JSON.stringify(backup, null, 2),
      "application/json"
    );
  };

  const handleExportCsv = () => {
    downloadFile(
      `velto-transactions-${localDateInputValue()}.csv`,
      transactionsToCsv(transactions),
      "text/csv;charset=utf-8"
    );
  };

  const handleRestoreBackup = async (file) => {
    setBackupError("");
    setBackupStatus("");
    if (file.size > 20_000_000) {
      setBackupError("The backup file must be smaller than 20 MB.");
      return;
    }

    try {
      const backupData = parseFinanceBackup(JSON.parse(await file.text()));
      const { data, added } = mergeFinanceBackup(
        { transactions, budgets, savingsGoals, recurringPayments },
        backupData
      );
      setTransactions(data.transactions);
      setBudgets(data.budgets);
      saveSavingsGoals(data.savingsGoals);
      saveRecurringPayments(data.recurringPayments);
      localStorage.setItem(
        `transactions_${user.email}`,
        JSON.stringify(data.transactions)
      );
      localStorage.setItem(`budgets_${user.email}`, JSON.stringify(data.budgets));
      setBackupStatus(
        `Restored ${added.transactions} transactions, ${added.budgets} budgets, ${added.savingsGoals} goals, and ${added.recurringPayments} reminders. Existing records were kept.`
      );
    } catch (error) {
      setBackupError(
        error instanceof Error ? error.message : "Could not restore this backup."
      );
    }
  };

  const handleAddBudget = (e) => {
    e.preventDefault();
    const limit = Number(budgetAmount);
    if (!Number.isFinite(limit) || limit <= 0) {
      setBudgetError("Enter a budget amount greater than zero.");
      return;
    }

    const updatedBudgets = [
      ...budgets.filter(
        (budget) =>
          budget.category !== budgetCategory ||
          getTransactionCurrency(budget) !== budgetCurrency
      ),
      { category: budgetCategory, currency: budgetCurrency, limit },
    ];
    setBudgets(updatedBudgets);
    localStorage.setItem(`budgets_${user.email}`, JSON.stringify(updatedBudgets));
    setBudgetAmount("");
    setBudgetError("");
    setShowBudgetForm(false);
  };

  const handleDeleteBudget = (categoryToDelete, currencyToDelete) => {
    const updatedBudgets = budgets.filter(
      (budget) =>
        budget.category !== categoryToDelete ||
        getTransactionCurrency(budget) !== currencyToDelete
    );
    setBudgets(updatedBudgets);
    localStorage.setItem(`budgets_${user.email}`, JSON.stringify(updatedBudgets));
  };

  const handleStatementUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setStatementError("");
    setStatementStatus("");
    setStatement(null);
    setStatementMapping(null);
    setStatementCategoryOverrides({});
    if (file.size > 10_000_000) {
      setStatementError("The statement file must be smaller than 10 MB.");
      return;
    }

    try {
      let parsed;
      if (file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf") {
        parsed = await parsePdfStatement(file);
      } else {
        const bytes = await file.arrayBuffer();
        let contents;
        try {
          contents = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        } catch {
          contents = new TextDecoder("windows-1251").decode(bytes);
        }
        const [headers, ...rows] = parseCsv(contents);
        parsed = { headers, rows, source: "csv" };
      }
      const normalizedHeaders = parsed.headers.map((header) => header.trim());
      setStatement({
        name: file.name,
        headers: normalizedHeaders,
        rows: parsed.rows,
        source: parsed.source,
      });
      setStatementMapping(detectCsvColumns(normalizedHeaders));
    } catch (error) {
      setStatement(null);
      setStatementMapping(null);
      setStatementError(
        error instanceof Error ? error.message : "Could not read the statement file."
      );
    }
  };

  const parsedStatementPreview = useMemo(() => {
    if (!statement || !statementMapping) {
      return { transactions: [], skipped: 0, error: "" };
    }
    return previewCsvTransactions(statement.rows, statementMapping);
  }, [statement, statementMapping]);
  const statementPreview = {
    ...parsedStatementPreview,
    transactions: parsedStatementPreview.transactions.map((transaction) => ({
      ...transaction,
      category: statementCategoryOverrides[transaction.id] || transaction.category,
    })),
  };

  const handleImportStatement = () => {
    setStatementError("");
    if (statementPreview.error) {
      setStatementError(statementPreview.error);
      return;
    }

    const seen = new Set(transactions.map(getTransactionFingerprint));
    const imported = [];
    let duplicates = 0;
    statementPreview.transactions.forEach((transaction) => {
      const fingerprint = getTransactionFingerprint(transaction);
      if (seen.has(fingerprint)) {
        duplicates += 1;
        return;
      }
      seen.add(fingerprint);
      imported.push(transaction);
    });

    if (!imported.length) {
      setStatementError("All valid transactions from this file are already imported.");
      return;
    }

    const updatedTransactions = [
      ...imported.sort((a, b) => new Date(b.date) - new Date(a.date)),
      ...transactions,
    ];
    setTransactions(updatedTransactions);
    const importedCurrencies = new Set(imported.map(getTransactionCurrency));
    if (importedCurrencies.size === 1) {
      const [currency] = importedCurrencies;
      setCashFlowCurrency(currency);
      setBreakdownCurrency(currency);
      setBudgetCurrency(currency);
      setTransactionCurrency(currency);
    }
    localStorage.setItem(
      `transactions_${user.email}`,
      JSON.stringify(updatedTransactions)
    );
    setStatementStatus(
      `Imported ${imported.length} transactions. Skipped ${duplicates + statementPreview.skipped} duplicate or invalid rows.`
    );
    setStatement(null);
    setStatementMapping(null);
    setStatementCategoryOverrides({});
  };

  const transactionCurrencies = [
    ...new Set(transactions.map(getTransactionCurrency)),
  ].sort();
  const availableCurrencies = [
    ...new Set([DEFAULT_CURRENCY, ...transactionCurrencies]),
  ].sort();
  const currencyOptions = [
    ...new Set([...SUPPORTED_CURRENCIES, ...transactionCurrencies]),
  ].sort();
  const summaryCurrencies = transactionCurrencies.length
    ? transactionCurrencies
    : [DEFAULT_CURRENCY];
  const totalIncomeByCurrency = sumByCurrency(
    transactions,
    (transaction) => transaction.type === "income"
  );
  const totalExpenseByCurrency = sumByCurrency(
    transactions,
    (transaction) => transaction.type === "expense"
  );
  const balanceByCurrency = Object.fromEntries(
    summaryCurrencies.map((currency) => [
      currency,
      (totalIncomeByCurrency[currency] || 0) -
        (totalExpenseByCurrency[currency] || 0),
    ])
  );
  const monthlyComparison = Object.fromEntries(
    summaryCurrencies.map((currency) => [
      currency,
      getMonthComparison(transactions, currency, currentMonth),
    ])
  );
  const cashFlow = getCashFlow(transactions, currentMonth, cashFlowCurrency);
  const breakdownTotal = transactions
    .filter(
      (transaction) =>
        transaction.type === breakdownType &&
        getTransactionCurrency(transaction) === breakdownCurrency
    )
    .reduce((total, transaction) => total + (Number(transaction.amount) || 0), 0);
  const categorySpending = transactions
    .filter(
      (transaction) =>
        transaction.type === breakdownType &&
        getTransactionCurrency(transaction) === breakdownCurrency
    )
    .reduce((totals, transaction) => {
      const label = transaction.category || "Other";
      totals[label] = (totals[label] || 0) + (Number(transaction.amount) || 0);
      return totals;
    }, {});
  const spendingCategories = Object.entries(categorySpending)
    .map(([label, total], index) => ({
      label,
      total,
      color: chartColors[index % chartColors.length],
    }))
    .sort((a, b) => b.total - a.total);
  const donutSegments = spendingCategories.reduce(
    (result, { total, color }) => {
      const end = result.progress + (total / breakdownTotal) * 100;
      return {
        progress: end,
        stops: [...result.stops, `${color} ${result.progress}% ${end}%`],
      };
    },
    { progress: 0, stops: [] }
  );
  const donutGradient =
    breakdownTotal === 0
      ? "#1f2937"
      : `conic-gradient(${donutSegments.stops.join(", ")})`;
  const currentMonthSpending = transactions
    .filter((transaction) => {
      const date = new Date(transaction.date);
      return (
        transaction.type === "expense" &&
        !Number.isNaN(date.getTime()) &&
        date <= currentMonth &&
        date.getFullYear() === currentMonth.getFullYear() &&
        date.getMonth() === currentMonth.getMonth()
      );
    })
    .reduce((totals, transaction) => {
      const label = transaction.category || "Other";
      const key = `${getTransactionCurrency(transaction)}::${label}`;
      totals[key] = (totals[key] || 0) + (Number(transaction.amount) || 0);
      return totals;
    }, {});
  if (!user) return null;

  const userName = user.fullName?.trim() || user.email.split("@")[0];

  return (
    <div className="flex min-h-screen bg-[#0c0f0d] text-gray-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800/60 p-5 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-black text-xs">
              V
            </div>
            <span className="font-bold text-lg text-white tracking-wide">velto</span>
          </div>

          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Personal Workspace
          </div>

          <nav className="space-y-1">
            <Link
              to="/dashboard"
              aria-current="page"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-emerald-950/40 text-emerald-400 font-medium text-sm border border-emerald-500/20"
            >
              <span>📊</span> Overview
            </Link>
            <Link
              to="/analytics"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800/40 hover:text-gray-200 transition text-sm"
            >
              <span>📈</span> Analytics
            </Link>
          </nav>
        </div>

        <div>
          <div className="pt-4 border-t border-gray-800/60 mb-4 space-y-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full cursor-pointer text-left flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition text-sm font-medium"
            >
              <span>🚪</span> Log out
            </button>
          </div>

          {/* User Profile Footer */}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-800/60">
            <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-emerald-400">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate capitalize">{userName}</p>
              <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="mb-5 flex items-center justify-between border-b border-gray-800/60 pb-4 md:hidden">
          <Link to="/dashboard" className="font-bold tracking-wide text-white">
            velto
          </Link>
          <nav className="flex items-center gap-3 text-xs">
            <Link to="/dashboard" aria-current="page" className="text-emerald-400">
              Overview
            </Link>
            <Link to="/analytics" className="text-gray-400 hover:text-white">
              Analytics
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer text-red-400 hover:text-red-300"
            >
              Log out
            </button>
          </nav>
        </div>
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Workspace / Overview</div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Good day, <span className="capitalize">{userName}</span> ↗
            </h1>
            <p className="text-xs text-gray-400">Here's where your money stands today.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300">
            All-time overview · {transactions.length} transactions
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Balance Card */}
          <div className="bg-[#121c17] border border-emerald-500/30 p-5 rounded-2xl relative overflow-hidden">
            <div className="flex justify-between items-center text-xs text-emerald-400/80 mb-2 font-medium">
              <span>Total balance</span>
              <span>👛</span>
            </div>
            <div className="mb-2 flex flex-col gap-1 text-2xl font-bold text-white">
              {summaryCurrencies.map((currency) => (
                <span key={currency}>
                  {formatCurrency(balanceByCurrency[currency] || 0, currency)}
                </span>
              ))}
            </div>
            <div className="space-y-1 text-[10px] text-emerald-400">
              {summaryCurrencies.map((currency) => {
                const comparison = monthlyComparison[currency].balance;
                return (
                  <p key={currency}>
                    {currency}: {getComparisonNote(comparison.current, comparison.previous)} (balance)
                  </p>
                );
              })}
            </div>
          </div>

          {/* Income Card */}
          <div className="bg-[#121513] border border-gray-800/80 p-5 rounded-2xl">
            <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
              <span>Income</span>
              <span>↙</span>
            </div>
            <div className="mb-2 flex flex-col gap-1 text-xl font-bold text-white">
              {summaryCurrencies.map((currency) => (
                <span key={currency}>
                  {formatCurrency(totalIncomeByCurrency[currency] || 0, currency)}
                </span>
              ))}
            </div>
            <div className="space-y-1 text-[10px] text-emerald-400">
              {summaryCurrencies.map((currency) => {
                const comparison = monthlyComparison[currency];
                return (
                  <p key={currency}>
                    {formatCurrency(comparison.current.income, currency)} this month ·{" "}
                    {getComparisonNote(comparison.current.income, comparison.previous.income)}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Expenses Card */}
          <div className="bg-[#121513] border border-gray-800/80 p-5 rounded-2xl">
            <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
              <span>Expenses</span>
              <span>↗</span>
            </div>
            <div className="mb-2 flex flex-col gap-1 text-xl font-bold text-white">
              {summaryCurrencies.map((currency) => (
                <span key={currency}>
                  {formatCurrency(totalExpenseByCurrency[currency] || 0, currency)}
                </span>
              ))}
            </div>
            <div className="space-y-1 text-[10px] text-gray-400">
              {summaryCurrencies.map((currency) => {
                const comparison = monthlyComparison[currency];
                return (
                  <p key={currency}>
                    {formatCurrency(comparison.current.expenses, currency)} this month ·{" "}
                    {getComparisonNote(comparison.current.expenses, comparison.previous.expenses)}
                  </p>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column: Graph + Add Form + Recent Transactions (Spans 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cash Flow Graph Card */}
            <div className="bg-[#121513] border border-gray-800/80 p-5 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Cash flow</h3>
                  <p className="text-[11px] text-gray-500">Income and expenses over the last six months.</p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <select
                    aria-label="Cash flow currency"
                    value={cashFlowCurrency}
                    onChange={(event) => setCashFlowCurrency(event.target.value)}
                    className="rounded-lg border border-gray-800 bg-gray-900 p-2 text-[10px] text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {availableCurrencies.map((currency) => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Income
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <span className="w-2 h-2 rounded-full bg-gray-600"></span> Expenses
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative h-44 w-full">
                <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#1f2937" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#1f2937" strokeDasharray="3 3" />
                  <line x1="0" y1="130" x2="500" y2="130" stroke="#1f2937" opacity="0.4" />
                  <path
                    d={cashFlow.expensesPath}
                    fill="none"
                    stroke="#4b5563"
                    strokeWidth="2"
                  />
                  <path
                    d={cashFlow.incomePath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-gray-500">
                {cashFlow.points.map((point) => (
                  <span key={point.label}>{point.label}</span>
                ))}
              </div>
              {transactions.length === 0 && (
                <p className="mt-3 text-center text-[11px] text-gray-500">
                  Add transactions to see your cash flow.
                </p>
              )}
            </div>

            {/* Quick Add Transaction Form */}
            <div className="bg-[#121513] border border-gray-800/80 p-5 rounded-2xl">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-white">Add New Transaction</h3>
                <label className="inline-flex cursor-pointer items-center rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/10">
                  Import CSV / PDF
                  <input
                    type="file"
                    accept=".csv,.pdf,text/csv,application/pdf"
                    aria-label="Import bank statement CSV or PDF"
                    className="sr-only"
                    onChange={handleStatementUpload}
                  />
                </label>
              </div>
              <form onSubmit={handleAddTransaction} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
                <input
                  type="text"
                  placeholder="Description"
                  aria-label="Transaction description"
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="sm:col-span-2 p-2.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  aria-label="Transaction amount"
                  min="0.01"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="p-2.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <select
                  aria-label="Transaction currency"
                  value={transactionCurrency}
                  onChange={(event) => setTransactionCurrency(event.target.value)}
                  className="p-2.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {currencyOptions.map((currency) => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
                <select
                  aria-label="Transaction category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="p-2.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {(type === "income" ? incomeCategories : expenseCategories).map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <select
                  aria-label="Transaction type"
                  value={type}
                  onChange={(e) => {
                    const nextType = e.target.value;
                    setType(nextType);
                    setCategory(
                      nextType === "income" ? incomeCategories[0] : expenseCategories[0]
                    );
                  }}
                  className="p-2.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <button
                  type="submit"
                  className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-2.5 rounded-lg text-xs transition"
                >
                  Add Record
                </button>
              </form>
              {transactionError && (
                <p role="alert" className="mt-3 text-xs text-red-400">
                  {transactionError}
                </p>
              )}
              {statementError && (
                <p role="alert" className="mt-3 text-xs text-red-400">
                  {statementError}
                </p>
              )}
              {statementStatus && (
                <p role="status" className="mt-3 text-xs text-emerald-400">
                  {statementStatus}
                </p>
              )}

              {statement && statementMapping && (
                <div className="mt-5 rounded-xl border border-gray-800 bg-gray-900/60 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-semibold text-white">Review your statement</h4>
                      <p className="mt-1 text-[10px] text-gray-500">{statement.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setStatement(null);
                        setStatementMapping(null);
                        setStatementCategoryOverrides({});
                        setStatementError("");
                      }}
                      className="cursor-pointer text-xs text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="mb-3 text-[10px] leading-relaxed text-gray-500">
                    Your file is processed in this browser and is not uploaded. Check the detected columns before importing.
                  </p>
                  <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { key: "dateIndex", label: "Date column" },
                      { key: "descriptionIndex", label: "Description column" },
                      { key: "amountIndex", label: "Amount column" },
                      { key: "debitIndex", label: "Debit column (optional)" },
                      { key: "creditIndex", label: "Credit column (optional)" },
                      { key: "typeIndex", label: "Type column (optional)" },
                      { key: "categoryIndex", label: "Category column (optional)" },
                      { key: "currencyIndex", label: "Currency column (optional)" },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex flex-col gap-1 text-[10px] text-gray-400">
                        {label}
                        <select
                          value={statementMapping[key]}
                          onChange={(event) => {
                            setStatementCategoryOverrides({});
                            setStatementMapping((current) => ({
                              ...current,
                              [key]: Number(event.target.value),
                            }));
                          }}
                          className="rounded-lg border border-gray-800 bg-[#0c0f0d] p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        >
                          <option value={-1}>Not selected</option>
                          {statement.headers.map((header, index) => (
                            <option key={`${header}-${index}`} value={index}>
                              {header || `Column ${index + 1}`}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>

                  {statementPreview.error ? (
                    <p role="alert" className="mb-3 text-xs text-red-400">
                      {statementPreview.error}
                    </p>
                  ) : (
                    <>
                      <p className="mb-2 text-[11px] text-gray-400">
                        {statementPreview.transactions.length} ready to import ·{" "}
                        {statementPreview.transactions.filter((transaction) => transaction.type === "expense").length} expenses ·{" "}
                        {statementPreview.transactions.filter((transaction) => transaction.type === "income").length} income ·{" "}
                        {statementPreview.skipped} invalid rows skipped
                      </p>
                      <p className="mb-2 text-[10px] text-gray-500">
                        Check the suggested category for each transaction. Unrecognized items default to Other.
                      </p>
                      <div className="mb-4 max-h-52 overflow-auto rounded-lg border border-gray-800">
                        {statementPreview.transactions.map((transaction, index) => {
                          const categories =
                            transaction.type === "income" ? incomeCategories : expenseCategories;
                          const categoryOptions = categories.includes(transaction.category)
                            ? categories
                            : [transaction.category, ...categories];
                          return (
                            <div
                              key={transaction.id}
                              className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800/70 px-3 py-2 last:border-b-0"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[11px] font-medium text-white">
                                  {transaction.text}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {transaction.date} · {transaction.type}
                                </p>
                              </div>
                              <select
                                aria-label={`Category for transaction ${index + 1}`}
                                value={transaction.category}
                                onChange={(event) =>
                                  setStatementCategoryOverrides((current) => ({
                                    ...current,
                                    [transaction.id]: event.target.value,
                                  }))
                                }
                                className="w-36 shrink-0 rounded-lg border border-gray-800 bg-[#0c0f0d] p-2 text-[10px] text-white focus:border-emerald-500 focus:outline-none"
                              >
                                {categoryOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                              <span
                                className={`shrink-0 text-[11px] font-semibold ${
                                  transaction.type === "income" ? "text-emerald-400" : "text-gray-200"
                                }`}
                              >
                                {transaction.type === "income" ? "+" : "-"}
                                {formatCurrency(transaction.amount, transaction.currency)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleImportStatement}
                    disabled={Boolean(statementPreview.error) || statementPreview.transactions.length === 0}
                    className="w-full cursor-pointer rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-black transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Import {statementPreview.transactions.length} transactions
                  </button>
                </div>
              )}
            </div>

            <TransactionManager
              transactions={transactions}
              currencyOptions={currencyOptions}
              expenseCategories={expenseCategories}
              incomeCategories={incomeCategories}
              onUpdate={handleUpdateTransaction}
              onDelete={handleDeleteTransaction}
            />
          </div>

          {/* Right Column: Breakdown + Monthly Budgets */}
          <div className="space-y-6">
            <div className="bg-[#121513] border border-gray-800/80 p-5 rounded-2xl">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-white">Spending breakdown</h3>
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Spending breakdown currency"
                    value={breakdownCurrency}
                    onChange={(event) => setBreakdownCurrency(event.target.value)}
                    className="rounded-lg border border-gray-800 bg-gray-900 p-2 text-[10px] text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {availableCurrencies.map((currency) => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                  <div className="flex rounded-lg border border-gray-800 bg-gray-900 p-0.5">
                    {[
                      { value: "expense", label: "Expenses" },
                      { value: "income", label: "Income" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setBreakdownType(option.value)}
                        aria-pressed={breakdownType === option.value}
                        className={`cursor-pointer rounded-md px-2 py-1 text-[10px] font-medium transition ${
                          breakdownType === option.value
                            ? "bg-emerald-500 text-black"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative flex items-center justify-center my-6">
                <div
                  className="w-40 h-40 rounded-full flex items-center justify-center"
                  style={{ background: donutGradient }}
                >
                  <div className="w-28 h-28 bg-[#121513] rounded-full flex flex-col items-center justify-center text-center">
                    <span className="text-lg font-bold text-white">
                      {formatCurrency(breakdownTotal, breakdownCurrency)}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {breakdownType === "expense" ? "Total expenses" : "Total income"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-xs pt-2">
                {spendingCategories.length ? spendingCategories.map((item) => (
                  <div key={item.label} className="flex justify-between items-center gap-3">
                    <span className="flex min-w-0 items-center gap-2 text-gray-400">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-[10px] text-gray-500">
                        {breakdownTotal ? `${Math.round((item.total / breakdownTotal) * 100)}%` : ""}
                      </span>
                      <span className="font-semibold text-white">
                        {formatCurrency(item.total, breakdownCurrency)}
                      </span>
                    </span>
                  </div>
                )) : (
                  <p className="text-center text-[11px] text-gray-500">
                    Add {breakdownType === "expense" ? "an expense" : "income"} to see the breakdown.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-[#121513] border border-gray-800/80 p-5 rounded-2xl">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-white">Monthly budgets</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowBudgetForm((show) => !show);
                    setBudgetError("");
                  }}
                  className="cursor-pointer text-[11px] font-medium text-emerald-400 hover:text-emerald-300"
                >
                  {showBudgetForm ? "Cancel" : "Add budget"}
                </button>
              </div>
              <p className="mb-4 text-[11px] text-gray-500">
                Set a monthly limit for each spending category.
              </p>

              {showBudgetForm && (
                <form onSubmit={handleAddBudget} className="mb-4 space-y-2">
                  <select
                    aria-label="Budget currency"
                    value={budgetCurrency}
                    onChange={(event) => setBudgetCurrency(event.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {currencyOptions.map((currency) => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                  <select
                    aria-label="Budget category"
                    value={budgetCategory}
                    onChange={(e) => setBudgetCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {expenseCategories.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    aria-label="Monthly budget amount"
                    placeholder="Monthly limit"
                    min="0.01"
                    step="0.01"
                    required
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                  {budgetError && (
                    <p role="alert" className="text-[11px] text-red-400">{budgetError}</p>
                  )}
                  <button
                    type="submit"
                    className="w-full cursor-pointer rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-black transition hover:bg-emerald-500"
                  >
                    Save budget
                  </button>
                </form>
              )}

              {budgets.length ? (
                <div className="space-y-4 text-xs">
                  {budgets.map((budget) => {
                    const currency = getTransactionCurrency(budget);
                    const spent =
                      currentMonthSpending[`${currency}::${budget.category}`] || 0;
                    const limit = Number(budget.limit) || 0;
                    const progress = limit ? Math.min((spent / limit) * 100, 100) : 0;
                    const overLimit = spent > limit;
                    return (
                      <div key={`${currency}::${budget.category}`}>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="truncate font-medium text-gray-300">
                            {budget.category} · {currency}
                          </span>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-[11px] text-gray-400">
                              {formatCurrency(spent, currency)} / {formatCurrency(limit, currency)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteBudget(budget.category, currency)}
                              aria-label={`Delete ${budget.category} ${currency} budget`}
                              className="cursor-pointer text-gray-500 hover:text-red-400"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-900">
                          <div
                            className={`h-full rounded-full ${overLimit ? "bg-red-400" : "bg-emerald-500"}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        {overLimit && (
                          <p className="mt-1 text-[10px] text-red-400">
                            Over budget by {formatCurrency(spent - limit, currency)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-2 text-center text-[11px] text-gray-500">
                  No budgets yet. Add one to track monthly spending.
                </p>
              )}
            </div>
            <SavingsGoalsPanel
              goals={savingsGoals}
              currencyOptions={currencyOptions}
              onAdd={handleAddSavingsGoal}
              onUpdate={handleUpdateSavingsGoal}
              onDelete={handleDeleteSavingsGoal}
            />
            <RecurringPaymentsPanel
              recurringPayments={recurringPayments}
              currencyOptions={currencyOptions}
              expenseCategories={expenseCategories}
              incomeCategories={incomeCategories}
              onAdd={handleAddRecurringPayment}
              onDelete={handleDeleteRecurringPayment}
              onRecord={handleRecordRecurringPayment}
            />
            <BackupTools
              onExportJson={handleExportJson}
              onExportCsv={handleExportCsv}
              onRestore={handleRestoreBackup}
              status={backupStatus}
              error={backupError}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;