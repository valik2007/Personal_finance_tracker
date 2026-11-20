import { useState } from "react";
import Logo from "./Logo.jsx";
import Icon from "./Icon.jsx";
import SectionEyebrow from "./SectionEyebrow.jsx";
import layoutDashboard from "../assets/layout-dashboard.svg";
import arrowLeftRight from "../assets/arrow-left-right.svg";
import chartPie from "../assets/chart-pie.svg";
import settings from "../assets/settings.svg";
import circleHelp from "../assets/circle-help.svg";
import calendarDays from "../assets/calendar-days.svg";
import wallet from "../assets/wallet.svg";
import arrowDownLeft from "../assets/arrow-down-left.svg";
import arrowUpRightMuted from "../assets/arrow-up-right-muted.svg";
import signal from "../assets/signal.svg";
import markerMuted from "../assets/marker-muted.svg";
import ellipsis from "../assets/ellipsis.svg";
import markerHousing from "../assets/marker-housing.svg";
import markerFood from "../assets/marker-food.svg";
import markerOther from "../assets/marker-other.svg";
import briefcase from "../assets/briefcase.svg";
import shoppingBasket from "../assets/shopping-basket.svg";
import music from "../assets/music.svg";
import {
  DEFAULT_CURRENCY,
  formatCurrency,
  getTransactionCurrency,
  sumByCurrency,
} from "../currency.js";
import {
  getCashFlowSeries,
  getMonthComparison,
  getPercentChange,
  getSpendingByCategory,
} from "../financeMetrics.js";

const chartColors = ["#67E8B0", "#398468", "#51665C", "#A3C9B6", "#2B6D55"];
const donutRadius = 69.54;
const donutCircumference = 2 * Math.PI * donutRadius;

function loadPreviewData() {
  const savedUser =
    localStorage.getItem("currentUser") ||
    sessionStorage.getItem("currentUser");
  const user = savedUser ? JSON.parse(savedUser) : null;
  return {
    userName: user?.fullName?.trim() || "",
    transactions: user?.email
      ? JSON.parse(localStorage.getItem(`transactions_${user.email}`) || "[]")
      : [],
    budgets: user?.email
      ? JSON.parse(localStorage.getItem(`budgets_${user.email}`) || "[]")
      : [],
  };
}

function getComparisonNote(current, previous) {
  const change = getPercentChange(current, previous);
  if (change === null) {
    return current === 0 ? "No previous-month baseline" : "New this month";
  }
  if (change === 0) return "No change vs. last month";
  return `${change > 0 ? "↗" : "↘"} ${Math.abs(change).toFixed(1)}% vs. last month`;
}

function getCashFlowPath(points, key, maxAmount, closeToBaseline = false) {
  const pointsPath = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 688;
      const y = 142 - (point[key] / maxAmount) * 130;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
  return closeToBaseline ? `${pointsPath} L 688 150 L 0 150 Z` : pointsPath;
}

function formatAxisValue(value, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(value);
}

function CashFlowChart({ points, currency, currencies, onCurrencyChange }) {
  const dataMaxAmount = Math.max(
    0,
    ...points.flatMap(({ income, expenses }) => [income, expenses])
  );
  const maxAmount = Math.max(1, dataMaxAmount);
  const incomePath = getCashFlowPath(points, "income", maxAmount);
  const expensesPath = getCashFlowPath(points, "expenses", maxAmount);
  const incomeArea = getCashFlowPath(points, "income", maxAmount, true);
  const latest = points[points.length - 1];

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-5 rounded-card border border-border bg-surface p-[18px] lg:p-[22px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[17px] text-ink">Cash flow</p>
          <p className="mt-1.5 text-[12px] text-muted">Monthly income and expenses from your transactions.</p>
        </div>
        <select
          aria-label="Cash flow currency"
          value={currency}
          onChange={(event) => onCurrencyChange(event.target.value)}
          className="max-w-24 rounded-lg border border-border bg-elevated px-2.5 py-1.5 text-[11px] text-ink"
        >
          {currencies.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-[18px]">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 overflow-hidden">
            <Icon src={signal} alt="" />
          </span>
          <p className="text-[11px] text-muted">Income</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 overflow-hidden">
            <Icon src={markerMuted} alt="" />
          </span>
          <p className="text-[11px] text-muted">Expenses</p>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex h-[150px] w-8 flex-col justify-between text-[10px] text-subtle">
          <p>{formatAxisValue(dataMaxAmount, currency)}</p>
          <p>{formatAxisValue(dataMaxAmount * 0.67, currency)}</p>
          <p>{formatAxisValue(dataMaxAmount * 0.33, currency)}</p>
          <p>{formatAxisValue(0, currency)}</p>
        </div>
        <div className="relative h-[150px] min-w-0 flex-1">
          <div className="flex h-full flex-col justify-between">
            <div className="h-px bg-border" />
            <div className="h-px bg-border" />
            <div className="h-px bg-border" />
            <div className="h-px bg-border" />
          </div>
          <svg
            className="absolute inset-0 size-full"
            viewBox="0 0 688 150"
            preserveAspectRatio="none"
            role="img"
            aria-label={`Income and expenses over the last six months in ${currency}`}
          >
            <path d={incomeArea} fill="#67E8B0" fillOpacity="0.12" />
            <path d={expensesPath} fill="none" stroke="#697571" strokeWidth="2" />
            <path d={incomePath} fill="none" stroke="#67E8B0" strokeWidth="2.5" />
            <circle
              cx="688"
              cy={142 - (latest.income / maxAmount) * 130}
              r="4"
              fill="#67E8B0"
            />
          </svg>
        </div>
      </div>
      <div className="flex justify-between pl-11 text-[10px] text-subtle">
        {points.map((point) => (
          <p key={`${point.label}-${point.income}-${point.expenses}`}>{point.label}</p>
        ))}
      </div>
      <p className="text-center text-[10px] text-subtle">
        Latest month: {formatCurrency(latest.income, currency)} income ·{" "}
        {formatCurrency(latest.expenses, currency)} expenses
      </p>
    </div>
  );
}

export default function ProductPreview() {
  const [preview] = useState(loadPreviewData);
  const [now] = useState(() => new Date());
  const { transactions, budgets } = preview;
  const currencies = [
    ...new Set([
      DEFAULT_CURRENCY,
      ...transactions.map(getTransactionCurrency),
      ...budgets.map(getTransactionCurrency),
    ]),
  ].sort();
  const transactionCurrencies = [
    ...new Set(transactions.map(getTransactionCurrency)),
  ].sort();
  const summaryCurrencies = transactionCurrencies.length
    ? transactionCurrencies
    : [DEFAULT_CURRENCY];
  const [cashFlowCurrency, setCashFlowCurrency] = useState(
    summaryCurrencies[0] || DEFAULT_CURRENCY
  );
  const [spendingCurrency, setSpendingCurrency] = useState(
    summaryCurrencies[0] || DEFAULT_CURRENCY
  );
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthComparisons = Object.fromEntries(
    summaryCurrencies.map((currency) => [
      currency,
      getMonthComparison(transactions, currency, now),
    ])
  );
  const incomeByCurrency = sumByCurrency(
    transactions,
    (transaction) => transaction.type === "income"
  );
  const expensesByCurrency = sumByCurrency(
    transactions,
    (transaction) => transaction.type === "expense"
  );
  const balanceByCurrency = Object.fromEntries(
    summaryCurrencies.map((currency) => [
      currency,
      (incomeByCurrency[currency] || 0) - (expensesByCurrency[currency] || 0),
    ])
  );
  const summary = [
    {
      label: "Total balance",
      icon: wallet,
      highlight: true,
      values: summaryCurrencies.map((currency) => ({
        currency,
        amount: balanceByCurrency[currency] || 0,
        note: getComparisonNote(
          monthComparisons[currency].balance.current,
          monthComparisons[currency].balance.previous
        ),
      })),
    },
    {
      label: "Income",
      icon: arrowDownLeft,
      values: summaryCurrencies.map((currency) => ({
        currency,
        amount: monthComparisons[currency].current.income,
        note: getComparisonNote(
          monthComparisons[currency].current.income,
          monthComparisons[currency].previous.income
        ),
      })),
    },
    {
      label: "Expenses",
      icon: arrowUpRightMuted,
      values: summaryCurrencies.map((currency) => ({
        currency,
        amount: monthComparisons[currency].current.expenses,
        note: getComparisonNote(
          monthComparisons[currency].current.expenses,
          monthComparisons[currency].previous.expenses
        ),
      })),
    },
  ];
  const cashFlowPoints = getCashFlowSeries(transactions, now, cashFlowCurrency);
  const spendingByCategory = getSpendingByCategory(
    transactions,
    currentMonth,
    spendingCurrency,
    "expense",
    now
  );
  const spendingCategories = Object.entries(spendingByCategory)
    .map(([label, amount], index) => ({
      label,
      amount,
      color: chartColors[index % chartColors.length],
      icon:
        /housing/i.test(label)
          ? markerHousing
          : /food|grocer/i.test(label)
            ? markerFood
            : markerOther,
    }))
    .sort((a, b) => b.amount - a.amount);
  const totalSpent = spendingCategories.reduce(
    (total, category) => total + category.amount,
    0
  );
  const spendingSegments = spendingCategories.reduce((segments, category) => {
    const previous = segments[segments.length - 1];
    const length = totalSpent
      ? (category.amount / totalSpent) * donutCircumference
      : 0;
    return [
      ...segments,
      {
        ...category,
        length,
        offset: previous ? previous.offset + previous.length : 0,
      },
    ];
  }, []);
  const recentTransactions = transactions.slice(0, 3);
  const monthRange = `${now.toLocaleDateString("en-US", { month: "short" })} 1 – ${now.getDate()}, ${now.getFullYear()}`;
  const displayName = preview.userName || "Personal account";
  const initials = preview.userName
    ? preview.userName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "V";

  return (
    <section className="flex flex-col gap-[18px] px-5 pb-9 lg:px-20">
      <div className="flex items-center justify-between">
        <SectionEyebrow>ONE CLEAR VIEW. EVERY POSSIBILITY.</SectionEyebrow>
        <p className="hidden text-[11px] tracking-[0.4px] text-subtle lg:block">
          YOUR PERSONAL FINANCE, REIMAGINED
        </p>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-border bg-canvas lg:flex">
        <aside className="hidden w-[174px] shrink-0 flex-col gap-9 border-r border-border bg-surface px-[18px] pt-7 pb-6 lg:flex">
          <Logo size="sm" />
          <div>
            <p className="text-[9px] tracking-[1.4px] text-subtle">PERSONAL WORKSPACE</p>
            <div className="mt-5 flex flex-col gap-[7px]">
              <div className="flex h-[43px] items-center gap-3 rounded-[10px] bg-emerald-soft px-3">
                <span className="size-[17px] overflow-hidden">
                  <Icon src={layoutDashboard} alt="" />
                </span>
                <p className="text-[12px] font-semibold text-emerald">Overview</p>
              </div>
              <div className="flex h-[43px] items-center gap-3 px-3">
                <span className="size-[17px] overflow-hidden">
                  <Icon src={arrowLeftRight} alt="" />
                </span>
                <p className="text-[12px] text-muted">Transactions</p>
              </div>
              <div className="flex h-[43px] items-center gap-3 px-3">
                <span className="size-[17px] overflow-hidden">
                  <Icon src={chartPie} alt="" />
                </span>
                <p className="text-[12px] text-muted">Budgets</p>
              </div>
            </div>
          </div>
          <div className="mt-auto flex flex-col gap-[18px]">
            <div className="flex items-center gap-3">
              <span className="size-[17px] overflow-hidden">
                <Icon src={settings} alt="" />
              </span>
              <p className="text-[12px] text-muted">Settings</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="size-[17px] overflow-hidden">
                <Icon src={circleHelp} alt="" />
              </span>
              <p className="text-[12px] text-muted">Help & support</p>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-track text-[11px]">
              {initials}
              </div>
              <div>
              <p className="text-[12px]">{displayName}</p>
                <p className="text-[10px] text-muted">Personal account</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="hidden h-[52px] items-center border-b border-border px-[26px] text-[11px] text-muted lg:flex">
            Workspace / <span className="text-ink">Overview</span>
          </div>

          <div className="flex flex-col gap-[18px] p-3.5 lg:p-[26px]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[23px] tracking-[-0.8px]">
                  {preview.userName ? `Good morning, ${preview.userName} ↗` : "Your finances, at a glance"}
                </p>
                <p className="mt-1.5 text-[12px] text-muted">
                  {preview.userName
                    ? "Here’s where your money stands today."
                    : "Sign in to see your transactions, spending, and budgets here."}
                </p>
              </div>
              <div className="hidden h-10 items-center gap-2.5 rounded-control border border-border bg-elevated px-4 lg:flex">
                <p className="text-[13px] font-semibold">{monthRange}</p>
                <span className="size-4 overflow-hidden">
                  <Icon src={calendarDays} alt="" />
                </span>
              </div>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {summary.map((card) => (
                <div
                  key={card.label}
                  className={`flex flex-col gap-3.5 rounded-card border p-[18px] ${
                    card.highlight
                      ? "border-emerald-border bg-emerald-soft"
                      : "border-border bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`text-[12px] ${card.highlight ? "text-emerald" : "text-muted"}`}>
                      {card.label}
                    </p>
                    <span className="size-4 overflow-hidden">
                      <Icon src={card.icon} alt="" />
                    </span>
                  </div>
                  {card.values.map((value) => (
                    <div key={value.currency}>
                      <p className="text-[25px] tracking-[-1px]">
                        {formatCurrency(value.amount, value.currency)}
                      </p>
                      <p className={`mt-1 text-[10px] ${card.highlight ? "text-emerald" : "text-muted"}`}>
                        {value.currency} · {value.note}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-[18px] lg:flex-row">
              <CashFlowChart
                points={cashFlowPoints}
                currency={cashFlowCurrency}
                currencies={currencies}
                onCurrencyChange={setCashFlowCurrency}
              />
              <div className="hidden w-[260px] shrink-0 flex-col gap-[19px] rounded-card border border-border bg-surface p-[22px] lg:flex">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[17px]">Spending breakdown</p>
                  <select
                    aria-label="Spending breakdown currency"
                    value={spendingCurrency}
                    onChange={(event) => setSpendingCurrency(event.target.value)}
                    className="max-w-20 rounded-lg border border-border bg-elevated px-2 py-1 text-[10px] text-ink"
                  >
                    {currencies.map((currency) => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
                <div className="relative mx-auto size-[152px]">
                  <svg
                    viewBox="0 0 152 152"
                    className="absolute inset-0 size-full -rotate-90"
                    aria-hidden="true"
                  >
                    <circle
                      cx="76"
                      cy="76"
                      r={donutRadius}
                      fill="none"
                      stroke="#202628"
                      strokeWidth="12.92"
                    />
                    {spendingSegments.map((segment) => {
                      return (
                        <circle
                          key={segment.label}
                          cx="76"
                          cy="76"
                          r={donutRadius}
                          fill="none"
                          stroke={segment.color}
                          strokeWidth="12.92"
                          strokeDasharray={`${segment.length} ${donutCircumference - segment.length}`}
                          strokeDashoffset={-segment.offset}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <p className="text-[18px] font-semibold tracking-[-0.7px]">
                      {formatCurrency(totalSpent, spendingCurrency)}
                    </p>
                    <p className="text-[10px] text-muted">This month</p>
                  </div>
                </div>
                {spendingCategories.length ? (
                  <div className="flex flex-col gap-2.5">
                    {spendingCategories.map((category) => (
                      <div key={category.label} className="flex items-center gap-[7px]">
                        <span className="size-[5px] overflow-hidden">
                          <Icon src={category.icon} alt="" />
                        </span>
                        <p className="flex-1 truncate text-[10px] text-muted">{category.label}</p>
                        <p className="text-[10px]">
                          {formatCurrency(category.amount, spendingCurrency)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-[11px] text-muted">
                    No expenses recorded this month.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-[18px] lg:flex-row">
              <div className="min-w-0 flex-1 rounded-card border border-border bg-surface p-[18px] lg:p-[22px]">
                <div className="mb-[18px] flex items-center justify-between">
                  <p className="text-[17px]">Recent transactions</p>
                  <p className="text-[12px] text-emerald">View all ↗</p>
                </div>
                <div className="mb-2 hidden text-[10px] text-subtle lg:flex">
                  <p className="flex-1">TRANSACTION</p>
                  <p className="w-[118px]">CATEGORY</p>
                  <p className="w-[110px]">DATE</p>
                  <p className="w-[100px] text-right">AMOUNT</p>
                </div>
                {recentTransactions.map((transaction) => {
                  const positive = transaction.type === "income";
                  const icon = positive
                    ? briefcase
                    : /shop/i.test(transaction.category || "")
                      ? shoppingBasket
                      : music;
                  return (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
                  >
                    <div
                      className={`flex size-[34px] items-center justify-center rounded-[10px] ${positive ? "bg-emerald-soft" : "bg-elevated"}`}
                    >
                      <span className="size-4 overflow-hidden">
                        <Icon src={icon} alt="" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium">{transaction.text}</p>
                      <p className="text-[11px] text-muted lg:hidden">
                        {transaction.category || "Other"} · {transaction.date || "Date unavailable"}
                      </p>
                    </div>
                    <p className="hidden w-[106px] text-[11px] text-muted lg:block">
                      {transaction.category || "Other"}
                    </p>
                    <p className="hidden w-[98px] text-[11px] text-muted lg:block">
                      {transaction.date || "Date unavailable"}
                    </p>
                    <p
                      className={`w-[90px] text-right text-[12px] lg:w-[100px] ${positive ? "text-emerald" : "text-ink"}`}
                    >
                      {positive ? "+" : "−"}
                      {formatCurrency(transaction.amount, getTransactionCurrency(transaction))}
                    </p>
                  </div>
                  );
                })}
                {!recentTransactions.length && (
                  <p className="py-7 text-center text-[11px] text-muted">
                    No transactions yet.
                  </p>
                )}
              </div>

              <div className="w-full shrink-0 rounded-card border border-border bg-surface p-[18px] lg:w-[260px] lg:p-[22px]">
                <div className="mb-[22px] flex items-start justify-between">
                  <p className="text-[17px]">Monthly budgets</p>
                  <span className="size-[18px] overflow-hidden">
                    <Icon src={ellipsis} alt="" />
                  </span>
                </div>
                <p className="mb-[22px] text-[12px] leading-[1.5] text-muted">
                  Spending this month compared with your saved limits.
                </p>
                {budgets.length ? (
                  <div className="flex flex-col gap-[22px]">
                    {budgets.map((budget) => {
                      const currency = getTransactionCurrency(budget);
                      const spent =
                        getSpendingByCategory(
                          transactions,
                          currentMonth,
                          currency,
                          "expense",
                          now
                        )[budget.category] || 0;
                      const limit = Number(budget.limit) || 0;
                      const progress = limit
                        ? Math.min((spent / limit) * 100, 100)
                        : 0;
                      const overLimit = spent > limit;
                      return (
                        <div key={`${currency}-${budget.category}`}>
                          <div className="mb-2.5 flex justify-between gap-2 text-[12px]">
                            <p className="truncate">{budget.category} · {currency}</p>
                            <p className="shrink-0 text-[11px] text-muted">
                              {formatCurrency(spent, currency)} / {formatCurrency(limit, currency)}
                            </p>
                          </div>
                          <div className="h-[5px] overflow-hidden rounded bg-track">
                            <div
                              className={`h-[5px] rounded ${overLimit ? "bg-red-400" : "bg-emerald"}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          {overLimit && (
                            <p className="mt-1 text-[10px] text-red-300">
                              Over limit by {formatCurrency(spent - limit, currency)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="py-5 text-center text-[11px] text-muted">
                    No saved budgets yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
