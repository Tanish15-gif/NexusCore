import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Landmark,
  Plus,
  RefreshCw,
  Vault,
} from "lucide-react";

import { useCustomerDashboard } from "../../Components/customer/CustomerDashboardLayout";
import OpenAccountModal from "../../Components/customer/actions/OpenAccountModal";

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
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";

    case "pending":
      return "border-amber-500/30 bg-amber-500/10 text-amber-500";

    case "frozen":
      return "border-red-500/30 bg-red-500/10 text-red-500";

    case "closed":
    case "rejected":
      return "border-slate-500/30 bg-slate-500/10 text-slate-400";

    default:
      return "border-slate-500/30 bg-slate-500/10 text-slate-400";
  }
}

export default function CustomerAccountsPage() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const { accounts, isLoading, error, refreshDashboard } =
    useCustomerDashboard();

  const [isOpenAccountModalOpen, setIsOpenAccountModalOpen] = useState(false);

  const [notice, setNotice] = useState("");

  useEffect(() => {
    document.title = "Your Accounts | NexusCore Bank";
  }, []);

  useEffect(() => {
    if (searchParams.get("open") !== "true") {
      return;
    }

    setIsOpenAccountModalOpen(true);

    const updatedParams = new URLSearchParams(searchParams);

    updatedParams.delete("open");

    setSearchParams(updatedParams, {
      replace: true,
    });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setNotice("");
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notice]);

  const handleAccountCreated = async (message: string) => {
    setNotice(message);
    await refreshDashboard();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0b1526]"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-white p-8 text-center dark:bg-[#0b1526]">
        <AlertCircle size={34} className="mx-auto text-red-500" />

        <h2 className="mt-4 text-xl font-black">Unable to load accounts</h2>

        <p className="mt-2 text-sm text-slate-500">{error}</p>

        <button
          type="button"
          onClick={() => void refreshDashboard()}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 font-bold text-white"
        >
          <RefreshCw size={17} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Success notification */}
      {notice && (
        <div className="fixed right-4 top-24 z-[90] flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-400/20 bg-[#0c1b18] px-5 py-4 text-emerald-300 shadow-2xl shadow-black/40 sm:right-6">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" />

          <p className="text-sm font-bold">{notice}</p>
        </div>
      )}

      <div>
        {/* Heading */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">
              Your Accounts
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manage all your financial accounts in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpenAccountModalOpen(true)}
            aria-label="Open new account"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-1 hover:bg-emerald-400"
          >
            <Plus size={27} />
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center dark:border-white/10 dark:bg-[#0b1526]">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
              <Vault size={30} />
            </span>

            <h3 className="mt-5 text-xl font-black">No accounts yet</h3>

            <p className="mt-2 text-sm text-slate-500">
              Open your first account to begin banking.
            </p>

            <button
              type="button"
              onClick={() => setIsOpenAccountModalOpen(true)}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 font-black text-white transition hover:bg-indigo-500"
            >
              <Plus size={18} />
              Open Account
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => {
              const accountNumber = String(account.accountNumber);

              return (
                <button
                  key={account.accountId}
                  type="button"
                  onClick={() =>
                    navigate(`/dashboard/accounts/${account.accountId}`)
                  }
                  className="group flex w-full items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white px-5 py-5 text-left transition hover:border-blue-400 hover:bg-slate-50 dark:border-white/10 dark:bg-[#0b1526] dark:hover:border-blue-500/40 dark:hover:bg-[#0e1a2e]"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                      <Landmark size={22} />
                    </span>

                    <div className="min-w-0">
                      <h3 className="truncate text-base font-black text-slate-950 dark:text-white">
                        {formatAccountType(account.accountType)}
                      </h3>

                      <p className="mt-1 font-mono text-sm tracking-wider text-slate-500 dark:text-slate-400">
                        •••• {accountNumber.slice(-4)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4 sm:gap-7">
                    <div className="text-right">
                      <p className="text-base font-black text-emerald-600 sm:text-lg dark:text-emerald-500">
                        {formatCurrency(account.balance)}
                      </p>

                      <span
                        className={[
                          "mt-1 inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase",
                          getStatusClasses(account.status),
                        ].join(" ")}
                      >
                        {account.status}
                      </span>
                    </div>

                    <ChevronRight
                      size={21}
                      className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-500"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Render only once, outside the account list */}
      <OpenAccountModal
        open={isOpenAccountModalOpen}
        onClose={() => setIsOpenAccountModalOpen(false)}
        onSuccess={handleAccountCreated}
      />
    </>
  );
}
