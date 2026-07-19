import {
  LayoutDashboard,
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

import { type FormEvent, useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  AUTH_CHANGED_EVENT,
  getAuthToken,
  getRoleFromToken,
  removeAuthSession,
} from "../../services/authService";

type Theme = "light" | "dark";

interface MartNavbarProps {
  cartCount: number;
  searchValue: string;

  onSearchChange: (value: string) => void;

  onSearchSubmit?: (value: string) => void;

  showSearch?: boolean;
}

const THEME_STORAGE_KEY = "nexusmart-theme";

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export default function MartNavbar({
  cartCount,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  showSearch = true,
}: MartNavbarProps) {
  const navigate = useNavigate();

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(getAuthToken()),
  );

  const [userRole, setUserRole] = useState<string | null>(() => {
    const token = getAuthToken();

    return token ? getRoleFromToken(token) : null;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");

    document.documentElement.style.colorScheme = theme;

    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const updateAuthState = () => {
      const token = getAuthToken();

      setIsAuthenticated(Boolean(token));

      setUserRole(token ? getRoleFromToken(token) : null);
    };

    updateAuthState();

    window.addEventListener(AUTH_CHANGED_EVENT, updateAuthState);

    window.addEventListener("storage", updateAuthState);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, updateAuthState);

      window.removeEventListener("storage", updateAuthState);
    };
  }, []);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (onSearchSubmit) {
      onSearchSubmit(searchValue);
    } else {
      document.getElementById("mart-products")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    removeAuthSession();

    setIsAuthenticated(false);
    setUserRole(null);
    setIsMobileMenuOpen(false);

    navigate("/", {
      replace: true,
    });
  };

  const normalizedRole = userRole?.trim().toLowerCase();

  const isAdmin = normalizedRole === "admin" || normalizedRole === "superadmin";

  const dashboardUrl = isAdmin ? "/admin" : "/profile";

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

        {showSearch && (
          <form
            onSubmit={handleSearchSubmit}
            className="hidden min-w-0 flex-1 items-center md:flex"
          >
            <div className="mx-auto flex w-full max-w-xl items-center rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:focus-within:bg-white/[0.06]">
              <Search size={19} className="ml-4 shrink-0 text-slate-400" />

              <input
                type="search"
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
        )}

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() =>
              setTheme((currentTheme) =>
                currentTheme === "dark" ? "light" : "dark",
              )
            }
            aria-label="Toggle appearance"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-indigo-400"
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {!isAuthenticated ? (
            <Link
              to="/login"
              className="hidden h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600 sm:flex dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-indigo-400"
            >
              <UserRound size={18} />
              Sign in
            </Link>
          ) : (
            <>
              <Link
                to={dashboardUrl}
                className="hidden h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600 sm:flex dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-indigo-400"
              >
                <LayoutDashboard size={18} />

                {isAdmin ? "Admin" : "My account"}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                aria-label="Sign out"
                className="hidden h-10 w-10 items-center justify-center rounded-xl text-rose-500 transition hover:bg-rose-50 sm:flex dark:text-rose-400 dark:hover:bg-rose-400/10"
              >
                <LogOut size={18} />
              </button>
            </>
          )}

          <Link
            to="/checkout"
            aria-label="Open shopping cart"
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
          {showSearch && (
            <form onSubmit={handleSearchSubmit}>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.04]">
                <Search size={18} className="ml-4 shrink-0 text-slate-400" />

                <input
                  type="search"
                  value={searchValue}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Search NexusMart"
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                />

                <button
                  type="submit"
                  aria-label="Search"
                  className="mr-2 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white"
                >
                  <Search size={17} />
                </button>
              </div>
            </form>
          )}

          {!isAuthenticated ? (
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className={[
                "flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-700 dark:border-white/10 dark:text-slate-200",
                showSearch ? "mt-3" : "",
              ].join(" ")}
            >
              <UserRound size={17} />
              Sign in
            </Link>
          ) : (
            <div
              className={[
                "grid grid-cols-2 gap-2",
                showSearch ? "mt-3" : "",
              ].join(" ")}
            >
              <Link
                to={dashboardUrl}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-700 dark:border-white/10 dark:text-slate-200"
              >
                <LayoutDashboard size={17} />

                {isAdmin ? "Admin" : "Account"}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 py-3 text-sm font-bold text-rose-600 dark:border-rose-400/20 dark:text-rose-400"
              >
                <LogOut size={17} />
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
