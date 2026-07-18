import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Eye,
  Handshake,
  Lightbulb,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

const values = [
  {
    title: "Our Mission",
    description:
      "Make everyday banking clear, secure and accessible through modern digital tools.",
    icon: Target,
  },
  {
    title: "Our Vision",
    description:
      "Build a trusted digital banking experience that puts customers in control of their finances.",
    icon: Eye,
  },
  {
    title: "Our People",
    description:
      "Bring technology, banking knowledge and thoughtful design together in one platform.",
    icon: Users,
  },
];

const milestones = [
  {
    year: "2023",
    title: "NexusCore began",
    description:
      "The project started with a goal to simplify digital banking and account management.",
  },
  {
    year: "2024",
    title: "Core banking workflows",
    description:
      "Customer accounts, transactions, transfers and staff approval workflows were introduced.",
  },
  {
    year: "2025",
    title: "Smarter financial tools",
    description:
      "Financial insights, invoices, secure verification and role-based dashboards were added.",
  },
  {
    year: "2026",
    title: "Modern platform redesign",
    description:
      "NexusCore moved toward React, TypeScript and a more professional responsive experience.",
  },
];

export default function AboutPage() {
  useEffect(() => {
    document.title = "About Us | NexusCore Bank";
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-slate-50 dark:bg-[#050b14]">
        <div className="absolute -left-40 top-10 -z-10 h-96 w-96 rounded-full bg-sky-400/20 blur-[120px] dark:bg-sky-500/10" />

        <div className="absolute -right-40 top-0 -z-10 h-[460px] w-[460px] rounded-full bg-blue-500/20 blur-[140px] dark:bg-blue-600/10" />

        <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:52px_52px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)]" />

        <div className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-black text-sky-700 shadow-sm backdrop-blur dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
            <Building2 size={16} />
            About NexusCore
          </span>

          <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-black leading-[1.05] tracking-[-0.05em] text-slate-950 sm:text-6xl dark:text-white">
            Building a clearer and more secure{" "}
            <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
              banking experience.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-400">
            NexusCore brings account management, transactions and banking
            operations together through one modern digital platform.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="border-y border-slate-200 bg-white py-20 sm:py-24 dark:border-white/10 dark:bg-[#07101d]">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-8 shadow-xl dark:border-white/10 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 sm:p-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-sky-200 dark:border-white/10" />

            <div className="relative">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
                <Handshake size={30} />
              </span>

              <p className="mt-8 text-sm font-black uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
                Trust and responsibility
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                Banking should feel understandable
              </h2>

              <div className="mt-8 space-y-4">
                {[
                  "Clear account information",
                  "Secure financial operations",
                  "Simple customer experiences",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.055]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 size={18} />
                    </span>

                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">
              Our story
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Created to simplify digital banking
            </h2>

            <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-400">
              NexusCore began with a straightforward idea: customers should be
              able to understand and manage their finances without confusing
              interfaces or unnecessary steps.
            </p>

            <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-400">
              The platform combines customer banking, employee approvals,
              account operations and secure transaction management in one
              connected system.
            </p>

            <Link
              to="/contact"
              className="mt-8 inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-sky-500 px-6 font-black text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-1 hover:bg-sky-400"
            >
              Contact Us
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50 py-20 sm:py-24 dark:bg-[#050b14]">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">
              What guides us
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Our core values
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-400">
              Practical principles behind every NexusCore experience.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <article
                  key={value.title}
                  className="group rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-sky-300 hover:shadow-2xl hover:shadow-sky-500/10 dark:border-white/10 dark:bg-[#0b1526] dark:hover:border-sky-400/30"
                >
                  <span className="flex h-15 w-15 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 transition group-hover:bg-sky-500 group-hover:text-white dark:text-sky-400">
                    <Icon size={27} />
                  </span>

                  <h3 className="mt-7 text-2xl font-black text-slate-950 dark:text-white">
                    {value.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    {value.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-y border-slate-200 bg-white py-20 sm:py-24 dark:border-white/10 dark:bg-[#07101d]">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">
              Our approach
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Technology with purpose
            </h2>

            <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-400">
              We use technology to reduce complexity, improve visibility and
              make important banking actions easier to complete.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              {
                title: "Customer first",
                description:
                  "Interfaces and workflows are designed around clear customer needs.",
                icon: Users,
              },
              {
                title: "Security focused",
                description:
                  "Sensitive operations are protected through authentication and verification.",
                icon: ShieldCheck,
              },
              {
                title: "Simple by design",
                description:
                  "Banking information is presented clearly without unnecessary complexity.",
                icon: Lightbulb,
              },
              {
                title: "Built responsibly",
                description:
                  "Account access and staff operations follow structured permission controls.",
                icon: BadgeCheck,
              },
            ].map((principle) => {
              const Icon = principle.icon;

              return (
                <article
                  key={principle.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/[0.035]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <Icon size={21} />
                  </span>

                  <h3 className="mt-4 font-black text-slate-950 dark:text-white">
                    {principle.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {principle.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-slate-50 py-20 sm:py-24 dark:bg-[#050b14]">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">
              Our journey
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              How NexusCore evolved
            </h2>
          </div>

          <div className="relative mt-14">
            <div className="absolute bottom-0 left-5 top-0 w-px bg-slate-200 md:left-1/2 dark:bg-white/10" />

            <div className="space-y-8">
              {milestones.map((milestone, index) => {
                const isLeft = index % 2 === 0;

                return (
                  <div
                    key={milestone.year}
                    className="relative grid gap-6 pl-14 md:grid-cols-2 md:pl-0"
                  >
                    <span className="absolute left-0 top-7 flex h-10 w-10 items-center justify-center rounded-full border-4 border-slate-50 bg-sky-500 text-xs font-black text-white shadow-lg md:left-1/2 md:-translate-x-1/2 dark:border-[#050b14]">
                      {index + 1}
                    </span>

                    <div
                      className={
                        isLeft
                          ? "md:col-start-1 md:pr-10"
                          : "md:col-start-2 md:pl-10"
                      }
                    >
                      <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0b1526]">
                        <p className="text-sm font-black text-sky-600 dark:text-sky-400">
                          {milestone.year}
                        </p>

                        <h3 className="mt-2 text-xl font-black text-slate-950 dark:text-white">
                          {milestone.title}
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                          {milestone.description}
                        </p>
                      </article>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-50 px-5 pb-20 sm:px-6 sm:pb-24 lg:px-8 dark:bg-[#050b14]">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 px-6 py-14 text-white shadow-2xl shadow-blue-600/25 sm:px-10 lg:px-16">
          <div className="absolute -right-28 -top-40 h-96 w-96 rounded-full border border-white/15" />

          <div className="relative flex flex-col gap-9 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black backdrop-blur">
                <BadgeCheck size={17} />
                Built for modern banking
              </span>

              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
                Explore what NexusCore can do
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-blue-100 sm:text-lg">
                Discover our account options, banking services and secure
                financial tools.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                to="/services"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-white px-7 font-black text-blue-700 shadow-xl transition hover:-translate-y-1 hover:bg-blue-50"
              >
                View Services
                <ArrowRight size={19} />
              </Link>

              <Link
                to="/contact"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-7 font-black text-white backdrop-blur transition hover:-translate-y-1 hover:bg-white/20"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
