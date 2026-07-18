import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Headphones,
  Landmark,
  LockKeyhole,
  PiggyBank,
  ReceiptIndianRupee,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
  Wifi,
  Zap,
} from "lucide-react";

export default function HomePage() {
  useEffect(() => {
    document.title = "NexusCore Bank | Secure Digital Banking for the Future";
  }, []);

  const accountTypes = [
    {
      title: "Savings Account",
      description:
        "A secure everyday account designed to help you save, manage money and track transactions.",
      icon: PiggyBank,
      path: "/accounts#savings",
      badge: "Popular",
    },
    {
      title: "Current Account",
      description:
        "Flexible banking for professionals and businesses with frequent transaction requirements.",
      icon: Building2,
      path: "/accounts#current",
      badge: "Business",
    },
    {
      title: "Fixed Deposit",
      description:
        "Lock your savings for a selected term and build your wealth with predictable returns.",
      icon: Landmark,
      path: "/accounts#fixed-deposit",
      badge: "Growth",
    },
  ];

  const bankingServices = [
    {
      title: "Instant Transfers",
      description:
        "Transfer funds between eligible accounts through a clear and secure transaction process.",
      icon: Zap,
    },
    {
      title: "Smart Transactions",
      description:
        "Review deposits, withdrawals and transfers with searchable transaction history.",
      icon: ReceiptIndianRupee,
    },
    {
      title: "Financial Overview",
      description:
        "Understand balances, activity and account performance through a unified dashboard.",
      icon: BarChart3,
    },
    {
      title: "Secure Account Access",
      description:
        "Protect sensitive banking actions with authentication, verification and role-based access.",
      icon: LockKeyhole,
    },
  ];

  const trustPoints = [
    {
      title: "Secure by design",
      description: "Protected account access",
      icon: ShieldCheck,
    },
    {
      title: "Always accessible",
      description: "Manage banking online",
      icon: Clock3,
    },
    {
      title: "Customer focused",
      description: "Clear and simple experience",
      icon: Headphones,
    },
    {
      title: "Digital first",
      description: "Responsive on every device",
      icon: Smartphone,
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-slate-50 dark:bg-[#050b14]">
        <div className="absolute -left-40 top-20 -z-10 h-[420px] w-[420px] rounded-full bg-sky-400/20 blur-[120px] dark:bg-sky-500/10" />

        <div className="absolute -right-40 top-0 -z-10 h-[520px] w-[520px] rounded-full bg-blue-500/20 blur-[140px] dark:bg-blue-600/10" />

        <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:52px_52px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)]" />

        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-16 px-5 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-bold text-sky-700 shadow-sm backdrop-blur dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
              <Sparkles size={16} />
              Next-generation digital banking
            </div>

            <h1 className="mt-7 text-5xl font-black leading-[1.05] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[4.5rem] dark:text-white">
              Banking built around{" "}
              <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                your financial life.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-400">
              Open accounts, manage balances, transfer funds and understand your
              transactions through one secure and intelligent banking
              experience.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-sky-500 px-7 text-base font-black text-white shadow-xl shadow-sky-500/20 transition duration-300 hover:-translate-y-1 hover:bg-sky-400"
              >
                Open an Account
                <ArrowRight size={19} />
              </Link>

              <Link
                to="/services"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white/70 px-7 text-base font-black text-slate-900 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-slate-950 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/10"
              >
                Explore Services
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                <CheckCircle2 size={18} className="text-emerald-500" />
                Quick registration
              </span>

              <span className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                <CheckCircle2 size={18} className="text-emerald-500" />
                Secure transactions
              </span>

              <span className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                <CheckCircle2 size={18} className="text-emerald-500" />
                Digital account access
              </span>
            </div>
          </div>

          {/* Banking Dashboard Preview */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-sky-500/20 to-blue-600/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/85 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl sm:p-7 dark:border-white/10 dark:bg-[#0b1526]/90 dark:shadow-black/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Account overview
                  </p>

                  <h2 className="mt-2 text-xl font-black text-slate-950 dark:text-white">
                    Welcome to NexusCore
                  </h2>
                </div>

                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <BadgeCheck size={26} />
                </span>
              </div>

              <div className="relative mt-7 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-600/25">
                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/15" />
                <div className="absolute -right-5 -top-7 h-32 w-32 rounded-full border border-white/15" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-lg font-black">
                      <WalletCards size={22} />
                      NexusCore
                    </span>

                    <Wifi size={22} className="rotate-90" />
                  </div>

                  <p className="mt-12 text-sm font-medium text-white/70">
                    Available balance
                  </p>

                  <p className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                    ₹1,28,450.00
                  </p>

                  <div className="mt-9 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
                        Account holder
                      </p>

                      <p className="mt-1 font-bold">Tanish Gupta</p>
                    </div>

                    <p className="font-black tracking-[0.22em]">•••• 6713</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                      <TrendingUp size={20} />
                    </span>

                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                      +12.5%
                    </span>
                  </div>

                  <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Monthly savings
                  </p>

                  <p className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                    ₹18,200
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                    <ShieldCheck size={20} />
                  </span>

                  <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Security status
                  </p>

                  <p className="mt-1 flex items-center gap-2 text-base font-black text-slate-950 dark:text-white">
                    Fully protected
                    <CheckCircle2 size={17} className="text-emerald-500" />
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-4 hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex dark:border-white/10 dark:bg-[#0b1526]/95">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <ShieldCheck size={22} />
              </span>

              <div>
                <p className="text-sm font-black text-slate-950 dark:text-white">
                  Protected banking
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Secure at every step
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-y border-slate-200 bg-white dark:border-white/10 dark:bg-[#07101d]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 px-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {trustPoints.map((point, index) => {
            const Icon = point.icon;

            return (
              <div
                key={point.title}
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
                  <p className="font-black text-slate-950 dark:text-white">
                    {point.title}
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {point.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Account Types */}
      <section className="bg-slate-50 py-20 sm:py-24 dark:bg-[#050b14]">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">
                Banking products
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                Accounts designed for different goals
              </h2>

              <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-400">
                Select an account that matches the way you save, spend or
                operate your business.
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
            {accountTypes.map((account) => {
              const Icon = account.icon;

              return (
                <Link
                  key={account.title}
                  to={account.path}
                  className="group relative flex min-h-[350px] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-sky-300 hover:shadow-2xl hover:shadow-sky-500/10 dark:border-white/10 dark:bg-[#0b1526] dark:hover:border-sky-400/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/[0.07] via-transparent to-blue-600/[0.07] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between">
                      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 transition duration-300 group-hover:rotate-3 group-hover:scale-105">
                        <Icon size={29} />
                      </span>

                      <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-black text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
                        {account.badge}
                      </span>
                    </div>

                    <h3 className="mt-8 text-2xl font-black text-slate-950 transition group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400">
                      {account.title}
                    </h3>

                    <p className="mt-4 flex-1 text-sm leading-7 text-slate-600 dark:text-slate-400">
                      {account.description}
                    </p>

                    <span className="mt-7 inline-flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-900 transition group-hover:border-sky-500 group-hover:bg-sky-500 group-hover:text-white dark:border-white/10 dark:text-white">
                      View account details
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="border-y border-slate-200 bg-white py-20 sm:py-24 dark:border-white/10 dark:bg-[#07101d]">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">
              Everyday banking
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Everything you need in one place
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-400">
              NexusCore brings essential banking operations into one secure,
              understandable and responsive platform.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {bankingServices.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  key={service.title}
                  className="group flex gap-5 rounded-[1.6rem] border border-slate-200 bg-slate-50 p-6 transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:bg-white hover:shadow-xl dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-sky-400/30 dark:hover:bg-white/[0.055]"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 transition group-hover:bg-sky-500 group-hover:text-white dark:text-sky-400">
                    <Icon size={25} />
                  </span>

                  <div>
                    <h3 className="text-lg font-black text-slate-950 dark:text-white">
                      {service.title}
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
                      {service.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24 dark:bg-[#050b14]">
        <div className="absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-7 text-white shadow-2xl shadow-slate-900/20 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-400">
                    Security centre
                  </p>

                  <h3 className="mt-2 text-2xl font-black">
                    Account protection
                  </h3>
                </div>

                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
                  <ShieldCheck size={29} />
                </span>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  "Secure authentication enabled",
                  "Transaction verification active",
                  "Account activity monitoring",
                  "Sensitive information protected",
                ].map((securityItem) => (
                  <div
                    key={securityItem}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.055] p-4"
                  >
                    <span className="flex items-center gap-3 text-sm font-bold text-slate-200">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                        <Check size={17} />
                      </span>

                      {securityItem}
                    </span>

                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-sky-500/10 p-4 text-sky-300">
                <LockKeyhole size={21} className="shrink-0" />

                <p className="text-sm font-bold">
                  Your security settings can be reviewed from your account
                  dashboard.
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">
              Security first
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Your financial information deserves serious protection
            </h2>

            <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-400">
              NexusCore is designed to protect account access, sensitive
              information and important financial operations through multiple
              security layers.
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <LockKeyhole size={21} />
                </span>

                <div>
                  <h3 className="font-black text-slate-950 dark:text-white">
                    Protected authentication
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    Secure sign-in and role-based access help keep account areas
                    protected.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <CreditCard size={21} />
                </span>

                <div>
                  <h3 className="font-black text-slate-950 dark:text-white">
                    Verified transactions
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    Important banking operations can include additional
                    confirmation and verification.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Users size={21} />
                </span>

                <div>
                  <h3 className="font-black text-slate-950 dark:text-white">
                    Controlled staff access
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    Employee, manager and administrator areas can be separated
                    through clear role permissions.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/legal#security"
              className="mt-9 inline-flex items-center gap-2 font-black text-sky-600 transition hover:gap-3 dark:text-sky-400"
            >
              Learn about security
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-slate-200 bg-white py-20 sm:py-24 dark:border-white/10 dark:bg-[#07101d]">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">
              Start banking
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Begin in three simple steps
            </h2>
          </div>

          <div className="relative mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Create your profile",
                description:
                  "Register with your basic details and create secure login credentials.",
                icon: UserPlus,
              },
              {
                number: "02",
                title: "Complete verification",
                description:
                  "Provide the required personal and identity information for account review.",
                icon: BadgeCheck,
              },
              {
                number: "03",
                title: "Start banking",
                description:
                  "Access your account dashboard and begin managing your finances.",
                icon: CircleDollarSign,
              },
            ].map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className="relative rounded-[1.7rem] border border-slate-200 bg-slate-50 p-7 dark:border-white/10 dark:bg-white/[0.035]"
                >
                  <span className="absolute right-6 top-5 text-5xl font-black text-slate-200 dark:text-white/[0.06]">
                    {step.number}
                  </span>

                  <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
                    <Icon size={25} />
                  </span>

                  <h3 className="mt-7 text-xl font-black text-slate-950 dark:text-white">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-50 px-5 py-20 sm:px-6 sm:py-24 lg:px-8 dark:bg-[#050b14]">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 px-6 py-14 text-white shadow-2xl shadow-blue-600/25 sm:px-10 lg:px-16 lg:py-16">
          <div className="absolute -right-28 -top-40 h-96 w-96 rounded-full border border-white/15" />
          <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full border border-white/15" />
          <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black backdrop-blur">
                <Banknote size={17} />
                Your financial journey starts here
              </span>

              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
                Ready for a smarter banking experience?
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-blue-100 sm:text-lg">
                Create your NexusCore profile and access secure digital
                accounts, transfers, transaction management and financial
                insights.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                to="/register"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-white px-7 font-black text-blue-700 shadow-xl transition hover:-translate-y-1 hover:bg-blue-50"
              >
                Create Account
                <ArrowRight size={19} />
              </Link>

              <Link
                to="/login"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-7 font-black text-white backdrop-blur transition hover:-translate-y-1 hover:bg-white/20"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
