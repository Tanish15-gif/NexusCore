import {
  LogOut,
  Menu,
  Moon,
  Search,
  ShoppingCart,
  Store,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Theme = "light" | "dark";

interface MartNavbarProps {
  cartCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const THEME_KEY = "nexusmart-theme";

function getInitialTheme(): Theme {
  const storedTheme = localStorage.getItem(THEME_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

export default function MartNavbar({
  cartCount,
  searchValue,
  onSearchChange,
}: MartNavbarProps) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    document.getElementById("mart-products")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#070d1a]/90">
      <div className="mx-auto flex min-h-18 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <Store size={21} />
          </span>

          <span>
            <span className="block text-lg font-black tracking-tight text-slate-950 dark:text-white">
              NexusMart
            </span>
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:block">
              Connected commerce
            </span>
          </span>
        </Link>

        <form
          onSubmit={submitSearch}
          className="hidden min-w-0 flex-1 items-center md:flex"
        >
          <div className="mx-auto flex w-full max-w-xl items-center rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:focus-within:bg-white/[0.06]">
            <Search className="ml-4 shrink-0 text-slate-400" size={19} />

            <input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search products, electronics, gaming..."
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            />

            <button
              type="submit"
              className="m-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-500"
            >
              Search
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() =>
              setTheme((current) => (current === "dark" ? "light" : "dark"))
            }
            aria-label="Toggle appearance"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-indigo-400"
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <Link
            to="/login"
            aria-label="Sign in"
            className="hidden h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600 sm:flex dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-indigo-400"
          >
            <UserRound size={18} />
            Sign in
          </Link>

          <Link
            to="/checkout"
            aria-label="Open cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white transition hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-400"
          >
            <ShoppingCart size={18} />

            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-[#070d1a]">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            aria-label="Toggle mobile menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 md:hidden dark:text-slate-200"
          >
            {isMobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white p-4 md:hidden dark:border-white/10 dark:bg-[#070d1a]">
          <form onSubmit={submitSearch}>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.04]">
              <Search className="ml-4 text-slate-400" size={18} />

              <input
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search NexusMart"
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none dark:text-white"
              />
            </div>
          </form>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-700 dark:border-white/10 dark:text-slate-200"
            >
              <UserRound size={17} />
              Sign in
            </Link>

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-700 dark:border-white/10 dark:text-slate-200"
            >
              <LogOut size={17} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
