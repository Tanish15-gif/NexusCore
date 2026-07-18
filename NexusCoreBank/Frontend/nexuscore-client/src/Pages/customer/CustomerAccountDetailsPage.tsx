import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Landmark,
  RefreshCw,
  Repeat2,
} from "lucide-react";

import DepositModal from "../../Components/customer/actions/DepositModal";
import TransferModal from "../../Components/customer/actions/TransferModal";
import WithdrawModal from "../../Components/customer/actions/WithdrawModal";

import { useCustomerDashboard } from "../../Components/customer/CustomerDashboardLayout";

import {
  getCustomerTransactions,
  type CustomerTransaction,
} from "../../services/customerService";

type ActiveAction = "deposit" | "withdraw" | "transfer" | null;

function formatCurrency(value: unknown): string {
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

function formatAccountType(accountType: string) {
  switch (accountType.toLowerCase()) {
    case "fixeddeposit":
      return "Fixed Deposit";

    case "recurringdeposit":
      return "Recurring Deposit";

    case "dailydeposit":
      return "Daily Deposit";

    default:
      return accountType;
  }
}

function getStatusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";

    case "pending":
      return "border-amber-500/30 bg-amber-500/10 text-amber-400";

    case "frozen":
      return "border-red-500/30 bg-red-500/10 text-red-400";

    default:
      return "border-slate-500/30 bg-slate-500/10 text-slate-400";
  }
}

function formatDescription(value?: string) {
  if (!value) {
    return "System transaction";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getTransactionDirection(transaction: CustomerTransaction) {
  const type = transaction.transactionType?.toLowerCase() ?? "";

  const merchant = transaction.merchantName?.toLowerCase() ?? "";

  if (type === "deposit" || merchant.includes("transfer_in")) {
    return "incoming";
  }

  return "outgoing";
}

export default function CustomerAccountDetailsPage() {
  const navigate = useNavigate();
  const { accountId } = useParams();

  const {
    accounts,
    isLoading: isAccountsLoading,
    refreshDashboard,
  } = useCustomerDashboard();

  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);

  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);

  const [transactionError, setTransactionError] = useState("");

  const [activeAction, setActiveAction] = useState<ActiveAction>(null);

  const [notice, setNotice] = useState("");

  const account = useMemo(() => {
    return accounts.find(
      (item) => String(item.accountId) === String(accountId),
    );
  }, [accounts, accountId]);

  const accountTransactions = useMemo(() => {
    return transactions.filter(
      (transaction) => String(transaction.accountId) === String(accountId),
    );
  }, [transactions, accountId]);

  const loadTransactions = useCallback(async () => {
    setIsTransactionsLoading(true);
    setTransactionError("");

    try {
      const response = await getCustomerTransactions();

      setTransactions(response);
    } catch (requestError) {
      setTransactionError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load transactions.",
      );
    } finally {
      setIsTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Account Details | NexusCore Bank";

    void loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setNotice("");
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notice]);

  const handleActionSuccess = async (message: string) => {
    setNotice(message);

    await Promise.all([refreshDashboard(), loadTransactions()]);
  };

  if (isAccountsLoading) {
    return (
      <div className="h-96 animate-pulse rounded-2xl bg-white dark:bg-[#0b1526]" />
    );
  }

  if (!account) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-white/10 dark:bg-[#0b1526]">
        <h2 className="text-xl font-black">Account not found</h2>

        <button
          type="button"
          onClick={() => navigate("/dashboard/accounts")}
          className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-black text-white"
        >
          Back to Accounts
        </button>
      </div>
    );
  }

  const overdraftLimit = Number(account.overDraftLimit ?? 0);

  const dailyAmount = Number(account.dailyAmount ?? 0);

  const isActionDisabled = ["pending", "frozen", "closed", "rejected"].includes(
    account.status.toLowerCase(),
  );

  return (
    <>
      {notice && (
        <div className="fixed right-4 top-24 z-[90] flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-400/20 bg-[#0c1b18] px-5 py-4 text-emerald-300 shadow-2xl shadow-black/40 sm:right-6">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" />

          <p className="text-sm font-bold">{notice}</p>
        </div>
      )}

      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/dashboard/accounts")}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 font-black text-slate-800 transition hover:bg-slate-100 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/5"
        >
          <ArrowLeft size={17} />
          Back to Accounts
        </button>

        <section className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#0b1526]">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl" />

          <div className="relative flex items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                <Landmark size={23} />
              </span>

              <div>
                <h1 className="text-xl font-black text-slate-950 dark:text-white">
                  {formatAccountType(account.accountType)}
                </h1>

                <p className="mt-2 font-mono text-sm tracking-[0.15em] text-slate-500 dark:text-slate-400">
                  {account.accountNumber}
                </p>
              </div>
            </div>

            <span
              className={[
                "rounded-full border px-4 py-2 text-xs font-black uppercase",
                getStatusClasses(account.status),
              ].join(" ")}
            >
              {account.status}
            </span>
          </div>

          {(overdraftLimit > 0 || dailyAmount > 0) && (
            <div className="relative mt-6 flex flex-wrap gap-3">
              {overdraftLimit > 0 && (
                <span className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300">
                  Overdraft limit: {formatCurrency(overdraftLimit)}
                </span>
              )}

              {dailyAmount > 0 && (
                <span className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300">
                  Daily deposit: {formatCurrency(dailyAmount)}
                </span>
              )}
            </div>
          )}

          <div className="relative py-12 text-center sm:py-14">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Available Balance
            </p>

            <p className="mt-4 text-4xl font-black text-emerald-600 sm:text-5xl dark:text-emerald-500">
              {formatCurrency(account.balance)}
            </p>
          </div>

          <div className="relative grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              disabled={isActionDisabled}
              onClick={() => setActiveAction("deposit")}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 font-black text-white shadow-lg shadow-indigo-500/15 transition hover:-translate-y-0.5 hover:from-indigo-500 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowDownLeft size={18} />
              Deposit
            </button>

            <button
              type="button"
              disabled={isActionDisabled}
              onClick={() => setActiveAction("withdraw")}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-red-500/40 font-black text-red-500 transition hover:-translate-y-0.5 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowUpRight size={18} />
              Withdraw
            </button>

            <button
              type="button"
              disabled={isActionDisabled}
              onClick={() => setActiveAction("transfer")}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 font-black text-slate-800 transition hover:-translate-y-0.5 hover:border-indigo-500 hover:bg-indigo-500/5 hover:text-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/30 dark:text-white"
            >
              <Repeat2 size={18} />
              Transfer
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0b1526]">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-white/10">
            <div>
              <h2 className="text-lg font-black">Account Transactions</h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Activity for this account only.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadTransactions()}
              disabled={isTransactionsLoading}
              aria-label="Refresh transactions"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-indigo-500 hover:text-indigo-500 dark:border-white/10"
            >
              <RefreshCw
                size={17}
                className={isTransactionsLoading ? "animate-spin" : ""}
              />
            </button>
          </div>

          {isTransactionsLoading ? (
            <div className="p-10 text-center text-slate-500">
              <RefreshCw size={22} className="mx-auto animate-spin" />

              <p className="mt-3 text-sm">Loading transactions...</p>
            </div>
          ) : transactionError ? (
            <div className="p-8 text-center text-sm text-red-500">
              {transactionError}
            </div>
          ) : accountTransactions.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No transactions found for this account.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-white/10">
              {accountTransactions.map((transaction, index) => {
                const direction = getTransactionDirection(transaction);

                const isIncoming = direction === "incoming";

                return (
                  <div
                    key={
                      transaction.transactionId ??
                      `${transaction.accountId}-${index}`
                    }
                    className="flex items-center justify-between gap-5 px-5 py-4 transition hover:bg-slate-50 sm:px-6 dark:hover:bg-white/[0.025]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-950 dark:text-white">
                        {formatDescription(
                          transaction.merchantName ??
                            transaction.transactionType,
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {transaction.transactionDate
                          ? new Date(
                              transaction.transactionDate,
                            ).toLocaleString("en-IN")
                          : "Date unavailable"}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p
                        className={[
                          "font-black",
                          isIncoming ? "text-emerald-500" : "text-red-500",
                        ].join(" ")}
                      >
                        {isIncoming ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>

                      <p className="mt-1 text-[11px] font-black uppercase tracking-wide text-slate-400">
                        {transaction.status ?? "Completed"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <DepositModal
        open={activeAction === "deposit"}
        account={account}
        onClose={() => setActiveAction(null)}
        onSuccess={handleActionSuccess}
      />

      <WithdrawModal
        open={activeAction === "withdraw"}
        account={account}
        onClose={() => setActiveAction(null)}
        onSuccess={handleActionSuccess}
      />

      <TransferModal
        open={activeAction === "transfer"}
        account={account}
        onClose={() => setActiveAction(null)}
        onSuccess={handleActionSuccess}
      />
    </>
  );
}
