import { useEffect, useState, type FormEvent } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Home,
  LoaderCircle,
  LogOut,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  completeCustomerProfile,
  type CompleteCustomerProfileRequest,
} from "../../services/customerService";

interface CompleteKycModalProps {
  open: boolean;
  initialName?: string;
  onCompleted: (message: string) => Promise<void> | void;
  onSignOut: () => void;
}

interface KycFormState {
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d+]/g, "").slice(0, 16);
}

function validateForm(form: KycFormState) {
  if (form.fullName.trim().length < 3) {
    return "Enter your complete legal name.";
  }

  if (!form.dateOfBirth) {
    return "Select your date of birth.";
  }

  const selectedDate = new Date(form.dateOfBirth);

  if (Number.isNaN(selectedDate.getTime()) || selectedDate > new Date()) {
    return "Enter a valid date of birth.";
  }

  const phoneDigits = form.phoneNumber.replace(/\D/g, "");

  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    return "Enter a valid phone number.";
  }

  if (form.address.trim().length < 10) {
    return "Enter your complete residential address.";
  }

  return "";
}

export default function CompleteKycModal({
  open,
  initialName = "",
  onCompleted,
  onSignOut,
}: CompleteKycModalProps) {
  const [form, setForm] = useState<KycFormState>({
    fullName: initialName,
    dateOfBirth: "",
    phoneNumber: "",
    address: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm((current) => ({
      ...current,
      fullName:
        current.fullName ||
        initialName ||
        localStorage.getItem("nexus_google_name") ||
        "",
    }));

    setError("");
  }, [open, initialName]);

  if (!open) {
    return null;
  }

  const updateField = (field: keyof KycFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    const request: CompleteCustomerProfileRequest = {
      FullName: form.fullName.trim(),
      DateofBirth: form.dateOfBirth,
      PhoneNumber: form.phoneNumber.trim(),
      Address: form.address.trim(),
    };

    try {
      const message = await completeCustomerProfile(request);

      await onCompleted(message);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to complete your profile.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-md sm:p-6">
      <div className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-[#0b1526] dark:shadow-[0_30px_100px_rgba(0,0,0,0.65)]">
        {/* Header */}
        <header className="border-b border-slate-200 bg-slate-50 px-5 py-6 sm:px-8 dark:border-white/10 dark:bg-[#091323]">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <BadgeCheck size={23} />
            </span>

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                Identity verification
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                Complete your banking profile
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                NexusCore needs a few additional details before you can open and
                manage banking accounts.
              </p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 p-5 sm:p-8">
            {/* Security notice */}
            <div className="flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-indigo-800 dark:border-indigo-400/20 dark:bg-indigo-400/[0.07] dark:text-indigo-200">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
              />

              <p className="text-sm leading-6">
                Your Google account created your login identity. These details
                are required to create your customer banking profile.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Full name */}
              <FormField label="Full legal name" htmlFor="kyc-full-name">
                <UserRound
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="kyc-full-name"
                  type="text"
                  autoComplete="name"
                  value={form.fullName}
                  disabled={isSubmitting}
                  placeholder="Enter your legal name"
                  onChange={(event) =>
                    updateField("fullName", event.target.value)
                  }
                  className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.035] dark:text-white dark:placeholder:text-slate-600"
                />
              </FormField>

              {/* DOB */}
              <FormField label="Date of birth" htmlFor="kyc-date-of-birth">
                <CalendarDays
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="kyc-date-of-birth"
                  type="date"
                  max={getTodayDate()}
                  value={form.dateOfBirth}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    updateField("dateOfBirth", event.target.value)
                  }
                  className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm font-medium text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.035] dark:text-white"
                />
              </FormField>
            </div>

            {/* Phone */}
            <FormField label="Phone number" htmlFor="kyc-phone-number">
              <Phone
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="kyc-phone-number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={form.phoneNumber}
                disabled={isSubmitting}
                placeholder="+91 98765 43210"
                onChange={(event) =>
                  updateField(
                    "phoneNumber",
                    normalizePhoneNumber(event.target.value),
                  )
                }
                className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.035] dark:text-white dark:placeholder:text-slate-600"
              />
            </FormField>

            {/* Address */}
            <FormField label="Residential address" htmlFor="kyc-address">
              <Home
                size={17}
                className="pointer-events-none absolute left-4 top-4 text-slate-400"
              />

              <textarea
                id="kyc-address"
                rows={4}
                autoComplete="street-address"
                value={form.address}
                disabled={isSubmitting}
                placeholder="Enter your complete residential address"
                onChange={(event) => updateField("address", event.target.value)}
                className="w-full resize-y rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-medium leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.035] dark:text-white dark:placeholder:text-slate-600"
              />
            </FormField>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-400/20 dark:bg-red-400/[0.07] dark:text-red-300"
              >
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 dark:border-white/10 dark:bg-[#091323]">
            <button
              type="button"
              onClick={onSignOut}
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold text-slate-500 transition hover:bg-slate-200 hover:text-slate-950 disabled:opacity-50 dark:hover:bg-white/[0.05] dark:hover:text-white"
            >
              <LogOut size={16} />
              Sign out
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 text-sm font-black text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Completing profile...
                </>
              ) : (
                <>
                  <BadgeCheck size={17} />
                  Complete Profile
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>

      <div className="relative">{children}</div>
    </div>
  );
}
