import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [type, setType] = useState("income");

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setUser(currentUser);

    const savedTransactions = JSON.parse(
      localStorage.getItem(`transactions_${currentUser.email}`) || "[]"
    );
    setTransactions(savedTransactions);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!text || !amount) return;

    const newTransaction = {
      id: Date.now(),
      text,
      amount: parseFloat(amount),
      category: category || "General",
      type,
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
  };

  const handleDeleteTransaction = (id) => {
    const updatedTransactions = transactions.filter((t) => t.id !== id);
    setTransactions(updatedTransactions);
    localStorage.setItem(
      `transactions_${user.email}`,
      JSON.stringify(updatedTransactions)
    );
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  if (!user) return null;

  const userName = user.email.split("@")[0];

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
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition text-sm font-medium"
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
            Jun 1 – 30, 2026 📅
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
            <div className="text-3xl font-bold text-white mb-2">
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium">↗ 12.8% vs. last month</div>
          </div>

          {/* Income Card */}
          <div className="bg-[#121513] border border-gray-800/80 p-5 rounded-2xl">
            <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
              <span>Income</span>
              <span>↙</span>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              ${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium">↗ 8.2% vs. last month</div>
          </div>

          {/* Expenses Card */}
          <div className="bg-[#121513] border border-gray-800/80 p-5 rounded-2xl">
            <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
              <span>Expenses</span>
              <span>↗</span>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              ${totalExpense.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-red-400 font-medium">↘ 4.1% vs. last month</div>
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
                  <p className="text-[11px] text-gray-500">Your money, in perspective.</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Income
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-gray-600"></span> Expenses
                  </span>
                </div>
              </div>

              {/* Chart SVG */}
              <div className="h-44 w-full relative">
                <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#1f2937" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#1f2937" strokeDasharray="3 3" />
                  <line x1="0" y1="130" x2="500" y2="130" stroke="#1f2937" opacity="0.4" />

                  {/* Expenses Wave Line */}
                  <path
                    d="M 0,120 Q 100,110 200,105 T 400,95 T 500,85"
                    fill="none"
                    stroke="#4b5563"
                    strokeWidth="2"
                  />
                  {/* Income Wave Line */}
                  <path
                    d="M 0,110 Q 100,70 200,60 T 400,45 T 500,35"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
            </div>

            {/* Quick Add Transaction Form */}
            <div className="bg-[#121513] border border-gray-800/80 p-5 rounded-2xl">
              <h3 className="text-sm font-semibold text-white mb-3">Add New Transaction</h3>
              <form onSubmit={handleAddTransaction} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <input
                  type="text"
                  placeholder="Description"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="sm:col-span-2 p-2.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="p-2.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="p-2.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-2.5 rounded-lg text-xs transition"
                >
                  Add Record
                </button>
              </form>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-[#121513] border border-gray-800/80 p-5 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-white">Recent transactions</h3>
                <span className="text-xs text-emerald-400 cursor-pointer">View all ↗</span>
              </div>

              {transactions.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No transactions added yet.</p>
              ) : (
                <div className="divide-y divide-gray-800/60">
                  {transactions.map((t) => (
                    <div key={t.id} className="py-3 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-emerald-400 font-bold">
                          {t.type === "income" ? "↓" : "↑"}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{t.text}</p>
                          <p className="text-[10px] text-gray-500">{t.date || "Today"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`font-semibold ${
                            t.type === "income" ? "text-emerald-400" : "text-gray-200"
                          }`}
                        >
                          {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleDeleteTransaction(t.id)}
                          className="text-gray-500 hover:text-red-400 transition"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Breakdown + Monthly Budgets */}
          <div className="space-y-6">
            {/* Spending Breakdown Card with Ring Chart */}
            <div className="bg-[#121513] border border-gray-800/80 p-5 rounded-2xl">
              <h3 className="text-sm font-semibold text-white mb-4">Spending breakdown</h3>

              {/* CSS Ring Chart */}
              <div className="relative flex items-center justify-center my-6">
                <div
                  className="w-40 h-40 rounded-full flex items-center justify-center"
                  style={{
                    background: `conic-gradient(
                      #10b981 0% 48%, 
                      #34d399 48% 68%, 
                      #059669 68% 100%
                    )`,
                  }}
                >
                  <div className="w-28 h-28 bg-[#121513] rounded-full flex flex-col items-center justify-center text-center">
                    <span className="text-lg font-bold text-white">
                      ${totalExpense.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-gray-500">Total spent</span>
                  </div>
                </div>
              </div>

              {/* Categories Legend */}
              <div className="space-y-2 text-xs pt-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Housing
                  </span>
                  <span className="font-semibold text-white">$1,500.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Food & groceries
                  </span>
                  <span className="font-semibold text-white">$620.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-700"></span> Other spending
                  </span>
                  <span className="font-semibold text-white">$1,000.80</span>
                </div>
              </div>
            </div>

            {/* Monthly Budgets Card */}
            <div className="bg-[#121513] border border-gray-800/80 p-5 rounded-2xl">
              <h3 className="text-sm font-semibold text-white mb-1">Monthly budgets</h3>
              <p className="text-[11px] text-gray-500 mb-4">
                Looking good. You're within all your budgets.
              </p>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300 font-medium">Food & groceries</span>
                    <span className="text-gray-400 text-[11px]">$620 / $800</span>
                  </div>
                  <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[77%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300 font-medium">Shopping</span>
                    <span className="text-gray-400 text-[11px]">$340 / $500</span>
                  </div>
                  <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[68%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300 font-medium">Transport</span>
                    <span className="text-gray-400 text-[11px]">$180 / $300</span>
                  </div>
                  <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[60%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;