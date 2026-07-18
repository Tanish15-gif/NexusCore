import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock3,
  Landmark,
  LoaderCircle,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  approvePendingAccount,
  getPendingAccounts,
  rejectPendingAccount,
  type PendingAccount,
} from "../../services/employeeService";

type Decision = "approve" | "reject";

function formatCurrency(value: unknown) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatAccountType(type: string) {
  switch (type.toLowerCase()) {
    case "fixeddeposit":
      return "Fixed Deposit";

    case "recurringdeposit":
      return "Recurring Deposit";

    case "dailydeposit":
      return "Daily Deposit";

    default:
      return type;
  }
}

export default function EmployeePendingAccountsPage() {
  const [accounts, setAccounts] = useState<PendingAccount[]>([]);

  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedAccount, setSelectedAccount] = useState<PendingAccount | null>(
    null,
  );

  const [decision, setDecision] = useState<Decision>("approve");

  const [isProcessing, setIsProcessing] = useState(false);

  const loadAccounts = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getPendingAccounts();

      setAccounts(Array.isArray(response) ? response : []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load pending accounts.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Pending Approvals | NexusCore Staff";

    void loadAccounts();
  }, []);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = window.setTimeout(() => setNotice(""), 4000);

    return () => window.clearTimeout(timeout);
  }, [notice]);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return accounts;
    }

    return accounts.filter((account) =>
      [
        account.accountNumber,
        account.accountType,
        account.fullName,
        account.email,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [accounts, search]);

  const openDecision = (account: PendingAccount, nextDecision: Decision) => {
    setSelectedAccount(account);
    setDecision(nextDecision);
  };

  const confirmDecision = async () => {
    if (!selectedAccount) {
      return;
    }

    setIsProcessing(true);

    try {
      const response =
        decision === "approve"
          ? await approvePendingAccount(selectedAccount.accountId)
          : await rejectPendingAccount(selectedAccount.accountId);

      setNotice(response.message);

      setAccounts((current) =>
        current.filter(
          (account) => account.accountId !== selectedAccount.accountId,
        ),
      );

      setSelectedAccount(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to process this account.",
      );

      setSelectedAccount(null);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-44 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0b1526]"
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {notice && (
        <div className="fixed right-4 top-24 z-[80] flex max-w-sm items-start gap-3 rounded-xl border border-emerald-300 bg-white px-5 py-4 text-emerald-700 shadow-xl dark:border-emerald-400/20 dark:bg-[#0c1b18] dark:text-emerald-300">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

          <p className="text-sm font-bold">{notice}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
              Approval queue
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl dark:text-white">
              Pending Accounts
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Review customer account applications awaiting branch approval.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadAccounts()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300 dark:hover:text-indigo-400"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-[#0b1526]">
          <div className="relative w-full sm:max-w-lg">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer or account number"
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.035] dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
            <Clock3 size={16} className="text-amber-500" />
            {accounts.length} waiting
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-400/20 dark:bg-red-400/[0.07] dark:text-red-300">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {filteredAccounts.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-20 text-center dark:border-white/10 dark:bg-[#0b1526]">
            <CheckCircle2 size={36} className="mx-auto text-emerald-500" />

            <h3 className="mt-5 text-xl font-black text-slate-950 dark:text-white">
              Approval queue is clear
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              There are no pending account applications.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredAccounts.map((account) => (
              <article
                key={account.accountId}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1526]"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      <Landmark size={20} />
                    </span>

                    <div className="min-w-0">
                      <h3 className="truncate font-black text-slate-950 dark:text-white">
                        {formatAccountType(account.accountType)}
                      </h3>

                      <p className="mt-1 font-mono text-sm tracking-wider text-slate-500 dark:text-slate-400">
                        {account.accountNumber}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-black uppercase text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/[0.08] dark:text-amber-300">
                    Pending
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 border-y border-slate-200 py-5 dark:border-white/10">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Customer
                    </p>

                    <p className="mt-1 truncate text-sm font-bold text-slate-700 dark:text-slate-300">
                      {account.fullName ?? "Customer"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Initial deposit
                    </p>

                    <p className="mt-1 font-black text-slate-950 dark:text-white">
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => openDecision(account, "approve")}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 text-sm font-black text-white transition hover:bg-indigo-500"
                  >
                    <Check size={17} />
                    Approve
                  </button>

                  <button
                    type="button"
                    onClick={() => openDecision(account, "reject")}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg border border-red-200 text-sm font-black text-red-600 transition hover:bg-red-50 dark:border-red-400/20 dark:text-red-300 dark:hover:bg-red-400/10"
                  >
                    <X size={17} />
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedAccount && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0b1526]">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">
                  Confirm action
                </p>

                <h3 className="mt-2 text-xl font-black text-slate-950 dark:text-white">
                  {decision === "approve"
                    ? "Approve this account?"
                    : "Reject this account?"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAccount(null)}
                disabled={isProcessing}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.035]">
              <p className="font-black text-slate-950 dark:text-white">
                {formatAccountType(selectedAccount.accountType)}
              </p>

              <p className="mt-1 font-mono text-sm text-slate-500 dark:text-slate-400">
                {selectedAccount.accountNumber}
              </p>

              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                Opening amount:{" "}
                <strong>{formatCurrency(selectedAccount.balance)}</strong>
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedAccount(null)}
                disabled={isProcessing}
                className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-black text-slate-700 dark:border-white/10 dark:text-slate-300"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void confirmDecision()}
                disabled={isProcessing}
                className={[
                  "flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-black text-white disabled:opacity-60",
                  decision === "approve"
                    ? "bg-indigo-600 hover:bg-indigo-500"
                    : "bg-red-600 hover:bg-red-500",
                ].join(" ")}
              >
                {isProcessing ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Processing...
                  </>
                ) : decision === "approve" ? (
                  <>
                    <Check size={17} />
                    Confirm Approval
                  </>
                ) : (
                  <>
                    <X size={17} />
                    Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
