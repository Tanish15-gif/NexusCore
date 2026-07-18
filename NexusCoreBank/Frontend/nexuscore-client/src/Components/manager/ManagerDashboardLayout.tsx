import { useEffect, useState } from "react";
import {
  BookOpen,
  Building2,
  Clock3,
  LogOut,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  X,
  type LucideIcon,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { getAuthToken, removeAuthToken } from "../../services/authService";

interface ManagerNavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const navigation: ManagerNavigationItem[] = [
  {
    label: "Pending Deposits",
    path: "/manager/deposits",
    icon: Clock3,
  },
  {
    label: "Global Ledger",
    path: "/manager/ledger",
    icon: BookOpen,
  },
  {
    label: "Security & Operations",
    path: "/manager/security",
    icon: ShieldCheck,
  },
];

function getManagerInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function ManagerDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const managerName =
    localStorage.getItem("nexus_manager_name") ?? "Branch Manager";

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const storedTheme = localStorage.getItem("nexuscore-theme");

    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.title = "Executive Operations | NexusCore";

    if (!getAuthToken()) {
      navigate("/login", {
        replace: true,
      });
    }
  }, [navigate]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");

    localStorage.setItem("nexuscore-theme", theme);
  }, [theme]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const signOut = () => {
    removeAuthToken();

    localStorage.removeItem("userid");
    localStorage.removeItem("nexus_manager_name");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#050b14] dark:text-white">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col dark:border-white/10 dark:bg-[#091323]">
        <ManagerSidebar managerName={managerName} onSignOut={signOut} />
      </aside>

      {/* Mobile sidebar */}
      <div
        className={[
          "fixed inset-0 z-50 lg:hidden",
          isSidebarOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        <button
          type="button"
          aria-label="Close manager navigation"
          onClick={() => setIsSidebarOpen(false)}
          className={[
            "absolute inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity",
            isSidebarOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        <aside
          className={[
            "absolute inset-y-0 left-0 flex w-[86%] max-w-72 flex-col",
            "border-r border-slate-200 bg-white shadow-2xl",
            "transition-transform duration-300",
            "dark:border-white/10 dark:bg-[#091323]",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close navigation"
            className="absolute right-4 top-5 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400"
          >
            <X size={18} />
          </button>

          <ManagerSidebar managerName={managerName} onSignOut={signOut} />
        </aside>
      </div>

      {/* Dashboard */}
      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8 dark:border-white/10 dark:bg-[#050b14]/95">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open manager navigation"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 lg:hidden dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
                Executive branch
              </p>

              <h1 className="mt-1 truncate text-lg font-black text-slate-950 sm:text-xl dark:text-white">
                Welcome,{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  {managerName}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setTheme((current) => (current === "dark" ? "light" : "dark"))
              }
              aria-label="Toggle dashboard theme"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-indigo-400"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white">
              {getManagerInitials(managerName)}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function ManagerSidebar({
  managerName,
  onSignOut,
}: {
  managerName: string;
  onSignOut: () => void;
}) {
  return (
    <>
      <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6 dark:border-white/10">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <Building2 size={21} />
        </span>

        <div>
          <p className="font-black text-slate-950 dark:text-white">
            NexusCore Executive
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Branch Management
          </p>
        </div>
      </div>

      <div className="px-5 pt-6">
        <p className="px-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
          Management
        </p>
      </div>

      <nav className="mt-3 flex-1 space-y-1 px-4">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "relative flex min-h-12 items-center gap-3 rounded-lg px-4 text-sm font-bold transition",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-white",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  )}

                  <Icon size={18} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-5 dark:border-white/10">
        <div className="mb-4">
          <p className="truncate text-sm font-black text-slate-950 dark:text-white">
            {managerName}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Executive Operations
          </p>

          <span className="mt-3 inline-flex rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/[0.08] dark:text-amber-300">
            Tier 2 Branch Manager
          </span>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-200 text-sm font-black text-red-600 transition hover:bg-red-50 dark:border-red-400/20 dark:text-red-300 dark:hover:bg-red-400/10"
        >
          <LogOut size={17} />
          Sign Out
        </button>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={14} className="text-emerald-500" />
          Secured by NexusCore
        </div>
      </div>
    </>
  );
}
