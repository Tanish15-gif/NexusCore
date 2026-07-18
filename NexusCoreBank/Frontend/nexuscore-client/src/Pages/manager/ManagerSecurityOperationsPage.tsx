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
  CheckCircle2,
  FileClock,
  LoaderCircle,
  Lock,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  UserRound,
  X,
} from "lucide-react";

import {
  freezeManagerAccount,
  getManagerAuditLogs,
  unfreezeManagerAccount,
  type ManagerAuditLog,
} from "../../services/managerService";

type AccountOperation = "freeze" | "unfreeze";

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
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getActionClasses(actionType: string): string {
  const action = actionType.toLowerCase();

  if (
    action.includes("approve") ||
    action.includes("unfreeze") ||
    action.includes("restore")
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/[0.08] dark:text-emerald-300";
  }

  if (action.includes("reject") || action.includes("freeze")) {
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-400/[0.08] dark:text-red-300";
  }

  if (action.includes("email")) {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/[0.08] dark:text-blue-300";
  }

  return "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/[0.08] dark:text-indigo-300";
}

export default function ManagerSecurityOperationsPage() {
  const [logs, setLogs] = useState<ManagerAuditLog[]>([]);

  const [accountNumber, setAccountNumber] = useState("");

  const [operation, setOperation] = useState<AccountOperation>("freeze");

  const [pendingOperation, setPendingOperation] =
    useState<AccountOperation | null>(null);

  const [search, setSearch] = useState("");

  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAuditLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    setError("");

    try {
      const response = await getManagerAuditLogs();

      const sortedLogs = [...(Array.isArray(response) ? response : [])].sort(
        (first, second) => {
          return (
            new Date(second.actionDate).getTime() -
            new Date(first.actionDate).getTime()
          );
        },
      );

      setLogs(sortedLogs);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load audit logs.",
      );
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Security Operations | NexusCore Executive";

    void loadAuditLogs();
  }, [loadAuditLogs]);

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

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return logs;
    }

    return logs.filter((log) =>
      [
        log.logId,
        log.employeeName,
        log.actionType,
        log.actionDetails,
        log.actionDate,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [logs, search]);

  const auditSummary = useMemo(() => {
    let approvals = 0;
    let rejections = 0;
    let securityActions = 0;

    logs.forEach((log) => {
      const action = log.actionType.toLowerCase();

      if (action.includes("approve")) {
        approvals += 1;
      }

      if (action.includes("reject")) {
        rejections += 1;
      }

      if (
        action.includes("freeze") ||
        action.includes("email") ||
        action.includes("restore")
      ) {
        securityActions += 1;
      }
    });

    return {
      total: logs.length,
      approvals,
      rejections,
      securityActions,
    };
  }, [logs]);

  const handleOperationRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedAccount = accountNumber.trim();

    setError("");

    if (!normalizedAccount) {
      setError("Enter an account number.");
      return;
    }

    if (!/^\d+$/.test(normalizedAccount)) {
      setError("Account number must contain digits only.");
      return;
    }

    setPendingOperation(operation);
  };

  const confirmOperation = async () => {
    if (!pendingOperation) {
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const response =
        pendingOperation === "freeze"
          ? await freezeManagerAccount(accountNumber)
          : await unfreezeManagerAccount(accountNumber);

      setNotice(response.message);
      setAccountNumber("");
      setPendingOperation(null);

      await loadAuditLogs();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to execute the security operation.",
      );

      setPendingOperation(null);
    } finally {
      setIsProcessing(false);
    }
  };

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
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
            Protected operations
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl dark:text-white">
            Security & Operations
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Execute authorized account controls and review branch audit
            activity.
          </p>
        </div>

        {/* Security console */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1526]">
          <div className="border-b border-slate-200 p-5 sm:p-6 dark:border-white/10">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-300">
                <ShieldAlert size={21} />
              </span>

              <div>
                <h3 className="font-black text-slate-950 dark:text-white">
                  Account security console
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Freeze compromised accounts or restore verified customer
                  access.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleOperationRequest} className="p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setOperation("freeze")}
                className={[
                  "flex min-h-12 items-center justify-center gap-2 rounded-lg border text-sm font-black transition",
                  operation === "freeze"
                    ? "border-red-500 bg-red-600 text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5",
                ].join(" ")}
              >
                <Lock size={17} />
                Freeze Account
              </button>

              <button
                type="button"
                onClick={() => setOperation("unfreeze")}
                className={[
                  "flex min-h-12 items-center justify-center gap-2 rounded-lg border text-sm font-black transition",
                  operation === "unfreeze"
                    ? "border-emerald-500 bg-emerald-600 text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5",
                ].join(" ")}
              >
                <Unlock size={17} />
                Restore Account
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                {operation === "freeze" ? (
                  <Lock
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                ) : (
                  <Unlock
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                )}

                <input
                  type="text"
                  inputMode="numeric"
                  value={accountNumber}
                  disabled={isProcessing}
                  onChange={(event) => {
                    setAccountNumber(event.target.value.replace(/\D/g, ""));

                    setError("");
                  }}
                  placeholder="Enter account number"
                  className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-4 font-mono text-sm tracking-wider outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.035] dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing || !accountNumber.trim()}
                className={[
                  "flex h-12 items-center justify-center gap-2 rounded-lg px-6 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-50",
                  operation === "freeze"
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-emerald-600 hover:bg-emerald-500",
                ].join(" ")}
              >
                {operation === "freeze" ? (
                  <>
                    <Lock size={17} />
                    Continue to Freeze
                  </>
                ) : (
                  <>
                    <Unlock size={17} />
                    Continue to Restore
                  </>
                )}
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-400/20 dark:bg-red-400/[0.07] dark:text-red-300"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />

                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}
          </form>
        </section>

        {/* Audit summary */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AuditSummaryCard
            icon={FileClock}
            label="Audit records"
            value={auditSummary.total}
            variant="indigo"
          />

          <AuditSummaryCard
            icon={CheckCircle2}
            label="Approvals"
            value={auditSummary.approvals}
            variant="green"
          />

          <AuditSummaryCard
            icon={X}
            label="Rejections"
            value={auditSummary.rejections}
            variant="red"
          />

          <AuditSummaryCard
            icon={ShieldCheck}
            label="Security actions"
            value={auditSummary.securityActions}
            variant="blue"
          />
        </div>

        {/* Audit logs */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1526]">
          <header className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:border-white/10">
            <div>
              <h3 className="font-black text-slate-950 dark:text-white">
                System Audit Logs
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Employee and manager operations recorded by NexusCore.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadAuditLogs()}
              disabled={isLoadingLogs}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-xs font-black text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:text-indigo-400"
            >
              <RefreshCw
                size={15}
                className={isLoadingLogs ? "animate-spin" : ""}
              />
              Refresh Logs
            </button>
          </header>

          <div className="border-b border-slate-200 p-4 dark:border-white/10">
            <div className="relative max-w-xl">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employee, action or details"
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.035] dark:text-white"
              />
            </div>
          </div>

          {isLoadingLogs ? (
            <div className="px-6 py-16 text-center text-slate-500">
              <LoaderCircle
                size={24}
                className="mx-auto animate-spin text-indigo-500"
              />

              <p className="mt-3 text-sm">Loading audit records...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <FileClock
                size={34}
                className="mx-auto text-slate-300 dark:text-slate-600"
              />

              <h4 className="mt-4 font-black text-slate-950 dark:text-white">
                No audit records found
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                No logs match the current search.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="nexus-scrollbar hidden overflow-x-auto lg:block">
                <table className="min-w-full">
                  <thead className="bg-slate-50 dark:bg-white/[0.025]">
                    <tr>
                      <TableHeading>Log ID</TableHeading>

                      <TableHeading>Date & Time</TableHeading>

                      <TableHeading>Employee</TableHeading>

                      <TableHeading>Action</TableHeading>

                      <TableHeading>Details</TableHeading>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                    {filteredLogs.map((log, index) => (
                      <tr
                        key={[log.logId, log.actionDate, index].join("-")}
                        className="transition hover:bg-slate-50 dark:hover:bg-white/[0.025]"
                      >
                        <td className="px-6 py-5 font-mono text-sm text-slate-500">
                          #{log.logId}
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                          {formatDate(log.actionDate)}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                              <UserRound size={15} />
                            </span>

                            <span className="font-bold text-slate-950 dark:text-white">
                              {log.employeeName}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={[
                              "inline-flex rounded-md border px-2.5 py-1 text-[11px] font-black uppercase",
                              getActionClasses(log.actionType),
                            ].join(" ")}
                          >
                            {log.actionType}
                          </span>
                        </td>

                        <td className="max-w-md px-6 py-5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                          {log.actionDetails}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="space-y-3 p-4 lg:hidden">
                {filteredLogs.map((log, index) => (
                  <article
                    key={[log.logId, log.actionDate, index].join("-")}
                    className="rounded-lg border border-slate-200 p-4 dark:border-white/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-black text-slate-950 dark:text-white">
                          {log.employeeName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(log.actionDate)}
                        </p>
                      </div>

                      <span
                        className={[
                          "rounded-md border px-2 py-1 text-[10px] font-black uppercase",
                          getActionClasses(log.actionType),
                        ].join(" ")}
                      >
                        {log.actionType}
                      </span>
                    </div>

                    <p className="mt-4 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:text-slate-300">
                      {log.actionDetails}
                    </p>

                    <p className="mt-3 font-mono text-xs text-slate-400">
                      Log #{log.logId}
                    </p>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Confirmation */}
      {pendingOperation && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0b1526]">
            <span
              className={[
                "flex h-11 w-11 items-center justify-center rounded-lg",
                pendingOperation === "freeze"
                  ? "bg-red-100 text-red-600 dark:bg-red-400/10 dark:text-red-300"
                  : "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300",
              ].join(" ")}
            >
              {pendingOperation === "freeze" ? (
                <Lock size={20} />
              ) : (
                <Unlock size={20} />
              )}
            </span>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">
              Executive confirmation
            </p>

            <h3 className="mt-2 text-xl font-black text-slate-950 dark:text-white">
              {pendingOperation === "freeze"
                ? "Freeze this account?"
                : "Restore this account?"}
            </h3>

            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Account <strong>{accountNumber}</strong> will be{" "}
              {pendingOperation === "freeze"
                ? "immediately blocked from protected transactions."
                : "returned to active status."}
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPendingOperation(null)}
                disabled={isProcessing}
                className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-black text-slate-700 dark:border-white/10 dark:text-slate-300"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void confirmOperation()}
                disabled={isProcessing}
                className={[
                  "flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-black text-white disabled:opacity-60",
                  pendingOperation === "freeze"
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-emerald-600 hover:bg-emerald-500",
                ].join(" ")}
              >
                {isProcessing ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Processing...
                  </>
                ) : pendingOperation === "freeze" ? (
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

function AuditSummaryCard({
  icon: Icon,
  label,
  value,
  variant,
}: {
  icon: typeof FileClock;
  label: string;
  value: number;
  variant: "indigo" | "green" | "red" | "blue";
}) {
  const styles = {
    indigo:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
    green:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1526]">
      <div className="flex items-center gap-4">
        <span
          className={[
            "flex h-11 w-11 items-center justify-center rounded-lg",
            styles[variant],
          ].join(" ")}
        >
          <Icon size={20} />
        </span>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </article>
  );
}

function TableHeading({ children }: { children: ReactNode }) {
  return (
    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-400">
      {children}
    </th>
  );
}
