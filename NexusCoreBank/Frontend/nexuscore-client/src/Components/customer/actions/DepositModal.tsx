import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import {
  CheckCircle2,
  Landmark,
  LoaderCircle,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  depositFunds,
  type CustomerAccount,
} from "../../../services/customerService";

interface DepositModalProps {
  open: boolean;
  account: CustomerAccount;
  onClose: () => void;
  onSuccess: (message: string) => void | Promise<void>;
}

const quickAmounts = [500, 1000, 5000, 10000];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function DepositModal({
  open,
  account,
  onClose,
  onSuccess,
}: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setAmount("");
    setError("");

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const numericAmount = Number(amount);

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid deposit amount.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await depositFunds({
        AccountId: account.accountId,
        Amount: numericAmount,
      });

      await onSuccess(result.message);
      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Deposit failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="deposit-title"
        className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b1220] text-white shadow-2xl shadow-indigo-950/50"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 p-6">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full border border-white/15" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <Plus size={22} />
              </span>

              <h2 id="deposit-title" className="mt-5 text-2xl font-black">
                Deposit funds
              </h2>

              <p className="mt-1 text-sm text-blue-100">
                Add money securely to your account.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close deposit dialog"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
              <Landmark size={21} />
            </span>

            <div className="min-w-0">
              <p className="truncate font-black">{account.accountType}</p>

              <p className="mt-1 font-mono text-xs tracking-widest text-slate-400">
                •••• {String(account.accountNumber).slice(-4)}
              </p>
            </div>

            <p className="ml-auto text-right text-sm font-black text-emerald-400">
              {formatCurrency(Number(account.balance))}
            </p>
          </div>

          <div>
            <label
              htmlFor="deposit-amount"
              className="mb-2 block text-sm font-bold text-slate-300"
            >
              Deposit amount
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">
                ₹
              </span>

              <input
                id="deposit-amount"
                type="number"
                min="1"
                step="0.01"
                inputMode="decimal"
                autoFocus
                placeholder="0.00"
                value={amount}
                disabled={isSubmitting}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setError("");
                }}
                className="h-14 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-xl font-black text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                disabled={isSubmitting}
                onClick={() => setAmount(String(quickAmount))}
                className="rounded-xl border border-white/10 bg-white/[0.035] px-2 py-2.5 text-xs font-black text-slate-300 transition hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
              >
                +₹{quickAmount.toLocaleString("en-IN")}
              </button>
            ))}
          </div>

          {numericAmount > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-indigo-500/10 px-4 py-3 text-sm">
              <span className="text-slate-400">New balance</span>

              <span className="font-black text-indigo-300">
                {formatCurrency(Number(account.balance) + numericAmount)}
              </span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-300"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 font-black text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:from-indigo-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Processing deposit...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Confirm Deposit
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={14} />
            Secured by NexusCore
          </div>
        </form>
      </div>
    </div>
  );
}
