import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import {
  Landmark,
  LoaderCircle,
  Minus,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  withdrawFunds,
  type CustomerAccount,
} from "../../../services/customerService";

interface WithdrawModalProps {
  open: boolean;
  account: CustomerAccount;
  onClose: () => void;
  onSuccess: (message: string) => void | Promise<void>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function WithdrawModal({
  open,
  account,
  onClose,
  onSuccess,
}: WithdrawModalProps) {
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
  const currentBalance = Number(account.balance);

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid withdrawal amount.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await withdrawFunds({
        AccountId: account.accountId,
        Amount: numericAmount,
        AccountType: account.accountType,
      });

      await onSuccess(result.message);
      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Withdrawal failed. Please try again.",
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
        aria-labelledby="withdraw-title"
        className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b1220] text-white shadow-2xl shadow-red-950/30"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-red-600 to-orange-500 p-6">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full border border-white/15" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                <Minus size={22} />
              </span>

              <h2 id="withdraw-title" className="mt-5 text-2xl font-black">
                Withdraw funds
              </h2>

              <p className="mt-1 text-sm text-red-100">
                Withdraw money from this account.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close withdrawal dialog"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
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

            <div>
              <p className="font-black">{account.accountType}</p>

              <p className="mt-1 font-mono text-xs tracking-widest text-slate-400">
                •••• {String(account.accountNumber).slice(-4)}
              </p>
            </div>

            <div className="ml-auto text-right">
              <p className="text-xs text-slate-500">Available</p>

              <p className="mt-1 font-black text-emerald-400">
                {formatCurrency(currentBalance)}
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="withdraw-amount"
              className="mb-2 block text-sm font-bold text-slate-300"
            >
              Withdrawal amount
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">
                ₹
              </span>

              <input
                id="withdraw-amount"
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
                className="h-14 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-xl font-black text-white outline-none transition placeholder:text-slate-600 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4">
            <ShieldAlert size={19} className="mt-0.5 shrink-0 text-amber-400" />

            <p className="text-sm leading-6 text-amber-200/80">
              Withdrawal limits and overdraft eligibility are checked securely
              by the bank server.
            </p>
          </div>

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
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 font-black text-white shadow-lg shadow-red-500/20 transition hover:-translate-y-0.5 hover:from-rose-500 hover:to-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Processing withdrawal...
              </>
            ) : (
              <>
                <Minus size={18} />
                Confirm Withdrawal
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
