import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Layers3,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  GOOGLE_LOGIN_URL,
  registerUser,
  type RegisterRequest,
} from "../../services/authService";

interface RegisterFormState {
  fullName: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  address: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const initialFormState: RegisterFormState = {
  fullName: "",
  dateOfBirth: "",
  email: "",
  phoneNumber: "",
  address: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterFormState>(initialFormState);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    document.title = "Create Account | NexusCore Bank";
  }, []);

  const updateField = <K extends keyof RegisterFormState>(
    field: K,
    value: RegisterFormState[K],
  ) => {
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
    if (!form.fullName.trim()) {
      return "Please enter your full name.";
    }

    if (!form.dateOfBirth) {
      return "Please select your date of birth.";
    }

    if (!form.email.trim()) {
      return "Please enter your email address.";
    }

    if (!form.phoneNumber.trim()) {
      return "Please enter your phone number.";
    }

    if (!form.address.trim()) {
      return "Please enter your full address.";
    }

    if (form.password.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }

    if (!form.acceptTerms) {
      return "Please accept the Terms and Conditions.";
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

    const registerData: RegisterRequest = {
      FullName: form.fullName.trim(),
      Email: form.email.trim(),
      Password: form.password,
      PhoneNumber: form.phoneNumber.trim(),
      Address: form.address.trim(),
      DateofBirth: form.dateOfBirth,
    };

    setIsSubmitting(true);

    try {
      const response = await registerUser(registerData);

      setSuccess(response.message);

      window.setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1500);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Registration failed. Please try again.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const maximumDateOfBirth = new Date().toISOString().split("T")[0];

  return (
    <section className="relative isolate flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-slate-50 px-5 py-14 dark:bg-[#050b14] sm:px-6 sm:py-16">
      {/* Background effects */}
      <div className="absolute -left-40 top-10 -z-10 h-96 w-96 rounded-full bg-sky-400/20 blur-[120px] dark:bg-sky-500/10" />

      <div className="absolute -right-40 bottom-0 -z-10 h-[440px] w-[440px] rounded-full bg-blue-500/15 blur-[130px] dark:bg-blue-600/10" />

      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:48px_48px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)]" />

      <div className="w-full max-w-[600px]">
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

            <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              Create your NexusCore account
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Enter your details to begin secure digital banking.
            </p>
          </div>

          {/* Google registration */}
          <a
            href={GOOGLE_LOGIN_URL}
            className={[
              "mt-7 flex min-h-12 w-full items-center",
              "justify-center gap-3 rounded-xl border",
              "border-slate-300 bg-white px-4 text-sm",
              "font-bold text-slate-800 transition",
              "hover:border-slate-400 hover:bg-slate-50",
              "dark:border-white/15 dark:bg-white/[0.04]",
              "dark:text-white dark:hover:bg-white/[0.08]",
            ].join(" ")}
          >
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
            Continue with Google
          </a>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />

            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Or register manually
            </span>

            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Full name and date of birth */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
                >
                  Full name
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="fullName"
                    name="FullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={form.fullName}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      updateField("fullName", event.target.value)
                    }
                    required
                    className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/[0.035] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
                >
                  Date of birth
                </label>

                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="dateOfBirth"
                    name="DateofBirth"
                    type="date"
                    max={maximumDateOfBirth}
                    value={form.dateOfBirth}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      updateField("dateOfBirth", event.target.value)
                    }
                    required
                    className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/[0.035] dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Email and phone */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="registerEmail"
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
                    id="registerEmail"
                    name="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={form.email}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    required
                    className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/[0.035] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
                >
                  Phone number
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="phoneNumber"
                    name="PhoneNumber"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                    value={form.phoneNumber}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      updateField("phoneNumber", event.target.value)
                    }
                    required
                    className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/[0.035] dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
              >
                Full address
              </label>

              <div className="relative">
                <MapPin
                  size={18}
                  className="pointer-events-none absolute left-4 top-4 text-slate-400"
                />

                <textarea
                  id="address"
                  name="Address"
                  rows={3}
                  autoComplete="street-address"
                  placeholder="Enter your complete address"
                  value={form.address}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                  required
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/[0.035] dark:text-white"
                />
              </div>
            </div>

            {/* Password fields */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="registerPassword"
                  className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
                >
                  Password
                </label>

                <div className="relative">
                  <KeyRound
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="registerPassword"
                    name="Password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    value={form.password}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    required
                    minLength={8}
                    className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/[0.035] dark:text-white"
                  />

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() =>
                      setShowPassword((currentValue) => !currentValue)
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <KeyRound
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      updateField("confirmPassword", event.target.value)
                    }
                    required
                    className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/[0.035] dark:text-white"
                  />

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() =>
                      setShowConfirmPassword((currentValue) => !currentValue)
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms */}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-400/20 dark:bg-sky-400/[0.07]">
              <input
                type="checkbox"
                checked={form.acceptTerms}
                disabled={isSubmitting}
                onChange={(event) =>
                  updateField("acceptTerms", event.target.checked)
                }
                required
                className="mt-1 h-4 w-4 shrink-0 accent-sky-500 disabled:cursor-not-allowed"
              />

              <span className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                I agree to the NexusCore{" "}
                <Link
                  to="/legal#terms"
                  className="font-black text-sky-600 hover:text-sky-500 dark:text-sky-400"
                >
                  Terms and Conditions
                </Link>
                .
              </span>
            </label>

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

                <span>{success} Redirecting to login...</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || Boolean(success)}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-white dark:text-slate-950 dark:hover:bg-sky-400 dark:hover:text-white"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Creating Account...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={18} />
                  Account Created
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-black text-sky-600 transition hover:text-sky-500 dark:text-sky-400"
            >
              Sign in
            </Link>
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-200 pt-5 text-xs font-semibold text-slate-400 dark:border-white/10">
            <ShieldCheck size={15} />
            Your information is securely protected
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          By creating an account, you agree to the NexusCore{" "}
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
