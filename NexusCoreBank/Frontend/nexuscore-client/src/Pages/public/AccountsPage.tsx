import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Clock3,
  HandCoins,
  Percent,
  PiggyBank,
  Repeat2,
  Sparkles,
  Vault,
  WalletCards,
} from "lucide-react";

const accounts = [
  {
    type: "savings",
    name: "Savings Account",
    subtitle: "For everyday saving",
    description:
      "Save money, receive funds and manage regular expenses securely.",
    icon: PiggyBank,
    features: [
      "Interest-bearing balance",
      "Deposits and withdrawals",
      "Transaction history",
    ],
    action: "Open Savings",
    popular: false,
  },
  {
    type: "current",
    name: "Current Account",
    subtitle: "For business banking",
    description:
      "Built for professionals and businesses with frequent transactions.",
    icon: BriefcaseBusiness,
    features: [
      "Frequent transactions",
      "Business payments",
      "Digital account access",
    ],
    action: "Open Current",
    popular: true,
  },
  {
    type: "fixed-deposit",
    name: "Fixed Deposit",
    subtitle: "For long-term growth",
    description:
      "Invest a fixed amount for a selected period and earn returns.",
    icon: Vault,
    features: [
      "Fixed deposit period",
      "Predictable maturity",
      "Online status tracking",
    ],
    action: "Start Fixed Deposit",
    popular: false,
  },
  {
    type: "recurring-deposit",
    name: "Recurring Deposit",
    subtitle: "For monthly saving",
    description: "Build savings by depositing a fixed amount every month.",
    icon: Repeat2,
    features: ["Monthly deposits", "Goal-based saving", "Maturity tracking"],
    action: "Start Recurring Deposit",
    popular: false,
  },
  {
    type: "loan",
    name: "Nexus Loan",
    subtitle: "For financial support",
    description:
      "Apply for a loan with clear repayment and application tracking.",
    icon: HandCoins,
    features: [
      "Digital application",
      "Repayment schedule",
      "Application tracking",
    ],
    action: "Apply for Loan",
    popular: false,
  },
  {
    type: "daily-deposit",
    name: "Daily Deposit",
    subtitle: "For regular small savings",
    description: "Deposit smaller amounts regularly toward short-term goals.",
    icon: CalendarDays,
    features: [
      "Flexible daily deposits",
      "Simple progress tracking",
      "Goal-focused saving",
    ],
    action: "Start Daily Deposit",
    popular: false,
  },
];

export default function AccountsPage() {
  useEffect(() => {
    document.title = "Accounts | NexusCore Bank";
  }, []);

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50 py-16 dark:border-white/10 dark:bg-[#050b14] sm:py-20">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
              <Sparkles size={16} />
              NexusCore Accounts
            </span>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl dark:text-white">
              Choose the right account
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              Compare NexusCore banking products and select the one that suits
              your financial needs.
            </p>
          </div>
        </div>
      </section>

      {/* Accounts */}
      <section className="bg-slate-50 py-16 dark:bg-[#050b14] sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {accounts.map((account) => {
              const Icon = account.icon;

              return (
                <article
                  key={account.type}
                  className={[
                    "relative flex min-h-[400px] flex-col overflow-hidden rounded-[1.75rem] border p-7 transition duration-300 hover:-translate-y-2",
                    account.popular
                      ? "border-sky-500 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white shadow-2xl shadow-sky-500/15"
                      : "border-slate-200 bg-white shadow-sm hover:border-sky-300 hover:shadow-xl dark:border-white/10 dark:bg-[#0b1526] dark:hover:border-sky-400/30",
                  ].join(" ")}
                >
                  {account.popular && (
                    <span className="absolute right-5 top-5 rounded-full bg-sky-500 px-3 py-1 text-xs font-black text-white">
                      POPULAR
                    </span>
                  )}

                  <span
                    className={[
                      "flex h-14 w-14 items-center justify-center rounded-2xl",
                      account.popular
                        ? "bg-sky-500 text-white"
                        : "bg-sky-500/10 text-sky-600 dark:text-sky-400",
                    ].join(" ")}
                  >
                    <Icon size={26} />
                  </span>

                  <p
                    className={[
                      "mt-6 text-xs font-black uppercase tracking-[0.16em]",
                      account.popular
                        ? "text-sky-400"
                        : "text-sky-600 dark:text-sky-400",
                    ].join(" ")}
                  >
                    {account.subtitle}
                  </p>

                  <h2
                    className={[
                      "mt-2 text-2xl font-black",
                      account.popular
                        ? "text-white"
                        : "text-slate-950 dark:text-white",
                    ].join(" ")}
                  >
                    {account.name}
                  </h2>

                  <p
                    className={[
                      "mt-4 text-sm leading-7",
                      account.popular
                        ? "text-slate-300"
                        : "text-slate-600 dark:text-slate-400",
                    ].join(" ")}
                  >
                    {account.description}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {account.features.map((feature) => (
                      <li
                        key={feature}
                        className={[
                          "flex items-center gap-3 text-sm font-semibold",
                          account.popular
                            ? "text-slate-200"
                            : "text-slate-700 dark:text-slate-300",
                        ].join(" ")}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                          <Check size={15} />
                        </span>

                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={`/register?account=${account.type}`}
                    className={[
                      "mt-auto flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 pt-0 font-black transition hover:-translate-y-0.5",
                      account.popular
                        ? "bg-sky-500 text-white hover:bg-sky-400"
                        : "bg-slate-950 text-white hover:bg-sky-500 dark:bg-white dark:text-slate-950 dark:hover:bg-sky-400 dark:hover:text-white",
                    ].join(" ")}
                  >
                    {account.action}
                    <ArrowRight size={17} />
                  </Link>
                </article>
              );
            })}
          </div>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Product rates, limits and eligibility rules will be displayed after
            backend integration.
          </p>
        </div>
      </section>
      <section
        id="comparison"
        className="border-y border-slate-200 bg-white py-20 sm:py-24 dark:border-white/10 dark:bg-[#07101d]"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">
              Selecting an account
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Start with your primary financial goal
            </h2>

            <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-400">
              Choose an account based on how frequently you need access to the
              funds and what you want the money to achieve.
            </p>

            <Link
              to="/contact"
              className="mt-8 inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-sky-500 px-6 font-black text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-1 hover:bg-sky-400"
            >
              Get Help Choosing
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Daily use",

                description: "Savings or Current Account",

                icon: WalletCards,
              },

              {
                title: "Fixed investment",

                description: "Fixed Deposit",

                icon: Percent,
              },

              {
                title: "Regular saving",

                description: "Recurring or Daily Deposit",

                icon: Clock3,
              },

              {
                title: "Borrowing needs",

                description: "Nexus Loan",

                icon: Banknote,
              },
            ].map((option) => {
              const Icon = option.icon;

              return (
                <div
                  key={option.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/[0.035]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <Icon size={21} />
                  </span>

                  <h3 className="mt-4 font-black text-slate-950 dark:text-white">
                    {option.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {option.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="bg-slate-50 px-5 py-20 sm:px-6 sm:py-24 lg:px-8 dark:bg-[#050b14]">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 px-6 py-14 text-white shadow-2xl shadow-blue-600/25 sm:px-10 lg:px-16">
          <div className="absolute -right-28 -top-40 h-96 w-96 rounded-full border border-white/15" />

          <div className="relative flex flex-col gap-9 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black backdrop-blur">
                <BadgeCheck size={17} />
                Start securely
              </span>

              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
                Ready to open your NexusCore account?
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-blue-100 sm:text-lg">
                Create your profile and choose the account that matches your
                financial requirements.
              </p>
            </div>

            <Link
              to="/register"
              className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-7 font-black text-blue-700 shadow-xl transition hover:-translate-y-1 hover:bg-blue-50"
            >
              Create Account
              <ArrowRight size={19} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
