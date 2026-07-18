import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import { Link } from "react-router-dom";
import {
  FileCheck2,
  Landmark,
  LoaderCircle,
  ShieldCheck,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import {
  createCustomerAccount,
  type NexusAccountType,
  type OpenAccountRequest,
} from "../../../services/customerService";
import SelectDropdown from "../../ui/SelectDropdown";

interface OpenAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void | Promise<void>;
}

interface AccountFormState {
  accountType: NexusAccountType | "";
  initialDeposit: string;
  sourceOfFunds: string;
  nomineeName: string;
  nomineeRelationship: string;
  termDuration: string;
  dailyAmount: string;
  acceptedTerms: boolean;
}

const initialState: AccountFormState = {
  accountType: "",
  initialDeposit: "",
  sourceOfFunds: "",
  nomineeName: "",
  nomineeRelationship: "",
  termDuration: "12",
  dailyAmount: "100",
  acceptedTerms: false,
};

const accountTypes: Array<{
  value: NexusAccountType;
  label: string;
  description: string;
}> = [
  {
    value: "Savings",
    label: "Savings Account",
    description: "Everyday personal banking",
  },
  {
    value: "Current",
    label: "Current Account",
    description: "Business and frequent payments",
  },
  {
    value: "FixedDeposit",
    label: "Fixed Deposit",
    description: "Fixed-term investment",
  },
  {
    value: "RecurringDeposit",
    label: "Recurring Deposit",
    description: "Monthly savings plan",
  },
  {
    value: "Loan",
    label: "Loan Account",
    description: "Financial borrowing request",
  },
  {
    value: "DailyDeposit",
    label: "Daily Deposit",
    description: "Regular smaller deposits",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function OpenAccountModal({
  open,
  onClose,
  onSuccess,
}: OpenAccountModalProps) {
  const [form, setForm] = useState<AccountFormState>(initialState);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const needsTermDuration = [
    "FixedDeposit",
    "RecurringDeposit",
    "Loan",
  ].includes(form.accountType);

  const needsDailyAmount = form.accountType === "DailyDeposit";

  const selectedAccount = useMemo(
    () => accountTypes.find((account) => account.value === form.accountType),
    [form.accountType],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(initialState);
    setError("");

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";

      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, isSubmitting, onClose]);

  if (!open) {
    return null;
  }

  const updateField = <K extends keyof AccountFormState>(
    field: K,
    value: AccountFormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const getAmountLabel = () => {
    if (form.accountType === "Loan") {
      return "Requested loan amount";
    }

    return "Initial deposit";
  };

  const validateForm = (): string | null => {
    const amount = Number(form.initialDeposit);

    if (!form.accountType) {
      return "Please select an account type.";
    }

    if (!Number.isFinite(amount) || amount < 0) {
      return "Enter a valid opening amount.";
    }

    if (!form.sourceOfFunds) {
      return "Please select your source of funds.";
    }

    if (!form.nomineeName.trim()) {
      return "Please enter the nominee's full name.";
    }

    if (!form.nomineeRelationship) {
      return "Please select the nominee relationship.";
    }

    if (needsTermDuration && !form.termDuration) {
      return "Please select a term duration.";
    }

    if (needsDailyAmount && !form.dailyAmount) {
      return "Please select a daily deposit amount.";
    }

    if (!form.acceptedTerms) {
      return "Please accept the Terms of Service.";
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const request: OpenAccountRequest = {
      AccountType: form.accountType as NexusAccountType,

      InitialDeposit: Number(form.initialDeposit),

      SourceofFunds: form.sourceOfFunds,

      NomineeName: form.nomineeName.trim(),

      NomineeRelationship: form.nomineeRelationship,

      TermDuration: needsTermDuration ? Number(form.termDuration) : null,

      DailyAmount: needsDailyAmount ? Number(form.dailyAmount) : null,
    };

    setIsSubmitting(true);

    try {
      const response = await createCustomerAccount(request);

      await onSuccess(response.message);
      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to submit the account application.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const amount = Number(form.initialDeposit);

  return (
    <div
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-md sm:p-5"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="open-account-title"
        className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b1220] text-white shadow-2xl shadow-indigo-950/60"
      >
        {/* Header */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-500 px-6 py-6 sm:px-8">
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full border border-white/15" />

          <div className="relative flex items-start justify-between gap-5">
            <div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <Landmark size={22} />
              </span>

              <h2 id="open-account-title" className="mt-5 text-2xl font-black">
                Open a new account
              </h2>

              <p className="mt-2 text-sm text-indigo-100">
                Complete the application for secure review and approval.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close account application"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="nexus-scrollbar overflow-y-auto"
        >
          <div className="space-y-7 p-6 sm:p-8">
            {/* Account details */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                  <WalletCards size={18} />
                </span>

                <div>
                  <h3 className="font-black">Account details</h3>

                  <p className="text-xs text-slate-500">
                    Select the financial product you need.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="new-account-type"
                    className="mb-2 block text-sm font-bold text-slate-300"
                  >
                    Account type
                  </label>

                  <SelectDropdown
                    id="new-account-type"
                    value={form.accountType}
                    appearance="dark"
                    placeholder="Select an account"
                    disabled={isSubmitting}
                    options={accountTypes.map((account) => ({
                      value: account.value,
                      label: account.label,
                      description: account.description,
                    }))}
                    onChange={(value) =>
                      updateField(
                        "accountType",
                        value as AccountFormState["accountType"],
                      )
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="initial-deposit"
                    className="mb-2 block text-sm font-bold text-slate-300"
                  >
                    {getAmountLabel()}
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">
                      ₹
                    </span>

                    <input
                      id="initial-deposit"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={form.initialDeposit}
                      disabled={isSubmitting}
                      onChange={(event) =>
                        updateField("initialDeposit", event.target.value)
                      }
                      required
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-4 font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
              </div>

              {selectedAccount && (
                <div className="mt-4 rounded-xl border border-indigo-400/15 bg-indigo-400/[0.07] px-4 py-3 text-sm text-indigo-200">
                  <span className="font-black">{selectedAccount.label}:</span>{" "}
                  {selectedAccount.description}
                </div>
              )}

              {needsTermDuration && (
                <div className="mt-5">
                  <label
                    htmlFor="term-duration"
                    className="mb-2 block text-sm font-bold text-slate-300"
                  >
                    Term duration
                  </label>

                  <SelectDropdown
                    id="term-duration"
                    value={form.termDuration}
                    appearance="dark"
                    placeholder="Select term duration"
                    disabled={isSubmitting}
                    options={[
                      {
                        value: "6",
                        label: "6 months",
                        description: "Short-term commitment",
                      },
                      {
                        value: "12",
                        label: "12 months",
                        description: "Standard annual term",
                      },
                      {
                        value: "60",
                        label: "5 years",
                        description: "Long-term financial plan",
                      },
                    ]}
                    onChange={(value) => updateField("termDuration", value)}
                  />
                </div>
              )}

              {needsDailyAmount && (
                <div className="mt-5">
                  <label
                    htmlFor="daily-amount"
                    className="mb-2 block text-sm font-bold text-slate-300"
                  >
                    Daily deposit amount
                  </label>

                  <SelectDropdown
                    id="daily-amount"
                    value={form.dailyAmount}
                    appearance="dark"
                    placeholder="Select daily amount"
                    disabled={isSubmitting}
                    options={[20, 100, 500, 1000, 2000, 5000].map((amount) => ({
                      value: String(amount),
                      label: `₹${amount.toLocaleString("en-IN")} per day`,
                    }))}
                    onChange={(value) => updateField("dailyAmount", value)}
                  />
                </div>
              )}
            </section>

            <div className="h-px bg-white/10" />

            {/* Compliance */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <FileCheck2 size={18} />
                </span>

                <div>
                  <h3 className="font-black">Compliance information</h3>

                  <p className="text-xs text-slate-500">
                    Required for account review.
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="source-of-funds"
                  className="mb-2 block text-sm font-bold text-slate-300"
                >
                  Source of funds
                </label>

                <SelectDropdown
                  id="source-of-funds"
                  value={form.sourceOfFunds}
                  appearance="dark"
                  placeholder="Select your source"
                  disabled={isSubmitting}
                  options={[
                    {
                      value: "Salary",
                      label: "Salary / Employment",
                      description: "Income from employment",
                    },
                    {
                      value: "Business",
                      label: "Business Income",
                      description: "Income from business activity",
                    },
                    {
                      value: "Savings",
                      label: "Personal Savings",
                      description: "Previously accumulated funds",
                    },
                    {
                      value: "Gift",
                      label: "Gift / Inheritance",
                      description: "Funds received from another person",
                    },
                  ]}
                  onChange={(value) => updateField("sourceOfFunds", value)}
                />
              </div>
            </section>

            <div className="h-px bg-white/10" />

            {/* Nominee */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                  <UserRound size={18} />
                </span>

                <div>
                  <h3 className="font-black">Nominee details</h3>

                  <p className="text-xs text-slate-500">
                    Add a beneficiary for this account.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
                <div>
                  <label
                    htmlFor="nominee-name"
                    className="mb-2 block text-sm font-bold text-slate-300"
                  >
                    Nominee full name
                  </label>

                  <input
                    id="nominee-name"
                    type="text"
                    autoComplete="off"
                    placeholder="Legal name"
                    value={form.nomineeName}
                    disabled={isSubmitting}
                    onChange={(event) =>
                      updateField("nomineeName", event.target.value)
                    }
                    required
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="nominee-relationship"
                    className="mb-2 block text-sm font-bold text-slate-300"
                  >
                    Relationship
                  </label>

                  <SelectDropdown
                    id="nominee-relationship"
                    value={form.nomineeRelationship}
                    appearance="dark"
                    placeholder="Select relationship"
                    disabled={isSubmitting}
                    options={[
                      {
                        value: "Spouse",
                        label: "Spouse",
                      },
                      {
                        value: "Parent",
                        label: "Parent",
                      },
                      {
                        value: "Child",
                        label: "Child",
                      },
                      {
                        value: "Sibling",
                        label: "Sibling",
                      },
                      {
                        value: "Other",
                        label: "Other",
                      },
                    ]}
                    onChange={(value) =>
                      updateField("nomineeRelationship", value)
                    }
                  />
                </div>
              </div>
            </section>

            {/* Summary */}
            {form.accountType && Number.isFinite(amount) && amount >= 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">
                  Application summary
                </p>

                <div className="mt-4 flex items-center justify-between gap-5">
                  <div>
                    <p className="font-black">{selectedAccount?.label}</p>

                    <p className="mt-1 text-sm text-slate-500">
                      Initial application amount
                    </p>
                  </div>

                  <p className="text-lg font-black text-emerald-400">
                    {formatCurrency(amount)}
                  </p>
                </div>
              </div>
            )}

            {/* Terms */}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-indigo-400/15 bg-indigo-400/[0.07] p-4">
              <input
                type="checkbox"
                checked={form.acceptedTerms}
                disabled={isSubmitting}
                onChange={(event) =>
                  updateField("acceptedTerms", event.target.checked)
                }
                className="mt-1 h-4 w-4 shrink-0 accent-indigo-500"
              />

              <span className="text-sm leading-6 text-slate-400">
                I agree to the NexusCore{" "}
                <Link
                  to="/legal#terms"
                  target="_blank"
                  className="font-black text-indigo-300 hover:text-indigo-200"
                >
                  Terms of Service
                </Link>{" "}
                and confirm the information provided is accurate.
              </span>
            </label>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-300"
              >
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-white/10 bg-[#0b1220]/95 px-6 py-5 backdrop-blur-xl sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-12 rounded-xl border border-white/10 px-6 font-black text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 px-6 font-black text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:from-indigo-500 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Submitting application...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Authorize and Open Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
