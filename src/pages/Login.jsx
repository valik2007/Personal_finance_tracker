import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import brandMark from "../assets/brand-mark.svg";
import signal from "../assets/signal.svg";
import orbit from "../assets/auth-orbit.svg";
import orbitMid from "../assets/auth-orbit-mid.svg";
import orbitInner from "../assets/auth-orbit-inner.svg";
import arrowUpRight from "../assets/auth-arrow-up-right.svg";
import shieldCheck from "../assets/auth-shield-check.svg";
import arrowLeft from "../assets/auth-arrow-left.svg";
import mail from "../assets/auth-mail.svg";
import eyeOff from "../assets/auth-eye-off.svg";
import rememberCheck from "../assets/auth-check.svg";
import consentCheck from "../assets/auth-check-consent.svg";
import arrowRight from "../assets/auth-arrow-right.svg";

const trendBars = [15, 23, 20, 31, 28, 39, 47];

function BrandLink() {
  return (
    <Link to="/" className="flex items-center gap-[9px] text-ink no-underline">
      <Icon src={brandMark} alt="" />
      <span className="text-[28px] leading-none font-normal tracking-[-1px]">velto</span>
    </Link>
  );
}

function BrandStory() {
  return (
    <aside className="hidden w-[520px] shrink-0 flex-col border-r border-border bg-gradient-to-r from-[#10251c] to-[#0d1411] p-12 lg:flex">
      <div className="flex flex-col gap-[52px]">
        <BrandLink />

        <div className="flex flex-col gap-[22px]">
          <div className="flex items-center gap-2">
            <Icon src={signal} alt="" />
            <p className="text-[11px] font-semibold tracking-[1.8px] text-emerald">
              LESS NOISE. MORE POSSIBILITY.
            </p>
          </div>
          <h1 className="text-[44px] leading-[1.15] font-medium tracking-[-1.9px]">
            A clearer picture.
            <br />
            <span className="text-emerald">A calmer you.</span>
          </h1>
          <p className="text-[15px] leading-[1.7] text-muted">
            Know where you stand. Make room for where you’re going.
          </p>
        </div>

        <div className="relative flex h-[340px] w-full items-center justify-center">
          <img
            src={orbit}
            alt=""
            className="pointer-events-none absolute top-[-22px] left-1/2 -translate-x-1/2"
          />
          <img
            src={orbitMid}
            alt=""
            className="pointer-events-none absolute top-5 left-1/2 -translate-x-1/2"
          />
          <img
            src={orbitInner}
            alt=""
            className="pointer-events-none absolute top-[61px] left-1/2 -translate-x-1/2"
          />
          <div className="flex h-[216.519px] w-[339.24px] items-center justify-center">
            <div className="-rotate-5">
              <div className="flex w-[324px] flex-col gap-[18px] rounded-[22px] border border-[#416451] bg-[#15231e] p-6 shadow-[0px_24px_64px_0px_rgba(0,0,0,0.31)]">
                <div className="flex items-start justify-between">
                  <p className="text-[11px] text-muted">Your total balance</p>
                  <Icon src={arrowUpRight} alt="" />
                </div>
                <p className="text-[35px] leading-none font-medium tracking-[-1.5px]">
                  $24,680.50
                </p>
                <div className="flex items-end justify-between">
                  <div className="flex flex-col gap-[5px]">
                    <p className="text-[12px] text-emerald">↗ 12.8%</p>
                    <p className="text-[10px] text-subtle">vs. last month</p>
                  </div>
                  <div className="flex h-[47px] items-end gap-[6px]">
                    {trendBars.map((height, index) => (
                      <span
                        key={height}
                        className={`w-3 rounded-[3px] ${index === trendBars.length - 1 ? "bg-emerald" : "bg-[#365b48]"}`}
                        style={{ height }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-[14px] pt-[52px]">
        <div className="flex items-center gap-2">
          <Icon src={shieldCheck} alt="" />
          <p className="text-[12px]">Your money is personal. So is your data.</p>
        </div>
        <p className="text-[11px] leading-[1.65] text-subtle">
          A simpler way to understand and manage your money.
        </p>
      </div>
    </aside>
  );
}

function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false); // переключатель вход/регистрация
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const switchMode = () => {
    setIsSignUp((current) => !current);
    setError("");
    setAgreed(false);
    setShowPassword(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Валидация полей
    if (isSignUp) {
      if (!fullName.trim() || !email || !password) {
        setError("Please fill in all fields.");
        return;
      }

      if (password.length < 8 || !/\d/.test(password)) {
        setError("Use at least 8 characters, including a number.");
        return;
      }

      if (!agreed) {
        setError("Please agree to the Terms of Service and Privacy Policy.");
        return;
      }
    } else if (!email || !password) {
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

      const newUser = { email, password, fullName: fullName.trim() };
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

  const inputClassName =
    "h-[50px] w-full rounded-control border border-border bg-surface px-[15px] text-[13px] text-ink outline-none placeholder:text-muted focus:border-emerald";

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      <BrandStory />

      <main className="flex min-h-screen min-w-0 flex-1 flex-col gap-[30px] px-5 pt-8 pb-[30px] lg:px-10 lg:pt-[42px] xl:px-[60px]">
        <div className="lg:hidden">
          <BrandLink />
        </div>

        <div className="flex items-start justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-[12px] text-muted no-underline hover:text-ink"
          >
            <Icon src={arrowLeft} alt="" />
            Back to home
          </Link>
          <span className="text-[12px] text-muted">Need help? ↗</span>
        </div>

        <div className="flex w-full flex-1 flex-col items-center">
          <form onSubmit={handleSubmit} className="my-auto flex w-full max-w-[400px] flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-[10px] tracking-[1.6px] text-emerald">
                {isSignUp ? "YOUR NEXT CHAPTER" : "YOUR PERSONAL WORKSPACE"}
              </p>
              <h2 className="text-[35px] leading-[1.2] tracking-[-1.5px]">
                {isSignUp ? "Make yourself at home." : "Welcome back."}
              </h2>
              <p className="text-[14px] leading-[1.6] text-muted">
                {isSignUp
                  ? "Start building a better relationship with money."
                  : "A little clarity looks good on you. Let’s pick up where you left off."}
              </p>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-control border border-red-500/40 bg-red-500/10 px-3 py-2 text-[12px] text-red-300"
              >
                {error}
              </p>
            )}

            <div className="flex flex-col gap-[18px]">
              {isSignUp && (
                <div className="flex flex-col gap-[9px]">
                  <label htmlFor="full-name" className="text-[12px] font-medium">
                    Full name
                  </label>
                  <input
                    id="full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jamie Chen"
                    autoComplete="name"
                    className={inputClassName}
                  />
                </div>
              )}

              <div className="flex flex-col gap-[9px]">
                <label htmlFor="email" className="text-[12px] font-medium">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jamie@example.com"
                    autoComplete="email"
                    className={`${inputClassName} pr-11`}
                  />
                  <span className="pointer-events-none absolute top-1/2 right-[15px] -translate-y-1/2">
                    <Icon src={mail} alt="" />
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-[9px]">
                <label htmlFor="password" className="text-[12px] font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    className={`${inputClassName} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-[15px] -translate-y-1/2"
                  >
                    <Icon src={eyeOff} alt="" />
                  </button>
                </div>
              </div>

              {isSignUp ? (
                <p className="text-[11px] text-subtle">
                  Use at least 8 characters, including a number.
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex size-4 items-center justify-center rounded-[4px] bg-emerald">
                    <Icon src={rememberCheck} alt="" />
                  </span>
                  <span className="text-[12px] text-muted">Remember me</span>
                </div>
              )}
            </div>

            {isSignUp && (
              <label className="flex cursor-pointer items-start gap-[10px]">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="mt-px flex size-[17px] shrink-0 items-center justify-center rounded-[4px] border border-border peer-checked:border-transparent peer-checked:bg-emerald peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald">
                  {agreed ? <Icon src={consentCheck} alt="" /> : null}
                </span>
                <span className="text-[11px] leading-[1.65] text-muted">
                  I agree to the <span className="text-ink">Terms of Service</span> and{" "}
                  <span className="text-ink">Privacy Policy</span>.
                </span>
              </label>
            )}

            <button
              type="submit"
              className="flex h-[50px] w-full items-center justify-center gap-2.5 rounded-control bg-emerald text-[14px] font-semibold text-emerald-ink hover:bg-[#7aedba]"
            >
              {isSignUp ? "Create your free account" : "Sign In"}
              <Icon src={arrowRight} alt="" />
            </button>

            <p className="text-center text-[12px] text-muted">
              {isSignUp ? "Already have an account? " : "New to Velto? "}
              <button type="button" onClick={switchMode} className="font-medium text-emerald">
                {isSignUp ? "Sign In" : "Create an account"}
              </button>
            </p>
          </form>
        </div>

        <div className="flex items-start justify-between text-[10px] text-subtle">
          <p>© 2026 Velto</p>
          <div className="flex gap-5">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
