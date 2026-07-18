import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Layers3,
  LoaderCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  getDashboardPath,
  getRoleFromToken,
  GOOGLE_LOGIN_URL,
  loginUser,
  saveAuthToken,
  type LoginRequest,
} from "../../services/authService";

interface LoginFormState {
  email: string;
  password: string;
}

const initialFormState: LoginFormState = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginFormState>(initialFormState);

  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    document.title = "Login | NexusCore Bank";
  }, []);

  const updateField = (field: keyof LoginFormState, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  const validateForm = (): string | null => {
    if (!form.email.trim()) {
      return "Please enter your email address.";
    }

    if (!form.password) {
      return "Please enter your password.";
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const loginData: LoginRequest = {
      Email: form.email.trim(),
      Password: form.password,
    };

    setIsSubmitting(true);

    try {
      const response = await loginUser(loginData);

      saveAuthToken(response.token);

      const role = getRoleFromToken(response.token);
      const dashboardPath = getDashboardPath(role);

      setSuccess(response.message);

      window.setTimeout(() => {
        navigate(dashboardPath, {
          replace: true,
        });
      }, 900);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Login failed. Please try again.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    if (isGoogleLoading) {
      return;
    }

    setIsGoogleLoading(true);
    window.location.href = GOOGLE_LOGIN_URL;
  };

  return (
    <section className="relative isolate flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-slate-50 px-5 py-16 dark:bg-[#050b14] sm:px-6">
      {/* Background */}
      <div className="absolute -left-40 top-10 -z-10 h-96 w-96 rounded-full bg-sky-400/20 blur-[120px] dark:bg-sky-500/10" />

      <div className="absolute -right-40 bottom-0 -z-10 h-[420px] w-[420px] rounded-full bg-blue-500/15 blur-[130px] dark:bg-blue-600/10" />

      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:48px_48px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)]" />

      <div className="w-full max-w-[430px]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-8 dark:border-white/10 dark:bg-[#0a0a0a] dark:shadow-black/50">
          {/* Header */}
          <div className="text-center">
            <Link
              to="/"
              aria-label="Return to NexusCore home"
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/25 transition hover:-rotate-3 hover:scale-105"
            >
              <Layers3 size={24} />
            </Link>

            <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              Sign in to NexusCore
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Welcome back. Enter your details to continue.
            </p>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isSubmitting}
            className="mt-7 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
          >
            {isGoogleLoading ? (
              <>
                <LoaderCircle size={19} className="animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />

            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Or
            </span>

            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="loginEmail"
                className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="loginEmail"
                  name="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={form.email}
                  disabled={isSubmitting}
                  onChange={(event) => updateField("email", event.target.value)}
                  required
                  className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/[0.035] dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label
                  htmlFor="loginPassword"
                  className="text-sm font-bold text-slate-800 dark:text-slate-200"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-sky-600 transition hover:text-sky-500 dark:text-sky-400"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <KeyRound
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="loginPassword"
                  name="Password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  required
                  className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/[0.035] dark:text-white dark:placeholder:text-slate-500"
                />

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    setShowPassword((currentValue) => !currentValue)
                  }
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300"
              >
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
              >
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />

                <span>{success} Redirecting...</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || isGoogleLoading || Boolean(success)}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-white dark:text-slate-950 dark:hover:bg-sky-400 dark:hover:text-white"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Signing In...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={18} />
                  Signed In
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Register */}
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-black text-sky-600 transition hover:text-sky-500 dark:text-sky-400"
            >
              Create account
            </Link>
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-200 pt-5 text-xs font-semibold text-slate-400 dark:border-white/10">
            <ShieldCheck size={15} />
            Protected by NexusCore security
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          By continuing, you agree to the NexusCore{" "}
          <Link
            to="/legal#terms"
            className="font-bold text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            to="/legal#privacy"
            className="font-bold text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

function GoogleIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"
      />

      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
      />

      <path
        fill="#FBBC05"
        d="M6.39 13.86A6.01 6.01 0 0 1 6.08 12c0-.65.11-1.28.31-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.48l3.35-2.62Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.01c1.47 0 2.78.51 3.82 1.5l2.87-2.87A9.67 9.67 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6.01 12 6.01Z"
      />
    </svg>
  );
}
