import { useEffect, useState } from "react";
import { ArrowUp, Landmark, Mail, MapPin, Phone } from "lucide-react";
import { FaGithub, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";

const productLinks = [
  {
    label: "Savings Account",
    path: "/accounts",
  },
  {
    label: "Current Account",
    path: "/accounts",
  },
  {
    label: "Fixed Deposit",
    path: "/accounts",
  },
  {
    label: "Nexus Loan",
    path: "/accounts",
  },
  {
    label: "Daily Deposit",
    path: "/accounts",
  },
];

const companyLinks = [
  {
    label: "About Us",
    path: "/about",
  },
  {
    label: "Services",
    path: "/services",
  },
  {
    label: "Features",
    path: "/features",
  },
  {
    label: "Privacy Policy",
    path: "/legal#privacy",
  },
  {
    label: "Security",
    path: "/legal#security",
  },
];

export default function PublicFooter() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <footer className="relative border-t border-slate-200 bg-white dark:border-white/10 dark:bg-[#07101d]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.25fr]">
            <div>
              <Link to="/" className="inline-flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/20">
                  <Landmark size={23} />
                </span>

                <span className="text-2xl font-black text-slate-950 dark:text-white">
                  NexusCore
                </span>
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600 dark:text-slate-400">
                Secure digital banking designed to simplify accounts,
                transactions and everyday financial management.
              </p>

              <div className="mt-6 flex gap-3">
                <a
                  href="#"
                  aria-label="NexusCore on X"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:-translate-y-1 hover:border-sky-500 hover:bg-sky-500 hover:text-white dark:border-white/10 dark:text-slate-400"
                >
                  <FaXTwitter size={17} />
                </a>

                <a
                  href="#"
                  aria-label="NexusCore on LinkedIn"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:-translate-y-1 hover:border-sky-500 hover:bg-sky-500 hover:text-white dark:border-white/10 dark:text-slate-400"
                >
                  <FaLinkedinIn size={17} />
                </a>

                <a
                  href="https://github.com/Tanish15-gif/NexusCore"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="NexusCore GitHub repository"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:-translate-y-1 hover:border-sky-500 hover:bg-sky-500 hover:text-white dark:border-white/10 dark:text-slate-400"
                >
                  <FaGithub size={18} />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-black text-slate-950 dark:text-white">
                Products
              </h3>

              <ul className="mt-5 space-y-3">
                {productLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className="text-sm text-slate-600 transition hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-black text-slate-950 dark:text-white">
                Company
              </h3>

              <ul className="mt-5 space-y-3">
                {companyLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className="text-sm text-slate-600 transition hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-black text-slate-950 dark:text-white">
                Contact
              </h3>

              <ul className="mt-5 space-y-4">
                <li>
                  <a
                    href="mailto:support@nexuscore.com"
                    className="flex items-start gap-3 text-sm text-slate-600 transition hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400"
                  >
                    <Mail size={17} className="mt-0.5 shrink-0" />

                    <span className="break-all">support@nexuscore.com</span>
                  </a>
                </li>

                <li>
                  <a
                    href="tel:+919867606713"
                    className="flex items-center gap-3 text-sm text-slate-600 transition hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400"
                  >
                    <Phone size={17} className="shrink-0" />

                    <span>+91 9867606713</span>
                  </a>
                </li>

                <li className="flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  <MapPin size={17} className="mt-0.5 shrink-0" />

                  <span>Mumbai, Maharashtra, India</span>
                </li>

                <li>
                  <Link
                    to="/contact"
                    className="font-black text-sky-600 transition hover:text-sky-500 dark:text-sky-400"
                  >
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-14 border-t border-slate-200 pt-7 dark:border-white/10">
            <div className="flex flex-col gap-4 text-center md:flex-row md:items-start md:justify-between md:text-left">
              <p className="text-xs leading-6 text-slate-500">
                © 2026 NexusCore Bank. All rights reserved.
              </p>

              <p className="max-w-3xl text-xs leading-6 text-slate-500 md:text-right">
                NexusCore is an educational financial technology project, not a
                licensed bank. Services shown are for demonstration purposes.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <button
        type="button"
        onClick={scrollToTop}
        className={[
          "fixed bottom-5 right-5 z-30 flex h-12 w-12",
          "items-center justify-center rounded-2xl",
          "bg-sky-500 text-white shadow-xl shadow-sky-500/30",
          "transition duration-300 hover:-translate-y-1 hover:bg-sky-400",
          showBackToTop
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
        ].join(" ")}
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>
    </>
  );
}
