import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Briefcase,
  Building2,
  ChartPie,
  CheckCircle2,
  Clock,
  CreditCard,
  Headphones,
  House,
  Landmark,
  LockKeyhole,
  PiggyBank,
  ReceiptIndianRupee,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

export default function ServicesPage() {
  useEffect(() => {
    document.title = "Our Services | NexusCore Bank";
  }, []);

  const services = [
    {
      title: "Personal Banking",
      description:
        "Manage everyday finances through savings and current accounts designed for convenient digital banking.",
      icon: Wallet,
      path: "/accounts#personal-banking",
      badge: "Everyday banking",
      features: [
        "Savings and current accounts",
        "Balance and transaction tracking",
        "Secure digital account access",
      ],
    },
    {
      title: "Business Solutions",
      description:
        "Banking tools designed to help professionals and businesses manage frequent financial activity.",
      icon: Briefcase,
      path: "/accounts#business",
      badge: "For businesses",
      features: [
        "Business current accounts",
        "Transaction management",
        "Controlled staff access",
      ],
    },
    {
      title: "Home Finance",
      description:
        "Explore structured financial options designed around home purchases, property goals and repayments.",
      icon: House,
      path: "/services#home-finance",
      badge: "Home goals",
      features: [
        "Home financing information",
        "Clear repayment overview",
        "Application status tracking",
      ],
    },
    {
      title: "Wealth Management",
      description:
        "Understand your savings and financial activity through clear dashboards and intelligent insights.",
      icon: ChartPie,
      path: "/features#analytics",
      badge: "Financial growth",
      features: [
        "Savings performance overview",
        "Financial activity insights",
        "Goal-focused planning",
      ],
    },
    {
      title: "Cards and Payments",
      description:
        "Access secure card information, payment activity and transaction controls from your account dashboard.",
      icon: CreditCard,
      path: "/services#cards",
      badge: "Payments",
      features: [
        "Card activity overview",
        "Payment history",
        "Secure transaction controls",
      ],
    },
    {
      title: "Financial Protection",
      description:
        "Protect important financial operations through secure authentication and transaction verification.",
      icon: ShieldCheck,
      path: "/legal#security",
      badge: "Security",
      features: [
        "Protected authentication",
        "Transaction verification",
        "Account activity monitoring",
      ],
    },
  ];

  const serviceBenefits = [
    {
      title: "Digital-first banking",
      description:
        "Access banking services through a responsive experience designed for mobile, tablet and desktop.",
      icon: Smartphone,
    },
    {
      title: "Secure account access",
      description:
        "Authentication and role-based permissions help protect customer and staff account areas.",
      icon: LockKeyhole,
    },
    {
      title: "Clear transaction records",
      description:
        "Review deposits, withdrawals and transfers through organised transaction history.",
      icon: ReceiptIndianRupee,
    },
    {
      title: "Customer assistance",
      description:
        "Get clear support information whenever you need help understanding a service or account feature.",
      icon: Headphones,
    },
  ];

  const accountOptions = [
    {
      title: "Savings Account",
      description:
        "Designed for customers who want to save money while keeping funds available for everyday needs.",
      icon: PiggyBank,
      path: "/accounts#savings",
    },
    {
      title: "Current Account",
      description:
        "Suitable for professionals and businesses that handle frequent deposits, withdrawals and transfers.",
      icon: Building2,
      path: "/accounts#current",
    },
    {
      title: "Fixed Deposit",
      description:
        "A structured deposit option for customers focused on growing savings over a selected period.",
      icon: Landmark,
      path: "/accounts#fixed-deposit",
    },
  ];

  return (
    <>
      {/* Page Hero */}
      <section className="relative isolate overflow-hidden bg-slate-50 dark:bg-[#050b14]">
        <div className="absolute -left-36 top-10 -z-10 h-96 w-96 rounded-full bg-sky-400/20 blur-[120px] dark:bg-sky-500/10" />

        <div className="absolute -right-32 top-0 -z-10 h-[450px] w-[450px] rounded-full bg-blue-500/20 blur-[140px] dark:bg-blue-600/10" />

        <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:52px_52px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)]" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-black text-sky-700 shadow-sm backdrop-blur dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
              <Sparkles size={16} />
              Complete financial services
            </span>

            <h1 className="mt-7 text-5xl font-black leading-[1.05] tracking-[-0.05em] text-slate-950 sm:text-6xl dark:text-white">
              Financial services designed around{" "}
              <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                real banking needs.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-400">
              From everyday accounts and business banking to payments, financial
              insights and secure account management, NexusCore brings essential
              services together in one digital platform.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-sky-500 px-7 font-black text-white shadow-xl shadow-sky-500/20 transition duration-300 hover:-translate-y-1 hover:bg-sky-400"
              >
                Open an Account
                <ArrowRight size={19} />
              </Link>

              <Link
                to="/accounts"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white/70 px-7 font-black text-slate-900 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-slate-950 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-white/40"
              >
                Compare Accounts
              </Link>
            </div>
          </div>

          {/* Service Summary Panel */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-7 rounded-full bg-gradient-to-r from-sky-500/20 to-blue-600/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-[#0b1526]/90 dark:shadow-black/40">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400">
                    NexusCore services
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                    One connected platform
                  </h2>
                </div>

                <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Banknote size={26} />
                </span>
              </div>

              <div className="mt-7 space-y-3">
                {[
                  {
                    label: "Account management",
                    icon: Wallet,
                  },
                  {
                    label: "Digital transactions",
                    icon: ReceiptIndianRupee,
                  },
                  {
                    label: "Financial insights",
                    icon: ChartPie,
                  },
                  {
                    label: "Secure customer access",
                    icon: ShieldCheck,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                          <Icon size={19} />
                        </span>

                        <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                          {item.label}
                        </span>
                      </div>

                      <CheckCircle2 size={19} className="text-emerald-500" />
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-emerald-500/10 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                  <BadgeCheck size={20} />
                </span>

                <div>
                  <p className="text-sm font-black text-slate-950 dark:text-white">
                    Secure digital banking
                  </p>

                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    Designed with account protection in mind.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Trust Strip */}
      <section className="border-y border-slate-200 bg-white dark:border-white/10 dark:bg-[#07101d]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 px-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            {
              value: "24/7",
              label: "Digital account access",
              icon: Clock,
            },
            {
              value: "Secure",
              label: "Protected transactions",
              icon: ShieldCheck,
            },
            {
              value: "Responsive",
              label: "Available on every device",
              icon: Smartphone,
            },
            {
              value: "Simple",
              label: "Clear banking experience",
              icon: Users,
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={[
                  "flex items-center gap-4 py-7 sm:px-5",
                  index > 0
                    ? "border-t border-slate-200 sm:border-t-0 dark:border-white/10"
                    : "",
                  index % 2 !== 0
                    ? "sm:border-l sm:border-slate-200 sm:dark:border-white/10"
                    : "",
                  index === 2
                    ? "lg:border-l lg:border-slate-200 lg:dark:border-white/10"
                    : "",
                ].join(" ")}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Icon size={22} />
                </span>

                <div>
                  <p className="text-lg font-black text-slate-950 dark:text-white">
                    {item.value}
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {item.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="bg-slate-50 py-20 sm:py-24 dark:bg-[#050b14]">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">
              Banking services
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Solutions for every stage of your financial journey
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-400">
              Choose services that support everyday banking, professional
              activity, long-term goals and secure financial management.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  key={service.title}
                  className="group relative flex min-h-[430px] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-sky-300 hover:shadow-2xl hover:shadow-sky-500/10 dark:border-white/10 dark:bg-[#0b1526] dark:hover:border-sky-400/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/[0.07] via-transparent to-blue-600/[0.07] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 transition duration-300 group-hover:rotate-3 group-hover:scale-105">
                        <Icon size={29} />
                      </span>

                      <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-black text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
                        {service.badge}
                      </span>
                    </div>

                    <h3 className="mt-7 text-2xl font-black text-slate-950 transition group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400">
                      {service.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                      {service.description}
                    </p>

                    <ul className="mt-5 space-y-3">
                      {service.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300"
                        >
                          <CheckCircle2
                            size={18}
                            className="mt-0.5 shrink-0 text-emerald-500"
                          />

                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to={service.path}
                      className="mt-auto flex items-center justify-between border-t border-slate-200 pt-5 text-sm font-black text-sky-600 transition group-hover:gap-3 dark:border-white/10 dark:text-sky-400"
                    >
                      Learn more
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Account Options */}
      <section className="border-y border-slate-200 bg-white py-20 sm:py-24 dark:border-white/10 dark:bg-[#07101d]">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">
                Account options
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                Find an account that matches your goals
              </h2>

              <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-400">
                NexusCore provides account options for everyday saving, frequent
                transactions and long-term deposits.
              </p>
            </div>

            <Link
              to="/accounts"
              className="inline-flex items-center gap-2 font-black text-sky-600 transition hover:gap-3 dark:text-sky-400"
            >
              Compare all accounts
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {accountOptions.map((account) => {
              const Icon = account.icon;

              return (
                <Link
                  key={account.title}
                  to={account.path}
                  className="group rounded-[1.7rem] border border-slate-200 bg-slate-50 p-7 transition duration-300 hover:-translate-y-2 hover:border-sky-300 hover:bg-white hover:shadow-xl dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-sky-400/30 dark:hover:bg-white/[0.055]"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 transition duration-300 group-hover:bg-sky-500 group-hover:text-white dark:text-sky-400">
                    <Icon size={25} />
                  </span>

                  <h3 className="mt-6 text-xl font-black text-slate-950 dark:text-white">
                    {account.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    {account.description}
                  </p>

                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-sky-600 transition group-hover:gap-3 dark:text-sky-400">
                    View account
                    <ArrowRight size={17} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why NexusCore */}
      <section className="bg-slate-50 py-20 sm:py-24 dark:bg-[#050b14]">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-7 text-white shadow-2xl shadow-slate-950/20 sm:p-9">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />

            <div className="relative">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-400">
                <ShieldCheck size={28} />
              </span>

              <h3 className="mt-7 text-3xl font-black tracking-tight">
                Designed for secure digital banking
              </h3>

              <p className="mt-4 leading-7 text-slate-300">
                NexusCore combines essential banking operations with clear
                interfaces, secure account access and responsive experiences.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Protected customer and staff areas",
                  "Clear financial transaction records",
                  "Responsive account management",
                  "Structured banking workflows",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                      <CheckCircle2 size={18} />
                    </span>

                    <p className="text-sm font-bold text-slate-200">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">
              Why NexusCore
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Banking services should feel clear, secure and accessible
            </h2>

            <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-400">
              Every NexusCore service is designed to make important financial
              actions easier to understand while maintaining strong control over
              account access and transactions.
            </p>

            <div className="mt-9 grid gap-5 sm:grid-cols-2">
              {serviceBenefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0b1526]"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                      <Icon size={21} />
                    </span>

                    <h3 className="mt-4 font-black text-slate-950 dark:text-white">
                      {benefit.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-50 px-5 pb-20 sm:px-6 sm:pb-24 lg:px-8 dark:bg-[#050b14]">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 px-6 py-14 text-white shadow-2xl shadow-blue-600/25 sm:px-10 lg:px-16 lg:py-16">
          <div className="absolute -right-28 -top-40 h-96 w-96 rounded-full border border-white/15" />
          <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full border border-white/15" />
          <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black backdrop-blur">
                <BadgeCheck size={17} />
                Start your NexusCore journey
              </span>

              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
                Ready to experience smarter digital banking?
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-blue-100 sm:text-lg">
                Create your account and access services designed for secure,
                convenient and understandable financial management.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-white px-7 font-black text-blue-700 shadow-xl transition hover:-translate-y-1 hover:bg-blue-50"
              >
                Open an Account
                <ArrowRight size={19} />
              </Link>

              <Link
                to="/contact"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-7 font-black text-white backdrop-blur transition hover:-translate-y-1 hover:bg-white/20"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
