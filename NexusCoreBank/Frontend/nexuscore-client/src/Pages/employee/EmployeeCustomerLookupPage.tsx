import { useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  Landmark,
  LoaderCircle,
  Mail,
  Search,
  UserRound,
  WalletCards,
} from "lucide-react";

import {
  searchCustomerAccount,
  type CustomerAccountLookup,
} from "../../services/employeeService";

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

function getStatusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/[0.08] dark:text-emerald-300";

    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/[0.08] dark:text-amber-300";

    case "frozen":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/[0.08] dark:text-blue-300";

    case "closed":
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-400/[0.08] dark:text-red-300";

    default:
      return "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300";
  }
}

export default function EmployeeCustomerLookupPage() {
  const [accountNumber, setAccountNumber] = useState("");

  const [result, setResult] = useState<CustomerAccountLookup | null>(null);

  const [isSearching, setIsSearching] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Customer Lookup | NexusCore Staff";
  }, []);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedAccount = accountNumber.trim();

    setError("");
    setResult(null);

    if (!normalizedAccount) {
      setError("Enter a valid account number.");
      return;
    }

    setIsSearching(true);

    try {
      const response = await searchCustomerAccount(normalizedAccount);

      setResult(response);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Account not found.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
          Customer records
        </p>

        <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl dark:text-white">
          Customer Lookup
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Search and verify a customer account using its account number.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#0b1526]">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              inputMode="numeric"
              value={accountNumber}
              disabled={isSearching}
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
            disabled={isSearching || !accountNumber.trim()}
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 text-sm font-black text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSearching ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search size={17} />
                Find Account
              </>
            )}
          </button>
        </form>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-400/20 dark:bg-red-400/[0.07] dark:text-red-300">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {result && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1526]">
          <div className="flex flex-col gap-5 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <UserRound size={21} />
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-lg font-black text-slate-950 dark:text-white">
                  {result.fullName}
                </h3>

                <p className="mt-1 flex items-center gap-2 truncate text-sm text-slate-500 dark:text-slate-400">
                  <Mail size={14} />
                  {result.email}
                </p>
              </div>
            </div>

            <span
              className={[
                "w-fit rounded-md border px-3 py-1.5 text-xs font-black uppercase",
                getStatusClasses(result.status),
              ].join(" ")}
            >
              {result.status}
            </span>
          </div>

          <div className="grid gap-px bg-slate-200 sm:grid-cols-3 dark:bg-white/10">
            <LookupDetail
              icon={Landmark}
              label="Account number"
              value={String(result.accountNumber)}
            />

            <LookupDetail
              icon={WalletCards}
              label="Account type"
              value={result.accountType}
            />

            <LookupDetail
              icon={Landmark}
              label="Available balance"
              value={formatCurrency(result.balance)}
              highlight
            />
          </div>
        </section>
      )}

      {!result && !error && (
        <div className="rounded-xl border border-dashed border-slate-300 px-6 py-20 text-center dark:border-white/10">
          <Landmark
            size={34}
            className="mx-auto text-slate-300 dark:text-slate-600"
          />

          <h3 className="mt-4 font-black text-slate-700 dark:text-slate-300">
            Search for an account
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Customer details will appear here.
          </p>
        </div>
      )}
    </div>
  );
}

function LookupDetail({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: typeof Landmark;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white p-6 dark:bg-[#0b1526]">
      <Icon size={18} className="text-indigo-600 dark:text-indigo-400" />

      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
        {label}
      </p>

      <p
        className={[
          "mt-2 break-all font-black",
          highlight
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-slate-950 dark:text-white",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
