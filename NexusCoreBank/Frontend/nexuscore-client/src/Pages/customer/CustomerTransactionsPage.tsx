import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  getCustomerTransactions,
  type CustomerTransaction,
} from "../../services/transactionService";

type TransactionFilter = "all" | "completed" | "pending";

function formatCurrency(value: unknown): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "₹0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value?: string): string {
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
  }).format(date);
}

function formatTransactionType(type?: string): string {
  if (!type) {
    return "Transaction";
  }

  switch (type.toLowerCase()) {
    case "deposit":
      return "Deposit";

    case "withdraw":
    case "withdrawal":
      return "Withdrawal";

    case "transfer":
      return "Transfer";

    default:
      return type
        .replaceAll("_", " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
  }
}

function getTransactionDescription(transaction: CustomerTransaction): string {
  const item = transaction as CustomerTransaction & {
    merchantName?: string;
    description?: string;
  };

  const description =
    item.description ?? item.merchantName ?? item.transactionType;

  if (!description) {
    return "System transaction";
  }

  return description
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getTypeClasses(type?: string): string {
  switch (type?.toLowerCase()) {
    case "deposit":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400";

    case "withdraw":
    case "withdrawal":
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400";

    case "transfer":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400";

    default:
      return "border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300";
  }
}

function getStatusClasses(status?: string): string {
  switch (status?.toLowerCase()) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400";

    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400";

    case "failed":
    case "rejected":
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400";

    default:
      return "border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300";
  }
}

function isIncomingTransaction(transaction: CustomerTransaction): boolean {
  const type = transaction.transactionType?.toLowerCase() ?? "";

  const description = getTransactionDescription(transaction).toLowerCase();

  return (
    type === "deposit" ||
    description.includes("transfer in") ||
    description.includes("credit")
  );
}

function isOutgoingTransaction(transaction: CustomerTransaction): boolean {
  const type = transaction.transactionType?.toLowerCase() ?? "";

  const description = getTransactionDescription(transaction).toLowerCase();

  return (
    type === "withdraw" ||
    type === "withdrawal" ||
    description.includes("transfer out") ||
    description.includes("debit")
  );
}

function getSignedAmount(transaction: CustomerTransaction): string {
  const formattedAmount = formatCurrency(transaction.amount);

  if (isIncomingTransaction(transaction)) {
    return `+ ${formattedAmount}`;
  }

  if (isOutgoingTransaction(transaction)) {
    return `- ${formattedAmount}`;
  }

  return formattedAmount;
}

function getAmountClasses(transaction: CustomerTransaction): string {
  if (isIncomingTransaction(transaction)) {
    return "text-emerald-600 dark:text-emerald-400";
  }

  if (isOutgoingTransaction(transaction)) {
    return "text-rose-600 dark:text-rose-400";
  }

  return "text-blue-600 dark:text-blue-400";
}

function getTransactionKey(
  transaction: CustomerTransaction,
  index: number,
): string {
  return [
    transaction.transactionId ?? "no-id",
    transaction.accountId ?? "no-account",
    transaction.transactionDate ?? "no-date",
    transaction.transactionType ?? "no-type",
    transaction.amount ?? "no-amount",
    index,
  ].join("-");
}

export default function CustomerTransactionsPage() {
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<TransactionFilter>("all");

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const loadTransactions = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getCustomerTransactions();

      const sortedTransactions = [...response].sort((first, second) => {
        const firstDate = new Date(first.transactionDate ?? 0).getTime();

        const secondDate = new Date(second.transactionDate ?? 0).getTime();

        return secondDate - firstDate;
      });

      setTransactions(sortedTransactions);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load transactions.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Recent Transactions | NexusCore Bank";

    void loadTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesStatus =
        statusFilter === "all" ||
        transaction.status?.toLowerCase() === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        String(transaction.accountId ?? ""),
        transaction.transactionType ?? "",
        transaction.status ?? "",
        getTransactionDescription(transaction),
        String(transaction.amount ?? ""),
      ].some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [transactions, search, statusFilter]);

  const summary = useMemo(() => {
    let totalInflow = 0;
    let totalOutflow = 0;
    let completed = 0;

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount);

      if (Number.isFinite(amount) && isIncomingTransaction(transaction)) {
        totalInflow += amount;
      }

      if (Number.isFinite(amount) && isOutgoingTransaction(transaction)) {
        totalOutflow += amount;
      }

      if (transaction.status?.toLowerCase() === "completed") {
        completed += 1;
      }
    });

    return {
      totalInflow,
      totalOutflow,
      completed,
      records: transactions.length,
    };
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 animate-pulse rounded-2xl bg-white dark:bg-[#0b1526]" />

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-white dark:bg-[#0b1526]"
            />
          ))}
        </div>

        <div className="h-96 animate-pulse rounded-2xl bg-white dark:bg-[#0b1526]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm dark:border-rose-500/20 dark:bg-[#0b1526]">
        <AlertCircle size={34} className="mx-auto text-rose-500" />

        <h2 className="mt-4 text-xl font-black text-slate-950 dark:text-white">
          Unable to load transactions
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {error}
        </p>

        <button
          type="button"
          onClick={() => void loadTransactions()}
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 font-black text-white transition hover:bg-indigo-500"
        >
          <RefreshCw size={17} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Heading */}
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
            Ledger
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl dark:text-white">
            Recent Transactions
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Track money movement across all your NexusCore accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadTransactions()}
          aria-label="Refresh transactions"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-indigo-400"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Total inflow"
          value={formatCurrency(summary.totalInflow)}
          icon={ArrowDownLeft}
          variant="inflow"
        />

        <SummaryCard
          label="Total outflow"
          value={formatCurrency(summary.totalOutflow)}
          icon={ArrowUpRight}
          variant="outflow"
        />

        <SummaryCard
          label="Records"
          value={String(summary.records)}
          subtitle={`${summary.completed} completed`}
          icon={Landmark}
          variant="records"
        />
      </div>

      {/* Search and filters */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between dark:border-white/10 dark:bg-[#0b1526]">
        <div className="relative w-full lg:max-w-xl">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search account, type, description or status"
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.035] dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 sm:flex">
          {(["all", "completed", "pending"] as TransactionFilter[]).map(
            (filter) => {
              const isActive = statusFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={[
                    "min-h-11 rounded-xl px-4 text-sm font-bold capitalize transition",
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300 dark:hover:bg-white/[0.07]",
                  ].join(" ")}
                >
                  {filter}
                </button>
              );
            },
          )}
        </div>
      </section>

      {/* Desktop table */}
      <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block dark:border-white/10 dark:bg-[#0b1526]">
        <div className="nexus-scrollbar overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 dark:bg-white/[0.025]">
              <tr>
                <TableHeading>Date</TableHeading>

                <TableHeading>Account</TableHeading>

                <TableHeading>Type</TableHeading>

                <TableHeading>Description</TableHeading>

                <TableHeading align="right">Amount</TableHeading>

                <TableHeading align="right">Status</TableHeading>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No transactions match your current filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction, index) => (
                  <tr
                    key={getTransactionKey(transaction, index)}
                    className="transition hover:bg-slate-50 dark:hover:bg-white/[0.025]"
                  >
                    <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {formatDate(transaction.transactionDate)}
                    </td>

                    <td className="px-6 py-5 font-mono text-sm text-slate-500 dark:text-slate-400">
                      {transaction.accountId
                        ? `#${transaction.accountId}`
                        : "—"}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={[
                          "inline-flex rounded-lg border px-3 py-1.5 text-xs font-black",
                          getTypeClasses(transaction.transactionType),
                        ].join(" ")}
                      >
                        {formatTransactionType(transaction.transactionType)}
                      </span>
                    </td>

                    <td className="max-w-xs px-6 py-5 text-sm text-slate-700 dark:text-slate-300">
                      <p className="truncate">
                        {getTransactionDescription(transaction)}
                      </p>
                    </td>

                    <td
                      className={[
                        "whitespace-nowrap px-6 py-5 text-right text-sm font-black",
                        getAmountClasses(transaction),
                      ].join(" ")}
                    >
                      {getSignedAmount(transaction)}
                    </td>

                    <td className="px-6 py-5 text-right">
                      <span
                        className={[
                          "inline-flex rounded-lg border px-3 py-1.5 text-xs font-black capitalize",
                          getStatusClasses(transaction.status),
                        ].join(" ")}
                      >
                        {transaction.status ?? "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile cards */}
      <section className="space-y-3 lg:hidden">
        {filteredTransactions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-[#0b1526] dark:text-slate-400">
            No transactions match your current filters.
          </div>
        ) : (
          filteredTransactions.map((transaction, index) => (
            <article
              key={getTransactionKey(transaction, index)}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1526]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span
                    className={[
                      "inline-flex rounded-lg border px-2.5 py-1 text-xs font-black",
                      getTypeClasses(transaction.transactionType),
                    ].join(" ")}
                  >
                    {formatTransactionType(transaction.transactionType)}
                  </span>

                  <h3 className="mt-3 truncate font-black text-slate-950 dark:text-white">
                    {getTransactionDescription(transaction)}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(transaction.transactionDate)}
                  </p>
                </div>

                <span
                  className={[
                    "shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-black capitalize",
                    getStatusClasses(transaction.status),
                  ].join(" ")}
                >
                  {transaction.status ?? "Unknown"}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 dark:border-white/10">
                <MobileDetail
                  label="Account"
                  value={
                    transaction.accountId ? `#${transaction.accountId}` : "—"
                  }
                />

                <MobileDetail
                  label="Amount"
                  value={getSignedAmount(transaction)}
                  valueClassName={getAmountClasses(transaction)}
                />
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  subtitle,
  icon: Icon,
  variant,
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon: typeof Landmark;
  variant: "inflow" | "outflow" | "records";
}) {
  const variantStyles = {
    inflow: {
      icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      value: "text-emerald-600 dark:text-emerald-400",
    },
    outflow: {
      icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      value: "text-rose-600 dark:text-rose-400",
    },
    records: {
      icon: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      value: "text-slate-950 dark:text-white",
    },
  };

  const styles = variantStyles[variant];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1526]">
      <div className="flex items-center gap-4">
        <span
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            styles.icon,
          ].join(" ")}
        >
          <Icon size={21} />
        </span>

        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>

          <p
            className={["mt-1 truncate text-xl font-black", styles.value].join(
              " ",
            )}
          >
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </article>
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

function MobileDetail({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p
        className={[
          "mt-1 text-sm font-bold text-slate-700 dark:text-slate-300",
          valueClassName,
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
