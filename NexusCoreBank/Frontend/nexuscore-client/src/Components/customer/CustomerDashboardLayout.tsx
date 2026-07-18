import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import {
  Bot,
  ChevronRight,
  Landmark,
  List,
  LogOut,
  Maximize2,
  Menu,
  Minimize2,
  Moon,
  Plus,
  Settings,
  ShieldCheck,
  Sun,
  TrendingUp,
  WalletCards,
  X,
  BellRing,
  CheckCircle2,
} from "lucide-react";

import {
  getCustomerAccounts,
  getCustomerProfile,
  type CustomerAccount,
  type CustomerProfile,
} from "../../services/customerService";
import { getAuthToken, removeAuthToken } from "../../services/authService";
import AccountSettingsModal from "./AccountSettingsModal";
import CustomerKycGate from "./CustomerKycGate";
import {
  startNotificationHub,
  stopNotificationHub,
  subscribeToTransferNotifications,
} from "../../services/notificationHubService";

export interface CustomerDashboardContext {
  profile: CustomerProfile | null;
  accounts: CustomerAccount[];
  isLoading: boolean;
  error: string;
  refreshDashboard: () => Promise<void>;
}

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "nexuscore-theme";

const enabledNavigation = [
  {
    label: "Your Accounts",
    path: "/dashboard/accounts",
    icon: WalletCards,
  },
  {
    label: "Recent Transactions",
    path: "/dashboard/transactions",
    icon: List,
  },
  {
    label: "AI Advisor",
    path: "/dashboard/ai-advisor",
    icon: Bot,
  },
];

function getInitialTheme(): Theme {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
function getStoredPicture(): string | null {
  const pictureUrl = localStorage.getItem("nexus_google_picture");

  if (!pictureUrl || pictureUrl === "null" || pictureUrl === "undefined") {
    return null;
  }

  return pictureUrl.trim();
}

export function useCustomerDashboard() {
  return useOutletContext<CustomerDashboardContext>();
}

export default function CustomerDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const userMenuRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<CustomerProfile | null>(null);

  const [accounts, setAccounts] = useState<CustomerAccount[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(
    Boolean(document.fullscreenElement),
  );

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);

  const [incomingTransferAmount, setIncomingTransferAmount] = useState<
    number | null
  >(null);

  const transferToastTimerRef = useRef<number | null>(null);

  const refreshDashboard = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [profileResponse, accountsResponse] = await Promise.all([
        getCustomerProfile(),
        getCustomerAccounts(),
      ]);

      setProfile(profileResponse);
      setAccounts(Array.isArray(accountsResponse) ? accountsResponse : []);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to load the dashboard.";

      if (message === "UNAUTHORIZED") {
        await stopNotificationHub();
        removeAuthToken();

        navigate("/login", {
          replace: true,
        });

        return;
      }

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const refreshDashboardRef = useRef(refreshDashboard);

  useEffect(() => {
    refreshDashboardRef.current = refreshDashboard;
  }, [refreshDashboard]);

  useEffect(() => {
    document.title = "Customer Dashboard | NexusCore Bank";
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToTransferNotifications(async (amount) => {
      setIncomingTransferAmount(amount);

      await refreshDashboardRef.current();

      window.dispatchEvent(
        new CustomEvent("nexuscore:incoming-transfer", {
          detail: {
            amount,
          },
        }),
      );

      if (transferToastTimerRef.current !== null) {
        window.clearTimeout(transferToastTimerRef.current);
      }

      transferToastTimerRef.current = window.setTimeout(() => {
        setIncomingTransferAmount(null);
        transferToastTimerRef.current = null;
      }, 5000);
    });

    void startNotificationHub();

    return () => {
      unsubscribe();

      if (transferToastTimerRef.current !== null) {
        window.clearTimeout(transferToastTimerRef.current);
        transferToastTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");

    document.documentElement.style.colorScheme = theme;

    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);

      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const totalWealth = useMemo(() => {
    return accounts
      .filter((account) => account.status.toLowerCase() === "active")
      .reduce((total, account) => total + Number(account.balance), 0);
  }, [accounts]);

  const profileName = profile?.fullName?.trim() || "Customer";

  const profileEmail = profile?.email || "customer@nexuscore.com";

  const initials = profileName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const pictureUrl = getStoredPicture();

  const showGoogleAvatar = Boolean(pictureUrl) && !avatarFailed;

  useEffect(() => {
    setAvatarFailed(false);
  }, [pictureUrl]);

  const formattedWealth = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(totalWealth);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (fullscreenError) {
      console.error("Fullscreen request failed:", fullscreenError);
    }
  };

  const signOut = async () => {
    await stopNotificationHub();

    removeAuthToken();

    localStorage.removeItem("userid");
    localStorage.removeItem("active_nexus_account");
    localStorage.removeItem("nexus_google_name");
    localStorage.removeItem("nexus_google_picture");

    navigate("/login", {
      replace: true,
    });
  };

  const outletContext: CustomerDashboardContext = {
    profile,
    accounts,
    isLoading,
    error,
    refreshDashboard,
  };

  return (
    <>
      <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-[#050b14] dark:text-white">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col dark:border-white/10 dark:bg-[#0b1526]">
          <SidebarContent />
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
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close dashboard menu"
            className={[
              "absolute inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity",
              isSidebarOpen ? "opacity-100" : "opacity-0",
            ].join(" ")}
          />

          <aside
            className={[
              "absolute inset-y-0 left-0 flex w-[86%] max-w-72 flex-col",
              "border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300",
              "dark:border-white/10 dark:bg-[#0b1526]",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close dashboard menu"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300"
            >
              <X size={20} />
            </button>

            <SidebarContent />
          </aside>
        </div>

        <div className="min-h-screen lg:pl-72">
          {/* Header */}
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#07101d]/90">
            <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  aria-label="Open dashboard menu"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  <Menu size={21} />
                </button>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Customer dashboard
                  </p>

                  <h1 className="truncate text-lg font-black text-slate-950 sm:text-2xl dark:text-white">
                    Welcome,{" "}
                    <span className="text-blue-600 dark:text-blue-400">
                      {profileName}
                    </span>
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Wealth */}
                <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 sm:flex dark:border-white/10 dark:bg-white/[0.04]">
                  <TrendingUp size={20} className="text-emerald-500" />

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      Total wealth
                    </p>

                    <p className="text-sm font-black text-slate-950 dark:text-white">
                      {isLoading ? "Loading..." : formattedWealth}
                    </p>
                  </div>
                </div>

                <div ref={userMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((current) => !current)}
                    aria-label="Open user menu"
                    aria-expanded={isUserMenuOpen}
                    className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full ring-2 ring-transparent transition hover:ring-blue-500"
                  >
                    {showGoogleAvatar ? (
                      <img
                        src={pictureUrl!}
                        alt={profileName}
                        referrerPolicy="no-referrer"
                        onError={() => {
                          console.error("Google avatar failed:", pictureUrl);

                          setAvatarFailed(true);
                        }}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-indigo-600 text-sm font-black text-white">
                        {initials || "NC"}
                      </span>
                    )}
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-14 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111827]">
                      <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-white/10">
                        {showGoogleAvatar ? (
                          <img
                            src={pictureUrl!}
                            alt={profileName}
                            referrerPolicy="no-referrer"
                            onError={() => {
                              console.error(
                                "Google avatar failed:",
                                pictureUrl,
                              );

                              setAvatarFailed(true);
                            }}
                            className="h-11 w-11 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-black text-white">
                            {initials || "NC"}
                          </span>
                        )}

                        <div className="min-w-0">
                          <p className="truncate font-black text-slate-950 dark:text-white">
                            {profileName}
                          </p>

                          <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                            {profileEmail}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsAccountSettingsOpen(true);
                          }}
                          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 dark:border-white/10 dark:text-slate-200 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                        >
                          <Settings size={17} />
                          Manage
                        </button>

                        <button
                          type="button"
                          onClick={signOut}
                          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:text-slate-200 dark:hover:bg-red-500/10"
                        >
                          <LogOut size={17} />
                          Sign out
                        </button>
                      </div>

                      <div className="border-t border-slate-200 p-2 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            navigate("/dashboard/accounts?open=true");
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-white/10">
                            <Plus size={17} />
                          </span>
                          Add account
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setTheme((current) =>
                              current === "dark" ? "light" : "dark",
                            )
                          }
                          className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
                        >
                          <span className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-white/10">
                              {theme === "dark" ? (
                                <Sun size={17} />
                              ) : (
                                <Moon size={17} />
                              )}
                            </span>
                            Appearance
                          </span>

                          <span className="text-xs text-slate-400">
                            {theme === "dark" ? "Dark" : "Light"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => void toggleFullscreen()}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-white/10">
                            {isFullscreen ? (
                              <Minimize2 size={17} />
                            ) : (
                              <Maximize2 size={17} />
                            )}
                          </span>

                          {isFullscreen ? "Exit full screen" : "Full screen"}
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-400 dark:border-white/10">
                        <ShieldCheck size={14} />
                        Secured by NexusCore
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile wealth */}
            <div className="border-t border-slate-200 px-4 py-3 sm:hidden dark:border-white/10">
              <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3 dark:bg-white/[0.04]">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                  <TrendingUp size={17} className="text-emerald-500" />
                  Total wealth
                </span>

                <span className="font-black text-slate-950 dark:text-white">
                  {isLoading ? "Loading..." : formattedWealth}
                </span>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">
            <Outlet context={outletContext} />
          </main>
        </div>
      </div>

      <CustomerKycGate onReady={refreshDashboard} onSignOut={signOut} />

      {incomingTransferAmount !== null && (
        <div className="fixed bottom-5 right-4 z-[160] w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-2xl border border-emerald-300 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.25)] sm:right-6 dark:border-emerald-400/20 dark:bg-[#0b1526]">
          <div className="flex items-start gap-4 p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
              <BellRing size={20} />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.17em] text-emerald-600 dark:text-emerald-400">
                    Real-time notification
                  </p>

                  <h3 className="mt-1 font-black text-slate-950 dark:text-white">
                    Money received
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIncomingTransferAmount(null)}
                  aria-label="Dismiss transfer notification"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="mt-2 text-xl font-black text-emerald-600 dark:text-emerald-400">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 2,
                }).format(incomingTransferAmount)}
              </p>

              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <CheckCircle2 size={13} className="text-emerald-500" />
                Your balance and account data were updated.
              </p>
            </div>
          </div>

          <div className="h-1 animate-[transfer-progress_5s_linear_forwards] bg-emerald-500" />
        </div>
      )}

      <AccountSettingsModal
        open={isAccountSettingsOpen}
        profile={profile}
        pictureUrl={pictureUrl}
        onClose={() => setIsAccountSettingsOpen(false)}
        onProfileUpdated={refreshDashboard}
        onSignOut={signOut}
      />
    </>
  );
}

function SidebarContent() {
  return (
    <>
      <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6 dark:border-white/10">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
          <Landmark size={23} />
        </span>

        <div>
          <p className="font-black text-slate-950 dark:text-white">NexusCore</p>

          <p className="text-xs text-slate-400">Customer Banking</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        <p className="px-3 pb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
          Banking
        </p>

        {enabledNavigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white",
                ].join(" ")
              }
            >
              <span className="flex items-center gap-3">
                <Icon size={19} />
                {item.label}
              </span>

              <ChevronRight size={17} />
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-5 text-center text-xs text-slate-400 dark:border-white/10">
        <ShieldCheck size={15} className="mx-auto mb-2" />
        Secured by NexusCore
      </div>
    </>
  );
}
