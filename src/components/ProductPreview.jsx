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
import chevronDown from "../assets/chevron-down.svg";
import signal from "../assets/signal.svg";
import markerMuted from "../assets/marker-muted.svg";
import incomeArea from "../assets/income-area.svg";
import expenseLine from "../assets/expense-line.svg";
import incomeLine from "../assets/income-line.svg";
import selectedPoint from "../assets/selected-point.svg";
import ellipsis from "../assets/ellipsis.svg";
import donutTrack from "../assets/donut-track.svg";
import donutHousing from "../assets/donut-housing.svg";
import donutFood from "../assets/donut-food.svg";
import donutShopping from "../assets/donut-shopping.svg";
import markerHousing from "../assets/marker-housing.svg";
import markerFood from "../assets/marker-food.svg";
import markerOther from "../assets/marker-other.svg";
import briefcase from "../assets/briefcase.svg";
import shoppingBasket from "../assets/shopping-basket.svg";
import music from "../assets/music.svg";

const summary = [
  {
    label: "Total balance",
    amount: "$24,680.50",
    note: "↗ 12.8% vs. last month",
    icon: wallet,
    highlight: true,
  },
  {
    label: "Income",
    amount: "$8,250.00",
    note: "↗ 8.2% vs. last month",
    icon: arrowDownLeft,
  },
  {
    label: "Expenses",
    amount: "$3,120.80",
    note: "↘ 4.1% vs. last month",
    icon: arrowUpRightMuted,
  },
];

const transactions = [
  {
    name: "Linear Studio",
    category: "Salary",
    date: "Jun 24, 2026",
    amount: "+$6,500.00",
    positive: true,
    icon: briefcase,
    iconBg: "bg-emerald-soft",
  },
  {
    name: "Whole Foods",
    category: "Groceries",
    date: "Jun 24, 2026",
    amount: "−$86.42",
    icon: shoppingBasket,
  },
  {
    name: "Spotify Premium",
    category: "Subscriptions",
    date: "Jun 23, 2026",
    amount: "−$10.99",
    icon: music,
  },
];

const budgets = [
  { name: "Food & groceries", values: "$620 / $800", width: "77.5%" },
  { name: "Shopping", values: "$340 / $500", width: "68%" },
  { name: "Transport", values: "$180 / $300", width: "60%" },
];

function CashFlowChart() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-5 rounded-card border border-border bg-surface p-[18px] lg:p-[22px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[17px] text-ink">Cash flow</p>
          <p className="mt-1.5 text-[12px] text-muted">Your money, in perspective.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-elevated px-2.5 py-1.5">
          <p className="text-[11px]">This month</p>
          <span className="size-3 overflow-hidden">
            <Icon src={chevronDown} alt="" />
          </span>
        </div>
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
          <p>$9k</p>
          <p>$6k</p>
          <p>$3k</p>
          <p>$0</p>
        </div>
        <div className="relative h-[150px] min-w-0 flex-1">
          <div className="flex h-full flex-col justify-between">
            <div className="h-px bg-border" />
            <div className="h-px bg-border" />
            <div className="h-px bg-border" />
            <div className="h-px bg-border" />
          </div>
          <div className="absolute top-[12.5px] right-0 left-0 h-[137.5px] overflow-hidden">
            <img src={incomeArea} alt="" className="block h-full w-full max-w-none" />
          </div>
          <div className="absolute top-[98px] right-0 left-0 h-[52px] overflow-hidden">
            <img src={expenseLine} alt="" className="block h-full w-full max-w-none" />
          </div>
          <div className="absolute top-[12.5px] right-0 left-0 h-[137.5px] overflow-hidden">
            <img src={incomeLine} alt="" className="block h-full w-full max-w-none" />
          </div>
          <div className="absolute top-[9px] right-0 size-[7px] overflow-hidden">
            <Icon src={selectedPoint} alt="" />
          </div>
          <div className="absolute top-[22px] right-[18px] hidden flex-col gap-1 rounded-lg border border-border bg-elevated p-2.5 lg:flex">
            <p className="text-[10px] text-muted">JUN 30, 2026</p>
            <p className="text-[12px] font-semibold whitespace-pre text-emerald">
              Income  $8,250.00
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-between pl-11 text-[10px] text-subtle">
        <p>Jun 1</p>
        <p>Jun 7</p>
        <p>Jun 14</p>
        <p className="hidden sm:block">Jun 21</p>
        <p>Jun 30</p>
      </div>
    </div>
  );
}

export default function ProductPreview() {
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
                JC
              </div>
              <div>
                <p className="text-[12px]">Jamie Chen</p>
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
                <p className="text-[23px] tracking-[-0.8px]">Good morning, Jamie ↗</p>
                <p className="mt-1.5 text-[12px] text-muted">
                  Here’s where your money stands today.
                </p>
              </div>
              <div className="hidden h-10 items-center gap-2.5 rounded-control border border-border bg-elevated px-4 lg:flex">
                <p className="text-[13px] font-semibold">Jun 1 – 30, 2026</p>
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
                  <p className="text-[25px] tracking-[-1px]">{card.amount}</p>
                  <p className={`text-[11px] ${card.highlight ? "text-emerald" : "text-muted"}`}>
                    {card.note}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-[18px] lg:flex-row">
              <CashFlowChart />
              <div className="hidden w-[260px] shrink-0 flex-col gap-[19px] rounded-card border border-border bg-surface p-[22px] lg:flex">
                <div className="flex items-start justify-between">
                  <p className="text-[17px]">Spending breakdown</p>
                  <span className="size-[18px] overflow-hidden">
                    <Icon src={ellipsis} alt="" />
                  </span>
                </div>
                <div className="relative mx-auto size-[152px]">
                  <img src={donutTrack} alt="" className="absolute inset-0 block max-w-none" />
                  <img src={donutHousing} alt="" className="absolute inset-0 block max-w-none" />
                  <img src={donutFood} alt="" className="absolute inset-0 block max-w-none" />
                  <img src={donutShopping} alt="" className="absolute inset-0 block max-w-none" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <p className="text-[21px] font-semibold tracking-[-0.7px]">$3,120.80</p>
                    <p className="text-[10px] text-muted">Total spent</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  {[
                    [markerHousing, "Housing", "$1,500.00"],
                    [markerFood, "Food & groceries", "$620.00"],
                    [markerOther, "Other spending", "$1,000.80"],
                  ].map(([icon, label, amount]) => (
                    <div key={label} className="flex items-center gap-[7px]">
                      <span className="size-[5px] overflow-hidden">
                        <Icon src={icon} alt="" />
                      </span>
                      <p className="flex-1 text-[10px] text-muted">{label}</p>
                      <p className="text-[10px]">{amount}</p>
                    </div>
                  ))}
                </div>
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
                {transactions.map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
                  >
                    <div
                      className={`flex size-[34px] items-center justify-center rounded-[10px] ${row.iconBg ?? "bg-elevated"}`}
                    >
                      <span className="size-4 overflow-hidden">
                        <Icon src={row.icon} alt="" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium">{row.name}</p>
                      <p className="text-[11px] text-muted lg:hidden">
                        {row.category} · {row.date}
                      </p>
                    </div>
                    <p className="hidden w-[106px] text-[11px] text-muted lg:block">
                      {row.category}
                    </p>
                    <p className="hidden w-[98px] text-[11px] text-muted lg:block">{row.date}</p>
                    <p
                      className={`w-[90px] text-right text-[12px] lg:w-[100px] ${row.positive ? "text-emerald" : "text-ink"}`}
                    >
                      {row.amount}
                    </p>
                  </div>
                ))}
              </div>

              <div className="w-full shrink-0 rounded-card border border-border bg-surface p-[18px] lg:w-[260px] lg:p-[22px]">
                <div className="mb-[22px] flex items-start justify-between">
                  <p className="text-[17px]">Monthly budgets</p>
                  <span className="size-[18px] overflow-hidden">
                    <Icon src={ellipsis} alt="" />
                  </span>
                </div>
                <p className="mb-[22px] text-[12px] leading-[1.5] text-muted">
                  Looking good. You’re within all your budgets.
                </p>
                <div className="flex flex-col gap-[22px]">
                  {budgets.map((budget) => (
                    <div key={budget.name}>
                      <div className="mb-2.5 flex justify-between text-[12px]">
                        <p>{budget.name}</p>
                        <p className="text-[11px] text-muted">{budget.values}</p>
                      </div>
                      <div className="h-[5px] overflow-hidden rounded bg-track">
                        <div className="h-[5px] rounded bg-emerald" style={{ width: budget.width }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
