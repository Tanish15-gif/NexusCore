import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Moon,
  ShieldCheck,
  Sparkles,
  Store,
  Sun,
  UserRound,
} from "lucide-react";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  getRoleFromToken,
  loginCustomer,
  registerCustomer,
  saveAuthSession,
} from "../../services/authService";

type Theme = "light" | "dark";

type MessageType = "success" | "error" | "info";

interface FormMessage {
  type: MessageType;
  text: string;
}

const THEME_STORAGE_KEY = "nexusmart-theme";

function getInitialTheme(): Theme {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getSafeReturnUrl(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/profile";
  }

  return value;
}

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const isRegisterMode = location.pathname === "/register";

  const returnUrl = getSafeReturnUrl(searchParams.get("returnUrl"));

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState(searchParams.get("email") ?? "");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState<FormMessage | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");

    document.documentElement.style.colorScheme = theme;

    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.title = isRegisterMode
      ? "Create Account | NexusMart"
      : "Sign In | NexusMart";

    setPassword("");
    setShowPassword(false);

    if (searchParams.get("registered") === "true" && !isRegisterMode) {
      setMessage({
        type: "success",
        text: "Your NexusMart account was created successfully. Sign in to continue.",
      });
    } else {
      setMessage(null);
    }
  }, [isRegisterMode, searchParams]);

  const switchUrl = useMemo(() => {
    const path = isRegisterMode ? "/login" : "/register";

    const parameters = new URLSearchParams();

    if (returnUrl !== "/profile") {
      parameters.set("returnUrl", returnUrl);
    }

    if (email.trim()) {
      parameters.set("email", email.trim());
    }

    const query = parameters.toString();

    return query ? `${path}?${query}` : path;
  }, [email, isRegisterMode, returnUrl]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    if (isRegisterMode && fullName.trim().length < 2) {
      setMessage({
        type: "error",
        text: "Enter your full name.",
      });

      return;
    }

    if (!cleanEmail) {
      setMessage({
        type: "error",
        text: "Enter your email address.",
      });

      return;
    }

    if (password.length < 6) {
      setMessage({
        type: "error",
        text: "Your password must contain at least 6 characters.",
      });

      return;
    }

    setIsSubmitting(true);

    setMessage({
      type: "info",
      text: isRegisterMode
        ? "Creating your NexusMart identity..."
        : "Verifying your credentials...",
    });

    try {
      if (isRegisterMode) {
        const result = await registerCustomer({
          name: fullName,
          email: cleanEmail,
          password,
        });

        const parameters = new URLSearchParams({
          registered: "true",
          email: cleanEmail,
        });

        if (returnUrl !== "/profile") {
          parameters.set("returnUrl", returnUrl);
        }

        navigate(`/login?${parameters.toString()}`, {
          replace: true,
          state: {
            message: result.message,
          },
        });

        return;
      }

      const result = await loginCustomer({
        email: cleanEmail,
        password,
      });

      const token = result.token!;

      saveAuthSession(token);

      const role = getRoleFromToken(token)?.trim().toLowerCase();

      setMessage({
        type: "success",
        text: result.message || "Login successful.",
      });

      if (role === "admin") {
        navigate("/admin", {
          replace: true,
        });

        return;
      }

      navigate(returnUrl, {
        replace: true,
      });
    } catch (requestError) {
      setMessage({
        type: "error",

        text:
          requestError instanceof Error
            ? requestError.message
            : "The server could not process your request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#050a13] dark:text-white">
      <button
        type="button"
        onClick={() =>
          setTheme((currentTheme) =>
            currentTheme === "dark" ? "light" : "dark",
          )
        }
        aria-label="Toggle appearance"
        className="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-700 shadow-lg backdrop-blur transition hover:border-indigo-300 hover:text-indigo-600 sm:right-6 sm:top-6 dark:border-white/10 dark:bg-[#0b1424]/90 dark:text-slate-200 dark:hover:text-indigo-400"
      >
        {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
      </button>

      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="mart-grid-background relative hidden overflow-hidden border-r border-white/10 bg-[#07101d] px-12 py-10 text-white lg:flex lg:flex-col">
          <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

          <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

          <Link to="/" className="relative z-10 flex w-fit items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/25">
              <Store size={22} />
            </span>

            <span>
              <span className="block text-xl font-black tracking-tight">
                NexusMart
              </span>

              <span className="block text-[10px] font-bold uppercase tracking-[0.17em] text-slate-400">
                Connected commerce
              </span>
            </span>
          </Link>

          <div className="relative z-10 my-auto max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-lg border border-indigo-400/20 bg-indigo-400/10 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-indigo-300">
              <Sparkles size={15} />
              NexusCore ecosystem
            </div>

            <h1 className="mt-7 text-5xl font-black tracking-[-0.04em]">
              One identity for secure shopping and connected banking.
            </h1>

            <p className="mt-6 max-w-lg text-base font-medium leading-8 text-slate-400">
              Access NexusMart products, manage orders and complete purchases
              through your linked NexusCore Bank account.
            </p>

            <div className="mt-9 grid gap-3">
              {[
                "Secure JWT authentication",
                "Connected NexusCore payments",
                "Protected orders and account data",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
                    <Check size={17} />
                  </span>

                  <span className="text-sm font-bold text-slate-200">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-9 rounded-2xl border border-white/10 bg-white/[0.045] p-5">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                  <CreditCard size={23} />
                </span>

                <div>
                  <p className="font-black">NexusCore Bank checkout</p>

                  <p className="mt-1 text-sm text-slate-400">
                    Link once and pay securely from your verified bank account.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs font-semibold text-slate-500">
            © 2026 NexusMart. Powered by NexusCore.
          </p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-20 sm:px-6 lg:px-12">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-black text-indigo-600 transition hover:text-indigo-500 lg:hidden dark:text-indigo-400"
            >
              <ArrowLeft size={17} />
              Back to NexusMart
            </Link>

            <div className="mt-7 lg:mt-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                {isRegisterMode
                  ? "Create your identity"
                  : "Secure account access"}
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                {isRegisterMode ? "Join NexusMart" : "Welcome back"}
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {isRegisterMode
                  ? "Create your NexusMart account to shop, manage orders and link NexusCore Bank."
                  : "Enter your credentials to access your NexusMart account."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {isRegisterMode && (
                <label className="block">
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                    Full name
                  </span>

                  <div className="relative mt-2">
                    <UserRound
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      autoComplete="name"
                      placeholder="Enter Your Name"
                      disabled={isSubmitting}
                      className="min-h-13 w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-[#0b1424] dark:text-white"
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                  Email address
                </span>

                <div className="relative mt-2">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="name@example.com"
                    disabled={isSubmitting}
                    className="min-h-13 w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-[#0b1424] dark:text-white"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                  Password
                </span>

                <div className="relative mt-2">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={
                      isRegisterMode ? "new-password" : "current-password"
                    }
                    placeholder={
                      isRegisterMode
                        ? "Create a secure password"
                        : "Enter your password"
                    }
                    disabled={isSubmitting}
                    className="min-h-13 w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-12 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-[#0b1424] dark:text-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-white/5 dark:hover:text-indigo-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              {message && (
                <div
                  className={[
                    "rounded-xl border p-4 text-sm font-bold",
                    message.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400"
                      : message.type === "error"
                        ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-400"
                        : "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300",
                  ].join(" ")}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />

                    {isRegisterMode ? "Creating account..." : "Signing in..."}
                  </>
                ) : (
                  <>
                    {isRegisterMode ? "Create account" : "Sign in securely"}

                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-200 pt-6 text-center dark:border-white/10">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {isRegisterMode
                  ? "Already have a NexusMart account?"
                  : "New to NexusMart?"}
              </p>

              <Link
                to={switchUrl}
                className="mt-2 inline-block text-sm font-black text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
              >
                {isRegisterMode
                  ? "Sign in to your account"
                  : "Create a NexusMart account"}
              </Link>
            </div>

            <div className="mt-7 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
              <ShieldCheck size={15} />
              Your account is protected by NexusMart security
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
