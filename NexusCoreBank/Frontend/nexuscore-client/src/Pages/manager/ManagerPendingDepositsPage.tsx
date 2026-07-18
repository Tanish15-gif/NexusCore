import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";

import {
  approveManagerDeposit,
  getManagerPendingDeposits,
  rejectManagerDeposit,
  type ManagerPendingDeposit,
} from "../../services/managerService";

type ManagerDecision = "approve" | "reject";

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

function formatDate(value?: string) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function ManagerPendingDepositsPage() {
  const [deposits, setDeposits] = useState<ManagerPendingDeposit[]>([]);

  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedDeposit, setSelectedDeposit] =
    useState<ManagerPendingDeposit | null>(null);

  const [decision, setDecision] = useState<ManagerDecision>("approve");

  const [isProcessing, setIsProcessing] = useState(false);

  const loadDeposits = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getManagerPendingDeposits();

      const sortedDeposits = [
        ...(Array.isArray(response) ? response : []),
      ].sort((first, second) => {
        return (
          new Date(second.transactionDate).getTime() -
          new Date(first.transactionDate).getTime()
        );
      });

      setDeposits(sortedDeposits);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load pending deposits.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Pending Deposits | NexusCore Executive";

    void loadDeposits();
  }, []);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => setNotice(""), 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notice]);

  const filteredDeposits = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return deposits;
    }

    return deposits.filter((deposit) =>
      [
        deposit.transactionId,
        deposit.fullName,
        deposit.accountNumber,
        deposit.amount,
      ].some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [deposits, search]);

  const pendingTotal = useMemo(() => {
    return deposits.reduce((total, deposit) => {
      const amount = Number(deposit.amount);

      return Number.isFinite(amount) ? total + amount : total;
    }, 0);
  }, [deposits]);

  const openDecision = (
    deposit: ManagerPendingDeposit,
    nextDecision: ManagerDecision,
  ) => {
    setSelectedDeposit(deposit);
    setDecision(nextDecision);
  };

  const confirmDecision = async () => {
    if (!selectedDeposit) {
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const response =
        decision === "approve"
          ? await approveManagerDeposit(selectedDeposit.transactionId)
          : await rejectManagerDeposit(selectedDeposit.transactionId);

      setNotice(response.message);

      setDeposits((current) =>
        current.filter(
          (deposit) => deposit.transactionId !== selectedDeposit.transactionId,
        ),
      );

      setSelectedDeposit(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to process this transaction.",
      );

      setSelectedDeposit(null);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-20 animate-pulse rounded-xl bg-white dark:bg-[#0b1526]" />

        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((item) => (
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
        <div className="fixed right-4 top-24 z-[90] flex max-w-sm items-start gap-3 rounded-xl border border-emerald-300 bg-white px-5 py-4 text-emerald-700 shadow-xl sm:right-6 dark:border-emerald-400/20 dark:bg-[#0c1b18] dark:text-emerald-300">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

          <p className="text-sm font-bold">{notice}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Heading */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
              Risk authorization
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl dark:text-white">
              Pending Deposit Queue
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Review high-value deposits flagged for executive authorization.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadDeposits()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300 dark:hover:text-indigo-400"
          >
            <RefreshCw size={17} />
            Refresh Queue
          </button>
        </div>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1526]">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                <Clock3 size={20} />
              </span>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Awaiting review
                </p>

                <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                  {deposits.length}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1526]">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <ShieldAlert size={20} />
              </span>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Value under review
                </p>

                <p className="mt-1 text-xl font-black text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(pendingTotal)}
                </p>
              </div>
            </div>
          </article>
        </div>

        {/* Search */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1526]">
          <div className="relative max-w-xl">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search transaction, customer or account"
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.035] dark:text-white"
            />
          </div>
        </section>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-400/20 dark:bg-red-400/[0.07] dark:text-red-300">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {filteredDeposits.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-20 text-center dark:border-white/10 dark:bg-[#0b1526]">
            <CheckCircle2 size={38} className="mx-auto text-emerald-500" />

            <h3 className="mt-5 text-xl font-black text-slate-950 dark:text-white">
              Deposit queue is clear
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              There are no transactions waiting for executive review.
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
                      <TableHeading>Transaction</TableHeading>

                      <TableHeading>Customer</TableHeading>

                      <TableHeading>Account</TableHeading>

                      <TableHeading>Amount</TableHeading>

                      <TableHeading>Date</TableHeading>

                      <TableHeading align="right">Actions</TableHeading>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                    {filteredDeposits.map((deposit) => (
                      <tr
                        key={deposit.transactionId}
                        className="transition hover:bg-slate-50 dark:hover:bg-white/[0.025]"
                      >
                        <td className="px-6 py-5 font-mono text-sm text-slate-500 dark:text-slate-400">
                          #{deposit.transactionId}
                        </td>

                        <td className="px-6 py-5 font-bold text-slate-950 dark:text-white">
                          {deposit.fullName}
                        </td>

                        <td className="px-6 py-5 font-mono text-sm text-slate-600 dark:text-slate-300">
                          {deposit.accountNumber}
                        </td>

                        <td className="px-6 py-5 font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(deposit.amount)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(deposit.transactionDate)}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openDecision(deposit, "approve")}
                              className="flex h-9 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 text-xs font-black text-white transition hover:bg-indigo-500"
                            >
                              <Check size={15} />
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() => openDecision(deposit, "reject")}
                              className="flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-black text-red-600 transition hover:bg-red-50 dark:border-red-400/20 dark:text-red-300 dark:hover:bg-red-400/10"
                            >
                              <X size={15} />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Mobile cards */}
            <section className="space-y-3 lg:hidden">
              {filteredDeposits.map((deposit) => (
                <article
                  key={deposit.transactionId}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1526]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
                        Transaction #{deposit.transactionId}
                      </p>

                      <h3 className="mt-2 font-black text-slate-950 dark:text-white">
                        {deposit.fullName}
                      </h3>

                      <p className="mt-1 font-mono text-sm text-slate-500 dark:text-slate-400">
                        {deposit.accountNumber}
                      </p>
                    </div>

                    <p className="text-right font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(deposit.amount)}
                    </p>
                  </div>

                  <p className="mt-4 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
                    {formatDate(deposit.transactionDate)}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => openDecision(deposit, "approve")}
                      className="flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 text-sm font-black text-white"
                    >
                      <Check size={16} />
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() => openDecision(deposit, "reject")}
                      className="flex h-11 items-center justify-center gap-2 rounded-lg border border-red-200 text-sm font-black text-red-600 dark:border-red-400/20 dark:text-red-300"
                    >
                      <X size={16} />
                      Reject
                    </button>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </div>

      {/* Confirmation dialog */}
      {selectedDeposit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0b1526]">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">
                  Executive authorization
                </p>

                <h3 className="mt-2 text-xl font-black text-slate-950 dark:text-white">
                  {decision === "approve"
                    ? "Approve this deposit?"
                    : "Reject this deposit?"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDeposit(null)}
                disabled={isProcessing}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.035]">
              <p className="font-black text-slate-950 dark:text-white">
                {selectedDeposit.fullName}
              </p>

              <p className="mt-1 font-mono text-sm text-slate-500 dark:text-slate-400">
                {selectedDeposit.accountNumber}
              </p>

              <p className="mt-4 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(selectedDeposit.amount)}
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedDeposit(null)}
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

function TableHeading({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={[
        "whitespace-nowrap px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400",
        align === "right" ? "text-right" : "text-left",
      ].join(" ")}
    >
      {children}
    </th>
  );
}
