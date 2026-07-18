import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  FileClock,
  Lock,
  RefreshCw,
  Users,
  Vault,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  getAdminSystemMetrics,
  type AdminSystemMetrics,
} from "../../services/adminService";

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

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<AdminSystemMetrics | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const loadMetrics = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getAdminSystemMetrics();

      setMetrics(response);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load system metrics.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "System Overview | NexusCore";

    void loadMetrics();
  }, [loadMetrics]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-36 animate-pulse rounded-xl bg-white dark:bg-[#0b1526]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">
            Control center
          </p>

          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            System Overview
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Monitor NexusCore users, liquidity and restricted accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadMetrics()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-violet-400 hover:text-violet-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300 dark:hover:text-violet-400"
        >
          <RefreshCw size={17} />
          Refresh Metrics
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-400/20 dark:bg-red-400/[0.07] dark:text-red-300">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={Users}
          label="Total users"
          value={String(metrics?.totalUsers ?? 0)}
          variant="violet"
        />

        <MetricCard
          icon={Vault}
          label="Total liquidity"
          value={formatCurrency(metrics?.totalLiquidity)}
          variant="emerald"
        />

        <MetricCard
          icon={Lock}
          label="Frozen accounts"
          value={String(metrics?.totalFrozenAccounts ?? 0)}
          variant="red"
        />
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          to="/admin/staff"
          className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-violet-400 dark:border-white/10 dark:bg-[#0b1526]"
        >
          <Users size={22} className="text-violet-600 dark:text-violet-400" />

          <h3 className="mt-5 font-black">Staff Management</h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Register staff identities and manage employee or manager roles.
          </p>

          <p className="mt-5 text-sm font-black text-violet-600 group-hover:translate-x-1 dark:text-violet-400">
            Open Staff Management →
          </p>
        </Link>

        <Link
          to="/admin/audit"
          className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-violet-400 dark:border-white/10 dark:bg-[#0b1526]"
        >
          <FileClock
            size={22}
            className="text-violet-600 dark:text-violet-400"
          />

          <h3 className="mt-5 font-black">Master Audit Logs</h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review protected staff and system operations across NexusCore.
          </p>

          <p className="mt-5 text-sm font-black text-violet-600 group-hover:translate-x-1 dark:text-violet-400">
            View Audit Records →
          </p>
        </Link>
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  variant,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  variant: "violet" | "emerald" | "red";
}) {
  const styles = {
    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0b1526]">
      <span
        className={[
          "flex h-11 w-11 items-center justify-center rounded-lg",
          styles[variant],
        ].join(" ")}
      >
        <Icon size={20} />
      </span>

      <p className="mt-6 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black">{value}</p>
    </article>
  );
}
