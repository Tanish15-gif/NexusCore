import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Landmark,
  LoaderCircle,
  Repeat2,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  transferFunds,
  verifyTransferOtp,
  type CustomerAccount,
  type TransferRequest,
} from "../../../services/customerService";

interface TransferModalProps {
  open: boolean;
  account: CustomerAccount;
  onClose: () => void;
  onSuccess: (message: string) => void | Promise<void>;
}

type TransferStage = "details" | "otp";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function TransferModal({
  open,
  account,
  onClose,
  onSuccess,
}: TransferModalProps) {
  const [stage, setStage] = useState<TransferStage>("details");

  const [targetAccount, setTargetAccount] = useState("");

  const [amount, setAmount] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));

  const [pendingTransfer, setPendingTransfer] =
    useState<TransferRequest | null>(null);

  const [timeLeft, setTimeLeft] = useState(300);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setStage("details");
    setTargetAccount("");
    setAmount("");
    setOtp(Array(6).fill(""));
    setPendingTransfer(null);
    setTimeLeft(300);
    setError("");

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || stage !== "otp") {
      return;
    }

    if (timeLeft <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setTimeLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [open, stage, timeLeft]);

  if (!open) {
    return null;
  }

  const numericAmount = Number(amount);

  const formattedTime = `${Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0")}:${(timeLeft % 60).toString().padStart(2, "0")}`;

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleTransferSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!/^\d+$/.test(targetAccount)) {
      setError("Enter a valid destination account number.");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid transfer amount.");
      return;
    }

    const transferRequest: TransferRequest = {
      SourceAccountId: account.accountId,
      TargetAccountNumber: Number(targetAccount),
      Amount: numericAmount,
    };

    setIsSubmitting(true);

    try {
      const response = await transferFunds(transferRequest);

      if (response.action === "SHOW_OTP") {
        setPendingTransfer(transferRequest);
        setStage("otp");
        setTimeLeft(300);

        window.setTimeout(() => {
          otpRefs.current[0]?.focus();
        }, 100);

        return;
      }

      if (response.action === "COMPLETED" || !response.action) {
        await onSuccess(response.message);
        onClose();
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Transfer failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateOtp = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    setOtp((currentOtp) => {
      const nextOtp = [...currentOtp];
      nextOtp[index] = digit;
      return nextOtp;
    });

    setError("");

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pastedOtp = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");

    if (pastedOtp.length === 0) {
      return;
    }

    setOtp([...pastedOtp, ...Array(6 - pastedOtp.length).fill("")]);

    otpRefs.current[Math.min(pastedOtp.length, 5)]?.focus();
  };

  const handleOtpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const otpCode = otp.join("");

    if (timeLeft <= 0) {
      setError("This verification code has expired. Start the transfer again.");
      return;
    }

    if (otpCode.length !== 6) {
      setError("Enter the complete six-digit verification code.");
      return;
    }

    if (!pendingTransfer) {
      setError("Transfer details are missing. Start again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await verifyTransferOtp({
        OtpCode: otpCode,
        TransferDetails: pendingTransfer,
      });

      if (response.action === "COMPLETED" || !response.action) {
        await onSuccess(response.message);
        onClose();
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "OTP verification failed.",
      );

      setOtp(Array(6).fill(""));
      otpRefs.current[0]?.focus();
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
        aria-labelledby="transfer-title"
        className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b1220] text-white shadow-2xl shadow-indigo-950/50"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-600 to-blue-600 p-6">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full border border-white/15" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                {stage === "details" ? (
                  <Repeat2 size={22} />
                ) : (
                  <KeyRound size={22} />
                )}
              </span>

              <h2 id="transfer-title" className="mt-5 text-2xl font-black">
                {stage === "details" ? "Transfer funds" : "Verify transfer"}
              </h2>

              <p className="mt-1 text-sm text-indigo-100">
                {stage === "details"
                  ? "Send money securely to another account."
                  : "Enter the security code sent to you."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close transfer dialog"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {stage === "details" ? (
          <form onSubmit={handleTransferSubmit} className="space-y-6 p-6">
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                <Landmark size={21} />
              </span>

              <div>
                <p className="font-black">From {account.accountType}</p>

                <p className="mt-1 font-mono text-xs tracking-widest text-slate-400">
                  •••• {String(account.accountNumber).slice(-4)}
                </p>
              </div>

              <p className="ml-auto font-black text-emerald-400">
                {formatCurrency(Number(account.balance))}
              </p>
            </div>

            <div>
              <label
                htmlFor="target-account"
                className="mb-2 block text-sm font-bold text-slate-300"
              >
                Destination account number
              </label>

              <input
                id="target-account"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                placeholder="Enter account number"
                value={targetAccount}
                disabled={isSubmitting}
                onChange={(event) => {
                  setTargetAccount(event.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 font-mono tracking-widest text-white outline-none transition placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="transfer-amount"
                className="mb-2 block text-sm font-bold text-slate-300"
              >
                Transfer amount
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">
                  ₹
                </span>

                <input
                  id="transfer-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  inputMode="decimal"
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
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 font-black shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:from-indigo-400 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Processing transfer...
                </>
              ) : (
                <>
                  Continue Securely
                  <Repeat2 size={18} />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={14} />
              Encrypted bank transfer
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6 p-6">
            <div className="text-center">
              <p className="text-sm leading-6 text-slate-400">
                Confirm the transfer of
              </p>

              <p className="mt-2 text-3xl font-black text-white">
                {formatCurrency(pendingTransfer?.Amount ?? 0)}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                to account ending in{" "}
                {String(pendingTransfer?.TargetAccountNumber ?? "").slice(-4)}
              </p>
            </div>

            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    otpRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  disabled={isSubmitting || timeLeft <= 0}
                  onChange={(event) => updateOtp(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  onPaste={handleOtpPaste}
                  aria-label={`OTP digit ${index + 1}`}
                  className="h-12 w-11 rounded-xl border border-white/10 bg-white/[0.05] text-center text-xl font-black text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-40 sm:w-12"
                />
              ))}
            </div>

            <div className="text-center">
              <p
                className={[
                  "font-mono text-sm font-black",
                  timeLeft > 0 ? "text-indigo-300" : "text-red-400",
                ].join(" ")}
              >
                {formattedTime}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {timeLeft > 0
                  ? "Verification code expires in five minutes"
                  : "Verification code expired"}
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
              disabled={isSubmitting || timeLeft <= 0}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 font-black shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Verify and Transfer
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setStage("details");
                setOtp(Array(6).fill(""));
                setError("");
              }}
              className="flex w-full items-center justify-center gap-2 text-sm font-bold text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Change transfer details
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
