import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DEFAULT_CURRENCY,
  formatCurrency,
  getTransactionCurrency,
  sumByCurrency,
} from "../currency.js";

function Analytics() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const savedUser =
      localStorage.getItem("currentUser") ||
      sessionStorage.getItem("currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [transactions] = useState(() => {
    if (!user?.email) return [];
    return JSON.parse(
      localStorage.getItem(`transactions_${user.email}`) || "[]"
    );
  });

  useEffect(() => {
    if (!user) navigate("/login");
  }, [navigate, user]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    navigate("/login");
  };

  if (!user) return null;

  const userName = user.fullName?.trim() || user.email.split("@")[0];
  const currencies = [
    ...new Set(transactions.map(getTransactionCurrency)),
  ].sort();
  if (!currencies.length) currencies.push(DEFAULT_CURRENCY);
  const income = sumByCurrency(
    transactions,
    (transaction) => transaction.type === "income"
  );
  const expenses = sumByCurrency(
    transactions,
    (transaction) => transaction.type === "expense"
  );
  const balance = Object.fromEntries(
    currencies.map((currency) => [
      currency,
      (income[currency] || 0) - (expenses[currency] || 0),
    ])
  );
  const categoryTotals = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((totals, transaction) => {
      const currency = getTransactionCurrency(transaction);
      const category = transaction.category || "Other";
      if (!totals[currency]) totals[currency] = {};
      totals[currency][category] =
        (totals[currency][category] || 0) + (Number(transaction.amount) || 0);
      return totals;
    }, {});
  const categoryCount = Object.values(categoryTotals).reduce(
    (total, categories) => total + Object.keys(categories).length,
    0
  );

  return (
    <div className="flex min-h-screen bg-[#0c0f0d] font-sans text-gray-200">
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-gray-800/60 p-5 md:flex">
        <div>
          <Link to="/dashboard" className="mb-8 flex items-center gap-2 no-underline">
            <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-black">
              V
            </span>
            <span className="text-lg font-bold tracking-wide text-white">velto</span>
          </Link>
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Personal Workspace
          </div>
          <nav className="space-y-1">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:bg-gray-800/40 hover:text-gray-200"
            >
              <span>📊</span> Overview
            </Link>
            <Link
              to="/analytics"
              aria-current="page"
              className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-950/40 px-3 py-2 text-sm font-medium text-emerald-400"
            >
              <span>📈</span> Analytics
            </Link>
          </nav>
        </div>

        <div>
          <div className="mb-4 border-t border-gray-800/60 pt-4">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium text-red-400 transition hover:bg-red-500/10"
            >
              🚪 Log out
            </button>
          </div>
          <div className="flex items-center gap-3 border-t border-gray-800/60 pt-3">
            <div className="flex size-8 items-center justify-center rounded-full border border-gray-700 bg-gray-800 text-xs font-bold text-emerald-400">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-semibold capitalize text-white">{userName}</p>
              <p className="truncate text-[11px] text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto p-5 md:p-8">
        <div className="mb-5 flex items-center justify-between border-b border-gray-800/60 pb-4 md:hidden">
          <Link to="/dashboard" className="font-bold tracking-wide text-white">
            velto
          </Link>
          <nav className="flex items-center gap-3 text-xs">
            <Link to="/dashboard" className="text-gray-400 hover:text-white">
              Overview
            </Link>
            <Link to="/analytics" aria-current="page" className="text-emerald-400">
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
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs text-gray-500">
              <Link to="/dashboard" className="text-gray-400 hover:text-white">Workspace</Link>
              {" / "}Analytics
            </p>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="mt-1 text-xs text-gray-400">
              Totals and category breakdowns stay separate by currency.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex w-fit items-center rounded-lg border border-gray-800 px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-emerald-500/40 hover:text-emerald-400"
          >
            Back to overview
          </Link>
        </div>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Total income", value: income, color: "text-emerald-400" },
            { label: "Total expenses", value: expenses, color: "text-gray-200" },
            { label: "Net balance", value: balance, color: "text-white" },
          ].map((metric) => (
            <article
              key={metric.label}
              className="rounded-2xl border border-gray-800/80 bg-[#121513] p-5"
            >
              <p className="mb-2 text-xs text-gray-400">{metric.label}</p>
              <div className={`flex flex-col gap-1 text-xl font-bold ${metric.color}`}>
                {currencies.map((currency) => (
                  <span key={currency}>
                    {formatCurrency(metric.value[currency] || 0, currency)}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mb-6 rounded-2xl border border-gray-800/80 bg-[#121513] p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Expenses by category</h2>
              <p className="mt-1 text-[11px] text-gray-500">Totals are grouped by currency.</p>
            </div>
            <span className="text-xs text-gray-400">{categoryCount} categories</span>
          </div>
          {categoryCount ? (
            <div className="space-y-6">
              {Object.entries(categoryTotals).map(([currency, totals]) => {
                const categories = Object.entries(totals).sort((a, b) => b[1] - a[1]);
                const maxCategoryTotal = Math.max(1, ...categories.map(([, total]) => total));
                return (
                  <div key={currency}>
                    <h3 className="mb-3 text-xs font-semibold text-emerald-400">{currency}</h3>
                    <div className="space-y-4">
                      {categories.map(([category, total]) => (
                        <div key={category}>
                          <div className="mb-1 flex justify-between gap-3 text-xs">
                            <span className="text-gray-300">{category}</span>
                            <span className="text-gray-400">{formatCurrency(total, currency)}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-gray-900">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${(total / maxCategoryTotal) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-gray-500">
              No expenses yet. Add an expense from the overview to see analytics.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-gray-800/80 bg-[#121513] p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-white">All transactions</h2>
            <span className="text-xs text-gray-500">{transactions.length} total</span>
          </div>
          {transactions.length ? (
            <div className="divide-y divide-gray-800/60">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 py-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{transaction.text}</p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      {transaction.category || "Other"} · {transaction.date || "Date unavailable"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 font-semibold ${
                      transaction.type === "income" ? "text-emerald-400" : "text-gray-200"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount, getTransactionCurrency(transaction))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-gray-500">
              No transactions yet. Add one from the overview.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default Analytics;
