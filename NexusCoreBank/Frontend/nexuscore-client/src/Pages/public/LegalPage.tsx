import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  Eye,
  FileText,
  KeyRound,
  Lock,
  Scale,
  Shield,
} from "lucide-react";

type LegalSectionId = "privacy" | "terms" | "security";

const navigationItems: Array<{
  id: LegalSectionId;
  label: string;
  icon: typeof Shield;
}> = [
  {
    id: "privacy",
    label: "Privacy Policy",
    icon: Shield,
  },
  {
    id: "terms",
    label: "Terms of Service",
    icon: FileText,
  },
  {
    id: "security",
    label: "Security Details",
    icon: Lock,
  },
];

function isLegalSectionId(value: string): value is LegalSectionId {
  return value === "privacy" || value === "terms" || value === "security";
}

export default function LegalPage() {
  const [activeSection, setActiveSection] = useState<LegalSectionId>("privacy");

  useEffect(() => {
    document.title = "Legal & Security | NexusCore Bank";

    const hash = window.location.hash.replace("#", "");

    if (!isLegalSectionId(hash)) {
      return;
    }

    setActiveSection(hash);

    const timeoutId = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(
      "[data-legal-section]",
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              first.boundingClientRect.top - second.boundingClientRect.top,
          );

        const currentSection = visibleSections[0];

        if (!currentSection) {
          return;
        }

        const sectionId = currentSection.target.id;

        if (!isLegalSectionId(sectionId)) {
          return;
        }

        setActiveSection(sectionId);

        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}#${sectionId}`,
        );
      },
      {
        root: null,
        rootMargin: "-130px 0px -55% 0px",
        threshold: 0,
      },
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleNavigation = (sectionId: LegalSectionId) => {
    setActiveSection(sectionId);

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#${sectionId}`,
    );

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50 py-14 dark:border-white/10 dark:bg-[#050b14] sm:py-16">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
            <Scale size={16} />
            NexusCore Trust Center
          </span>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl dark:text-white">
            Legal and security
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
            Understand how NexusCore handles personal information, platform
            access and account security.
          </p>
        </div>
      </section>

      {/* Project notice */}
      <section className="bg-slate-50 px-5 pt-10 dark:bg-[#050b14] sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-400/20 dark:bg-amber-400/[0.07]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Scale size={20} />
          </span>

          <div>
            <h2 className="font-black text-amber-900 dark:text-amber-200">
              Educational project notice
            </h2>

            <p className="mt-1 text-sm leading-6 text-amber-800/80 dark:text-amber-200/70">
              NexusCore is an educational financial technology project and is
              not a licensed bank. The policies below describe the intended
              platform behaviour for demonstration purposes.
            </p>
          </div>
        </div>
      </section>

      {/* Mobile navigation */}
      <div className="sticky top-20 z-30 border-b border-slate-200 bg-white/95 px-5 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#07101d]/95 lg:hidden">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigation(item.id)}
                className={[
                  "inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition",
                  isActive
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                    : "border border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300",
                ].join(" ")}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legal content */}
      <section className="relative overflow-visible bg-slate-50 py-12 dark:bg-[#050b14] sm:py-16">
        <div className="mx-auto grid max-w-7xl items-start gap-10 px-5 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
          {/* Desktop sticky sidebar */}
          <aside
            className="hidden self-start lg:block"
            style={{
              position: "sticky",
              top: "7rem",
            }}
          >
            <nav className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1526]">
              <p className="px-3 pb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Legal and trust
              </p>

              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigation(item.id)}
                      className={[
                        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-black transition",
                        isActive
                          ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white",
                      ].join(" ")}
                    >
                      <Icon size={18} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>

          <main className="min-w-0 space-y-8">
            {/* Privacy */}
            <section
              id="privacy"
              data-legal-section
              className="scroll-mt-36 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#0b1526]"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <Shield size={23} />
                  </span>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-600 dark:text-sky-400">
                      Your information
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl dark:text-white">
                      Privacy Policy
                    </h2>
                  </div>
                </div>

                <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">
                  Updated July 2026
                </span>
              </div>

              <p className="mt-6 leading-8 text-slate-600 dark:text-slate-400">
                NexusCore collects only the information required to create
                accounts, demonstrate banking workflows and provide support. The
                project does not sell personal information to advertisers.
              </p>

              <div className="mt-7 grid gap-4">
                <LegalItem
                  icon={Database}
                  title="Information collected"
                  description="Account details may include your name, email address, phone number, date of birth, address and activity created inside the platform."
                />

                <LegalItem
                  icon={Eye}
                  title="How information is used"
                  description="Information is used to authenticate users, provide account features, process demonstration workflows and respond to support requests."
                />

                <LegalItem
                  icon={Shield}
                  title="Data protection"
                  description="Sensitive information should be protected through secure authentication, restricted access and appropriate server-side validation."
                />
              </div>
            </section>

            {/* Terms */}
            <section
              id="terms"
              data-legal-section
              className="scroll-mt-36 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#0b1526]"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <FileText size={23} />
                  </span>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400">
                      Platform usage
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl dark:text-white">
                      Terms of Service
                    </h2>
                  </div>
                </div>

                <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">
                  Updated July 2026
                </span>
              </div>

              <p className="mt-6 leading-8 text-slate-600 dark:text-slate-400">
                By creating an account or using NexusCore, users agree to
                provide accurate information, protect their login credentials
                and use the platform only for lawful purposes.
              </p>

              <ul className="mt-7 space-y-4">
                {[
                  "Users must provide accurate registration information.",
                  "Users are responsible for protecting their passwords and account access.",
                  "The platform must not be used for fraud, abuse or illegal activity.",
                  "Accounts may be restricted when suspicious or harmful activity is detected.",
                  "Demonstration balances, transactions and rates do not represent real financial products.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-7 text-slate-600 dark:text-slate-400"
                  >
                    <CheckCircle2
                      size={19}
                      className="mt-1 shrink-0 text-emerald-500"
                    />

                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Security */}
            <section
              id="security"
              data-legal-section
              className="scroll-mt-36 overflow-hidden rounded-[1.75rem] border border-sky-500/30 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6 text-white shadow-2xl shadow-sky-500/10 sm:p-8"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-400">
                    <Lock size={23} />
                  </span>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-400">
                      Account protection
                    </p>

                    <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                      Security Details
                    </h2>
                  </div>
                </div>

                <span className="w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
                  Always monitored
                </span>
              </div>

              <p className="mt-6 leading-8 text-slate-300">
                NexusCore is designed around secure authentication, access
                control and server-side validation. Security protections will be
                expanded as backend features are integrated.
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <SecurityCard
                  icon={KeyRound}
                  title="Secure authentication"
                  description="Passwords, sessions and external login providers should be handled through secure backend authentication."
                />

                <SecurityCard
                  icon={Shield}
                  title="Role-based access"
                  description="Customers, employees and administrators should only access features allowed for their roles."
                />

                <SecurityCard
                  icon={Database}
                  title="Protected records"
                  description="Sensitive account and transaction data should never be trusted or validated only by the frontend."
                />

                <SecurityCard
                  icon={Eye}
                  title="Activity monitoring"
                  description="Important actions can be logged to help identify errors, misuse and suspicious behaviour."
                />
              </div>
            </section>

            {/* Contact */}
            <div className="flex flex-col items-start justify-between gap-5 rounded-[1.5rem] border border-slate-200 bg-white p-6 sm:flex-row sm:items-center dark:border-white/10 dark:bg-[#0b1526]">
              <div>
                <h2 className="text-lg font-black text-slate-950 dark:text-white">
                  Have a legal or security question?
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Contact the NexusCore support team for clarification.
                </p>
              </div>

              <Link
                to="/contact"
                className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 font-black text-white transition hover:-translate-y-0.5 hover:bg-sky-400 sm:w-auto"
              >
                Contact Support
                <ArrowRight size={17} />
              </Link>
            </div>
          </main>
        </div>
      </section>
    </>
  );
}

function LegalItem({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.035]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
        <Icon size={20} />
      </span>

      <div>
        <h3 className="font-black text-slate-950 dark:text-white">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function SecurityCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-400">
        <Icon size={20} />
      </span>

      <h3 className="mt-4 font-black text-white">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </article>
  );
}
