import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  CheckCircle2,
  FileText,
  Fingerprint,
  Globe2,
  Headphones,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const features = [
  {
    title: "Secure Authentication",
    description:
      "Protected sign-in, role-based access and verification for sensitive banking operations.",
    icon: Fingerprint,
  },
  {
    title: "Instant Transfers",
    description:
      "Transfer funds between eligible accounts through a quick and clear banking workflow.",
    icon: Zap,
  },
  {
    title: "AI Financial Advisor",
    description:
      "Get helpful financial guidance based on your account activity and banking questions.",
    icon: Bot,
  },
  {
    title: "Account Dashboard",
    description:
      "View balances, accounts and recent financial activity from one organised dashboard.",
    icon: LayoutDashboard,
  },
  {
    title: "Smart Invoicing",
    description:
      "Create and manage professional invoices directly through your NexusCore account.",
    icon: FileText,
  },
  {
    title: "Customer Support",
    description:
      "Access support information whenever you need help with an account or transaction.",
    icon: Headphones,
  },
];

const comparisonRows = [
  {
    label: "Account access",
    nexusCore: "Secure digital access",
    traditional: "Branch dependent",
  },
  {
    label: "Transactions",
    nexusCore: "Clear live tracking",
    traditional: "Limited visibility",
  },
  {
    label: "Financial tools",
    nexusCore: "AI and smart invoices",
    traditional: "Basic banking only",
  },
  {
    label: "Availability",
    nexusCore: "24/7 online access",
    traditional: "Limited hours",
  },
];

export default function FeaturesPage() {
  useEffect(() => {
    document.title = "Features | NexusCore Bank";
  }, []);

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50 py-14 dark:border-white/10 dark:bg-[#050b14] sm:py-18">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
              <Sparkles size={16} />
              NexusCore Features
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl dark:text-white">
              Powerful banking tools
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              Secure features that help customers manage accounts, transactions
              and financial activity.
            </p>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="bg-slate-50 py-16 dark:bg-[#050b14] sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group rounded-[1.6rem] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-sky-300 hover:shadow-xl dark:border-white/10 dark:bg-[#0b1526] dark:hover:border-sky-400/30"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 transition group-hover:bg-sky-500 group-hover:text-white dark:text-sky-400">
                    <Icon size={26} />
                  </span>

                  <h2 className="mt-6 text-xl font-black text-slate-950 dark:text-white">
                    {feature.title}
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-y border-slate-200 bg-white py-16 dark:border-white/10 dark:bg-[#07101d] sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
              Why NexusCore
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Modern banking without unnecessary complexity
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-400">
              NexusCore combines essential banking operations with modern
              digital tools in one secure platform.
            </p>

            <div className="mt-7 space-y-3">
              {[
                "Customer and staff dashboards",
                "Secure transaction workflows",
                "AI-powered assistance",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300"
                >
                  <CheckCircle2
                    size={19}
                    className="shrink-0 text-emerald-500"
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Intentionally dark premium panel */}
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6 text-white shadow-2xl shadow-slate-950/20 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-400">
                  Feature comparison
                </p>

                <h3 className="mt-2 text-2xl font-black">
                  NexusCore advantage
                </h3>
              </div>

              <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-400">
                <BarChart3 size={25} />
              </span>
            </div>

            <div className="mt-7 overflow-hidden rounded-2xl border border-white/10">
              <div className="grid grid-cols-[1.1fr_1fr_1fr] bg-white/[0.07] px-4 py-4 text-xs font-black uppercase tracking-[0.12em] text-slate-300">
                <span>Feature</span>
                <span className="text-center text-sky-400">NexusCore</span>
                <span className="text-center">Traditional</span>
              </div>

              {comparisonRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1.1fr_1fr_1fr] items-center border-t border-white/10 px-4 py-5 text-sm"
                >
                  <span className="font-bold text-white">{row.label}</span>

                  <span className="flex items-center justify-center gap-2 text-center font-bold text-sky-300">
                    <Check size={16} />
                    {row.nexusCore}
                  </span>

                  <span className="text-center text-slate-400">
                    {row.traditional}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security strip */}
      <section className="bg-slate-50 py-14 dark:bg-[#050b14]">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0b1526]">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldCheck size={22} />
            </span>

            <div>
              <h3 className="font-black text-slate-950 dark:text-white">
                Secure
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Protected operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0b1526]">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
              <Globe2 size={22} />
            </span>

            <div>
              <h3 className="font-black text-slate-950 dark:text-white">
                Accessible
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Responsive on every device
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0b1526]">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <Bot size={22} />
            </span>

            <div>
              <h3 className="font-black text-slate-950 dark:text-white">
                Intelligent
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                AI-supported banking
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-50 px-5 pb-20 sm:px-6 sm:pb-24 lg:px-8 dark:bg-[#050b14]">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 px-6 py-12 text-white shadow-2xl shadow-blue-600/20 sm:px-10 lg:px-14">
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-black sm:text-4xl">
                Experience NexusCore banking
              </h2>

              <p className="mt-3 max-w-xl text-blue-100">
                Create your account and access secure digital banking tools.
              </p>
            </div>

            <Link
              to="/register"
              className="inline-flex min-h-13 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 font-black text-blue-700 transition hover:-translate-y-1 hover:bg-blue-50"
            >
              Create Account
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
