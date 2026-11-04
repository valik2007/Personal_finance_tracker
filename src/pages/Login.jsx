import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false); // переключатель вход/регистрация
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Валидация полей
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    // Получаем текущих пользователей из localStorage
    const savedUsers = JSON.parse(localStorage.getItem("users") || "[]");

    if (isSignUp) {
      // Логика регистрации
      const userExists = savedUsers.some((u) => u.email === email);
      if (userExists) {
        setError("User with this email already exists.");
        return;
      }

      const newUser = { email, password };
      savedUsers.push(newUser);
      localStorage.setItem("users", JSON.stringify(savedUsers));
      localStorage.setItem("currentUser", JSON.stringify(newUser));

      // Перенаправляем на дашборд после регистрации
      navigate("/dashboard");
    } else {
      // Логика входа
      const user = savedUsers.find(
        (u) => u.email === email && u.password === password
      );
      if (!user) {
        setError("Invalid email or password.");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(user));
      
      // Перенаправляем на дашборд после входа
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-bold text-center mb-6">
          {isSignUp ? "Sign Up" : "Log In"}
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded font-semibold transition duration-200"
          >
            {isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-blue-400 hover:underline font-medium ml-1"
          >
            {isSignUp ? "Log In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;