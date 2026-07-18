import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Eye,
  Landmark,
  LoaderCircle,
  Lock,
  Mail,
  RefreshCw,
  Search,
  Unlock,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import {
  freezeManagerAccount,
  getManagerGlobalLedger,
  unfreezeManagerAccount,
  updateManagerAccountEmail,
  type ManagerLedgerAccount,
} from "../../services/managerService";

type LedgerStatusFilter = "all" | "active" | "frozen" | "pending" | "closed";

type SecurityAction = "freeze" | "unfreeze";

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

function formatAccountType(value: string): string {
  switch (value.toLowerCase()) {
    case "fixeddeposit":
      return "Fixed Deposit";

    case "recurringdeposit":
      return "Recurring Deposit";

    case "dailydeposit":
      return "Daily Deposit";

    default:
      return value;
  }
}

function getStatusClasses(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/[0.08] dark:text-emerald-300";

    case "frozen":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/[0.08] dark:text-blue-300";

    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/[0.08] dark:text-amber-300";

    case "closed":
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-400/[0.08] dark:text-red-300";

    default:
      return "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300";
  }
}

export default function ManagerGlobalLedgerPage() {
  const [accounts, setAccounts] = useState<ManagerLedgerAccount[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LedgerStatusFilter>("all");

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedAccount, setSelectedAccount] =
    useState<ManagerLedgerAccount | null>(null);

  const [newEmail, setNewEmail] = useState("");

  const [securityAction, setSecurityAction] = useState<SecurityAction | null>(
    null,
  );

  const [activeOperation, setActiveOperation] = useState<
    "email" | "freeze" | "unfreeze" | null
  >(null);

  const loadLedger = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getManagerGlobalLedger();

      setAccounts(Array.isArray(response) ? response : []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load the global ledger.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Global Ledger | NexusCore Executive";

    void loadLedger();
  }, [loadLedger]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setNotice("");
    }, 4500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notice]);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return accounts.filter((account) => {
      const normalizedStatus = account.accountStatus.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        normalizedStatus === statusFilter ||
        (statusFilter === "closed" && normalizedStatus === "rejected");

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        account.accountId,
        account.accountNumber,
        account.fullName,
        account.email,
        account.accountType,
        account.accountStatus,
        account.balance,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      );
    });
  }, [accounts, search, statusFilter]);

  const summary = useMemo(() => {
    let totalBalance = 0;
    let activeAccounts = 0;
    let frozenAccounts = 0;

    accounts.forEach((account) => {
      const balance = Number(account.balance);

      if (Number.isFinite(balance)) {
        totalBalance += balance;
      }

      const status = account.accountStatus.toLowerCase();

      if (status === "active") {
        activeAccounts += 1;
      }

      if (status === "frozen") {
        frozenAccounts += 1;
      }
    });

    return {
      totalBalance,
      activeAccounts,
      frozenAccounts,
      totalAccounts: accounts.length,
    };
  }, [accounts]);

  const openAccountReview = (account: ManagerLedgerAccount) => {
    setSelectedAccount(account);
    setNewEmail("");
    setSecurityAction(null);
    setError("");
  };

  const closeAccountReview = () => {
    if (activeOperation) {
      return;
    }

    setSelectedAccount(null);
    setSecurityAction(null);
    setNewEmail("");
  };

  const handleEmailUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedAccount) {
      return;
    }

    const normalizedEmail = newEmail.trim().toLowerCase();

    setError("");

    if (!normalizedEmail) {
      setError("Enter the new email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setActiveOperation("email");

    try {
      const response = await updateManagerAccountEmail(
        selectedAccount.accountId,
        normalizedEmail,
      );

      setNotice(response.message);

      setAccounts((current) =>
        current.map((account) =>
          account.accountId === selectedAccount.accountId
            ? {
                ...account,
                email: normalizedEmail,
              }
            : account,
        ),
      );

      setSelectedAccount((current) =>
        current
          ? {
              ...current,
              email: normalizedEmail,
            }
          : null,
      );

      setNewEmail("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update the email.",
      );
    } finally {
      setActiveOperation(null);
    }
  };

  const confirmSecurityAction = async () => {
    if (!selectedAccount || !securityAction) {
      return;
    }

    setError("");
    setActiveOperation(securityAction);

    try {
      const response =
        securityAction === "freeze"
          ? await freezeManagerAccount(selectedAccount.accountNumber)
          : await unfreezeManagerAccount(selectedAccount.accountNumber);

      setNotice(response.message);

      await loadLedger();

      setSelectedAccount(null);
      setSecurityAction(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update account security.",
      );

      setSecurityAction(null);
    } finally {
      setActiveOperation(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-20 animate-pulse rounded-xl bg-white dark:bg-[#0b1526]" />

        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-xl bg-white dark:bg-[#0b1526]"
            />
          ))}
        </div>

        <div className="h-96 animate-pulse rounded-xl bg-white dark:bg-[#0b1526]" />
      </div>
    );
  }

  return (
    <>
      {notice && (
        <div className="fixed right-4 top-24 z-[110] flex max-w-sm items-start gap-3 rounded-xl border border-emerald-300 bg-white px-5 py-4 text-emerald-700 shadow-xl sm:right-6 dark:border-emerald-400/20 dark:bg-[#0c1b18] dark:text-emerald-300">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

          <p className="text-sm font-bold">{notice}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Heading */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
              Branch oversight
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl dark:text-white">
              Global Ledger
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Review every customer account and execute authorized account
              operations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadLedger()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300 dark:hover:text-indigo-400"
          >
            <RefreshCw size={17} />
            Refresh Ledger
          </button>
        </div>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={BookOpen}
            label="Total accounts"
            value={String(summary.totalAccounts)}
            variant="indigo"
          />

          <SummaryCard
            icon={CheckCircle2}
            label="Active accounts"
            value={String(summary.activeAccounts)}
            variant="green"
          />

          <SummaryCard
            icon={Lock}
            label="Frozen accounts"
            value={String(summary.frozenAccounts)}
            variant="blue"
          />

          <SummaryCard
            icon={WalletCards}
            label="Ledger balance"
            value={formatCurrency(summary.totalBalance)}
            variant="slate"
          />
        </div>

        {/* Search and filters */}
        <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between dark:border-white/10 dark:bg-[#0b1526]">
          <div className="relative w-full xl:max-w-xl">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search account, customer, email or type"
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.035] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 sm:flex">
            {(
              [
                "all",
                "active",
                "frozen",
                "pending",
                "closed",
              ] as LedgerStatusFilter[]
            ).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={[
                  "min-h-10 rounded-lg px-3 text-xs font-black capitalize transition sm:px-4",
                  statusFilter === filter
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300 dark:hover:bg-white/[0.07]",
                ].join(" ")}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {error && !selectedAccount && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-400/20 dark:bg-red-400/[0.07] dark:text-red-300">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {filteredAccounts.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-20 text-center dark:border-white/10 dark:bg-[#0b1526]">
            <BookOpen
              size={38}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <h3 className="mt-5 text-xl font-black text-slate-950 dark:text-white">
              No ledger records found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Change the search or status filter.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <section className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block dark:border-white/10 dark:bg-[#0b1526]">
              <div className="nexus-scrollbar overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50 dark:bg-white/[0.025]">
                    <tr>
                      <TableHeading>System ID</TableHeading>

                      <TableHeading>Account</TableHeading>

                      <TableHeading>Customer</TableHeading>

                      <TableHeading>Type</TableHeading>

                      <TableHeading align="right">Balance</TableHeading>

                      <TableHeading align="center">Status</TableHeading>

                      <TableHeading align="right">Action</TableHeading>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                    {filteredAccounts.map((account) => (
                      <tr
                        key={account.accountId}
                        className="transition hover:bg-slate-50 dark:hover:bg-white/[0.025]"
                      >
                        <td className="px-6 py-5 font-mono text-sm text-slate-500 dark:text-slate-400">
                          #{account.accountId}
                        </td>

                        <td className="px-6 py-5 font-mono text-sm text-slate-700 dark:text-slate-300">
                          {account.accountNumber}
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-950 dark:text-white">
                            {account.fullName}
                          </p>

                          <p className="mt-1 max-w-52 truncate text-xs text-slate-500">
                            {account.email}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {formatAccountType(account.accountType)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-right font-black text-slate-950 dark:text-white">
                          {formatCurrency(account.balance)}
                        </td>

                        <td className="px-6 py-5 text-center">
                          <StatusBadge status={account.accountStatus} />
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            onClick={() => openAccountReview(account)}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-indigo-200 px-3 text-xs font-black text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-400/20 dark:text-indigo-300 dark:hover:bg-indigo-400/10"
                          >
                            <Eye size={15} />
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Mobile cards */}
            <section className="space-y-3 lg:hidden">
              {filteredAccounts.map((account) => (
                <article
                  key={account.accountId}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1526]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">
                        Account #{account.accountId}
                      </p>

                      <h3 className="mt-2 truncate font-black text-slate-950 dark:text-white">
                        {account.fullName}
                      </h3>

                      <p className="mt-1 font-mono text-sm text-slate-500">
                        {account.accountNumber}
                      </p>
                    </div>

                    <StatusBadge status={account.accountStatus} />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 border-y border-slate-200 py-4 dark:border-white/10">
                    <LedgerDetail
                      label="Type"
                      value={formatAccountType(account.accountType)}
                    />

                    <LedgerDetail
                      label="Balance"
                      value={formatCurrency(account.balance)}
                      align="right"
                    />

                    <LedgerDetail
                      label="Email"
                      value={account.email}
                      className="col-span-2"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => openAccountReview(account)}
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-sm font-black text-white transition hover:bg-indigo-500"
                  >
                    <Eye size={16} />
                    Review Account
                  </button>
                </article>
              ))}
            </section>
          </>
        )}
      </div>

      {/* Account review modal */}
      {selectedAccount && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6">
          <div className="nexus-scrollbar max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1526]">
            <header className="sticky top-0 z-20 flex items-start justify-between gap-5 border-b border-slate-200 bg-white px-5 py-5 sm:px-6 dark:border-white/10 dark:bg-[#0b1526]">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.17em] text-indigo-600 dark:text-indigo-400">
                  Executive account review
                </p>

                <h3 className="mt-2 text-xl font-black text-slate-950 dark:text-white">
                  {selectedAccount.fullName}
                </h3>

                <p className="mt-1 font-mono text-sm text-slate-500">
                  {selectedAccount.accountNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={closeAccountReview}
                disabled={Boolean(activeOperation)}
                aria-label="Close account review"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
              >
                <X size={17} />
              </button>
            </header>

            <div className="space-y-6 p-5 sm:p-6">
              {/* Account overview */}
              <section className="grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2 dark:border-white/10 dark:bg-white/10">
                <ModalDetail
                  icon={Landmark}
                  label="Account type"
                  value={formatAccountType(selectedAccount.accountType)}
                />

                <ModalDetail
                  icon={WalletCards}
                  label="Available balance"
                  value={formatCurrency(selectedAccount.balance)}
                />

                <ModalDetail
                  icon={UserRound}
                  label="Customer"
                  value={selectedAccount.fullName}
                />

                <ModalDetail
                  icon={Mail}
                  label="Registered email"
                  value={selectedAccount.email}
                />
              </section>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-slate-950 dark:text-white">
                    Security status
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Current account access state
                  </p>
                </div>

                <StatusBadge status={selectedAccount.accountStatus} />
              </div>

              {/* Email override */}
              <section className="rounded-xl border border-slate-200 p-5 dark:border-white/10">
                <div>
                  <p className="font-black text-slate-950 dark:text-white">
                    Registered email override
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Replace the customer email after identity verification.
                  </p>
                </div>

                <form
                  onSubmit={handleEmailUpdate}
                  className="mt-5 flex flex-col gap-3 sm:flex-row"
                >
                  <div className="relative flex-1">
                    <Mail
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      value={newEmail}
                      disabled={Boolean(activeOperation)}
                      onChange={(event) => {
                        setNewEmail(event.target.value);

                        setError("");
                      }}
                      placeholder="Enter verified email"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.035] dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={activeOperation === "email"}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-black text-white transition hover:bg-indigo-500 disabled:opacity-60"
                  >
                    {activeOperation === "email" ? (
                      <>
                        <LoaderCircle size={17} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Mail size={16} />
                        Update Email
                      </>
                    )}
                  </button>
                </form>
              </section>

              {/* Security controls */}
              <section className="rounded-xl border border-red-200 bg-red-50/50 p-5 dark:border-red-400/20 dark:bg-red-400/[0.04]">
                <p className="font-black text-slate-950 dark:text-white">
                  Account security controls
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Freeze compromised accounts or restore access after
                  verification.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={
                      selectedAccount.accountStatus.toLowerCase() ===
                        "frozen" || Boolean(activeOperation)
                    }
                    onClick={() => setSecurityAction("freeze")}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Lock size={16} />
                    Freeze Account
                  </button>

                  <button
                    type="button"
                    disabled={
                      selectedAccount.accountStatus.toLowerCase() !==
                        "frozen" || Boolean(activeOperation)
                    }
                    onClick={() => setSecurityAction("unfreeze")}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-white text-sm font-black text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-emerald-400/20 dark:bg-transparent dark:text-emerald-300 dark:hover:bg-emerald-400/10"
                  >
                    <Unlock size={16} />
                    Restore Access
                  </button>
                </div>
              </section>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-400/20 dark:bg-red-400/[0.07] dark:text-red-300"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />

                  <p className="text-sm font-semibold">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Freeze/unfreeze confirmation */}
      {selectedAccount && securityAction && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0b1526]">
            <div className="flex items-start gap-4">
              <span
                className={[
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                  securityAction === "freeze"
                    ? "bg-red-100 text-red-600 dark:bg-red-400/10 dark:text-red-300"
                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300",
                ].join(" ")}
              >
                {securityAction === "freeze" ? (
                  <Lock size={20} />
                ) : (
                  <Unlock size={20} />
                )}
              </span>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">
                  Confirm security action
                </p>

                <h3 className="mt-2 text-xl font-black text-slate-950 dark:text-white">
                  {securityAction === "freeze"
                    ? "Freeze this account?"
                    : "Restore this account?"}
                </h3>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Account <strong>{selectedAccount.accountNumber}</strong> will be{" "}
              {securityAction === "freeze"
                ? "blocked from protected financial operations."
                : "returned to active status."}
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={Boolean(activeOperation)}
                onClick={() => setSecurityAction(null)}
                className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-black text-slate-700 dark:border-white/10 dark:text-slate-300"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void confirmSecurityAction()}
                disabled={Boolean(activeOperation)}
                className={[
                  "flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-black text-white disabled:opacity-60",
                  securityAction === "freeze"
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-emerald-600 hover:bg-emerald-500",
                ].join(" ")}
              >
                {activeOperation ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Processing...
                  </>
                ) : securityAction === "freeze" ? (
                  <>
                    <Lock size={16} />
                    Confirm Freeze
                  </>
                ) : (
                  <>
                    <Unlock size={16} />
                    Confirm Restore
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

function SummaryCard({
  icon: Icon,
  label,
  value,
  variant,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
  variant: "indigo" | "green" | "blue" | "slate";
}) {
  const styles = {
    indigo:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
    green:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    slate:
      "bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1526]">
      <div className="flex items-center gap-4">
        <span
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
            styles[variant],
          ].join(" ")}
        >
          <Icon size={20} />
        </span>

        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-xl font-black text-slate-950 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={[
        "inline-flex whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] font-black uppercase",
        getStatusClasses(status),
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function TableHeading({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "center" | "right";
}) {
  return (
    <th
      className={[
        "whitespace-nowrap px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400",
        align === "center"
          ? "text-center"
          : align === "right"
            ? "text-right"
            : "text-left",
      ].join(" ")}
    >
      {children}
    </th>
  );
}

function LedgerDetail({
  label,
  value,
  align = "left",
  className = "",
}: {
  label: string;
  value: string;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <div
      className={[align === "right" ? "text-right" : "", className].join(" ")}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-bold text-slate-700 dark:text-slate-300">
        {value}
      </p>
    </div>
  );
}

function ModalDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Landmark;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 bg-white p-4 dark:bg-[#0b1526]">
      <Icon size={17} className="text-indigo-600 dark:text-indigo-400" />

      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-bold text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}
