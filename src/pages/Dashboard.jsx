import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income"); // "income" or "expense"

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
      type,
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div>
            <h1 className="text-2xl font-bold">Personal Finance Tracker</h1>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded text-sm font-semibold transition"
          >
            Log Out
          </button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <p className="text-gray-400 text-sm">Total Balance</p>
            <p className="text-2xl font-bold mt-1">${balance.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <p className="text-gray-400 text-sm">Total Income</p>
            <p className="text-2xl font-bold text-green-400 mt-1">+${totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <p className="text-gray-400 text-sm">Total Expenses</p>
            <p className="text-2xl font-bold text-red-400 mt-1">-${totalExpense.toFixed(2)}</p>
          </div>
        </div>

        {/* Add Transaction Form */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
          <h2 className="text-lg font-semibold mb-4">Add Transaction</h2>
          <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Description ( Salary )"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 rounded font-semibold transition"
            >
              Add
            </button>
          </form>
        </div>

        {/* Transactions List */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No transactions recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center bg-gray-700/50 p-3 rounded border border-gray-600"
                >
                  <div>
                    <span className="font-medium">{t.text}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`font-bold ${
                        t.type === "income" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDeleteTransaction(t.id)}
                      className="text-gray-400 hover:text-red-400 text-sm"
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
    </div>
  );
}

export default Dashboard;