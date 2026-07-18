import { useEffect, useState } from "react";
import { ChevronRight, Landmark, Menu, Moon, Sun, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";

type Theme = "light" | "dark";

const navigationItems = [
  {
    label: "Home",
    path: "/",
  },
  {
    label: "About",
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
    label: "Accounts",
    path: "/accounts",
  },
];

const THEME_STORAGE_KEY = "nexuscore-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");

    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "relative py-2 text-sm font-bold transition-colors",
      "after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5",
      "after:origin-left after:rounded-full after:bg-sky-500",
      "after:transition-transform after:duration-300",
      isActive
        ? "text-sky-600 after:scale-x-100 dark:text-sky-400"
        : "text-slate-600 after:scale-x-0 hover:text-slate-950 hover:after:scale-x-100 dark:text-slate-300 dark:hover:text-white",
    ].join(" ");

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center justify-between rounded-2xl px-4 py-3.5",
      "font-bold transition",
      isActive
        ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5",
    ].join(" ");

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#050b14]/90">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="group flex items-center gap-3"
            aria-label="NexusCore home"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/20 transition group-hover:-rotate-3 group-hover:scale-105">
              <Landmark size={24} />
            </span>

            <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-2xl font-black tracking-tight text-transparent">
              NexusCore
            </span>
          </Link>

          <nav
            className="hidden items-center gap-8 lg:flex"
            aria-label="Primary navigation"
          >
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={desktopLinkClass}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-sky-300 hover:text-sky-600 dark:border-white/10 dark:bg-white/5 dark:text-white"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link
              to="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 text-sm font-black text-slate-900 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white dark:border-white/20 dark:text-white dark:hover:bg-white dark:hover:text-slate-950"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-sky-500 px-5 text-sm font-black text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400"
            >
              Create Account
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <div
        className={[
          "fixed inset-0 z-50 lg:hidden",
          isMenuOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={() => setIsMenuOpen(false)}
          className={[
            "absolute inset-0 bg-slate-950/65 backdrop-blur-sm",
            "transition-opacity duration-300",
            isMenuOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
          aria-label="Close navigation menu"
        />

        <aside
          className={[
            "absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col",
            "border-r border-slate-200 bg-white p-5 shadow-2xl",
            "transition-transform duration-300 ease-out",
            "dark:border-white/10 dark:bg-[#07101d]",
            isMenuOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white">
                <Landmark size={23} />
              </span>

              <span className="text-xl font-black text-slate-950 dark:text-white">
                NexusCore
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 dark:border-white/10 dark:text-white"
              aria-label="Close navigation menu"
            >
              <X size={21} />
            </button>
          </div>

          <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Navigation
          </p>

          <nav className="mt-4 flex flex-col gap-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={mobileLinkClass}
              >
                <span>{item.label}</span>
                <ChevronRight size={18} />
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto grid gap-3 border-t border-slate-200 pt-5 dark:border-white/10">
            <Link
              to="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 font-black text-slate-900 dark:border-white/20 dark:text-white"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-sky-500 font-black text-white shadow-lg shadow-sky-500/20"
            >
              Create Account
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
