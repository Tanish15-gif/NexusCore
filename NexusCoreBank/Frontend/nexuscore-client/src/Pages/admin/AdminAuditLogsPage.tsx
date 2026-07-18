import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  FileClock,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  getAdminAuditLogs,
  type AdminAuditLog,
} from "../../services/adminService";

function formatDate(value: string): string {
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

  if (action.includes("promote") || action.includes("role")) {
    return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/[0.08] dark:text-violet-300";
  }

  if (action.includes("reject") || action.includes("freeze")) {
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-400/[0.08] dark:text-red-300";
  }

  if (
    action.includes("approve") ||
    action.includes("create") ||
    action.includes("register")
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/[0.08] dark:text-emerald-300";
  }

  return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/[0.08] dark:text-blue-300";
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);

  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getAdminAuditLogs();

      setLogs(
        [...response].sort(
          (first, second) =>
            new Date(second.actionDate).getTime() -
            new Date(first.actionDate).getTime(),
        ),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load audit logs.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Master Audit Logs | NexusCore";

    void loadLogs();
  }, [loadLogs]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">
            System accountability
          </p>

          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Master Audit Logs
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Review protected staff and system operations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadLogs()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-violet-400 hover:text-violet-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300"
        >
          <RefreshCw size={17} />
          Refresh Logs
        </button>
      </div>

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
            placeholder="Search employee, action or details"
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-white/[0.035] dark:text-white"
          />
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-400/20 dark:bg-red-400/[0.07] dark:text-red-300">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1526]">
        {isLoading ? (
          <div className="px-6 py-20 text-center">
            <LoaderCircle
              size={25}
              className="mx-auto animate-spin text-violet-500"
            />

            <p className="mt-4 text-sm text-slate-500">
              Loading secure logs...
            </p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <FileClock
              size={36}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <h3 className="mt-5 text-xl font-black">No audit records found</h3>
          </div>
        ) : (
          <>
            <div className="nexus-scrollbar hidden overflow-x-auto lg:block">
              <table className="min-w-full">
                <thead className="bg-slate-50 dark:bg-white/[0.025]">
                  <tr>
                    <TableHeading>Log ID</TableHeading>
                    <TableHeading>Administrator</TableHeading>
                    <TableHeading>Action</TableHeading>
                    <TableHeading>Details</TableHeading>
                    <TableHeading>Timestamp</TableHeading>
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

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <UserRound size={17} className="text-violet-500" />

                          <span className="font-black">{log.employeeName}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <ActionBadge action={log.actionType} />
                      </td>

                      <td className="max-w-md px-6 py-5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {log.actionDetails}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-500">
                        {formatDate(log.actionDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 lg:hidden">
              {filteredLogs.map((log, index) => (
                <article
                  key={[log.logId, log.actionDate, index].join("-")}
                  className="rounded-lg border border-slate-200 p-4 dark:border-white/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-black">{log.employeeName}</p>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(log.actionDate)}
                      </p>
                    </div>

                    <ActionBadge action={log.actionType} />
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

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <ShieldCheck size={14} className="text-emerald-500" />
        Audit records are read-only.
      </div>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  return (
    <span
      className={[
        "inline-flex rounded-md border px-2.5 py-1 text-[10px] font-black uppercase",
        getActionClasses(action),
      ].join(" ")}
    >
      {action}
    </span>
  );
}

function TableHeading({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-black uppercase tracking-[0.14em] text-slate-400">
      {children}
    </th>
  );
}
