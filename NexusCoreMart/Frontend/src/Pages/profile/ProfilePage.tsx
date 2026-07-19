import {
  ArrowLeft,
  Banknote,
  Boxes,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CreditCard,
  ExternalLink,
  ImageOff,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Mail,
  PackageCheck,
  Plus,
  ReceiptText,
  RefreshCw,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link, useNavigate } from "react-router-dom";

import MartNavbar from "../../Components/layout/MartNavbar";

import { getCartCount } from "../../services/cartService";

import { removeAuthSession } from "../../services/authService";

import {
  disconnectBankAccount,
  getCurrentCustomer,
  getLinkedBanks,
  getMyOrders,
  getOrderDetails,
  linkBankAccount,
  type CustomerOrder,
  type CustomerOrderItem,
  type LinkedBankAccount,
  type MartCustomerProfile,
} from "../../services/profileService";

type ProfileTab = "overview" | "orders" | "wallet" | "settings";

const navigationItems: {
  id: ProfileTab;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "orders",
    label: "Order history",
    icon: Boxes,
  },
  {
    id: "wallet",
    label: "Payment wallet",
    icon: WalletCards,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateValue: string): string {
  if (!dateValue) {
    return "Date unavailable";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) {
    return "••••";
  }

  return `•••• ${accountNumber.slice(-4)}`;
}

function getStatusClasses(status: string): string {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "delivered" || normalizedStatus === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400";
  }

  if (
    normalizedStatus === "cancelled" ||
    normalizedStatus === "failed" ||
    normalizedStatus === "refunded"
  ) {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-400";
  }

  if (normalizedStatus === "shipped") {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-400";
  }

  return "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300";
}

export default function ProfilePage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  const [profile, setProfile] = useState<MartCustomerProfile | null>(null);

  const [banks, setBanks] = useState<LinkedBankAccount[]>([]);

  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [pageError, setPageError] = useState("");

  const [searchValue, setSearchValue] = useState("");

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  const [bankAccountNumber, setBankAccountNumber] = useState("");

  const [bankAccountName, setBankAccountName] = useState("");

  const [isLinkingBank, setIsLinkingBank] = useState(false);

  const [bankFormError, setBankFormError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [disconnectTarget, setDisconnectTarget] =
    useState<LinkedBankAccount | null>(null);

  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const [orderDetails, setOrderDetails] = useState<
    Record<number, CustomerOrderItem[]>
  >({});

  const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);

  const [orderDetailsErrors, setOrderDetailsErrors] = useState<
    Record<number, string>
  >({});

  const handleUnauthorized = useCallback(() => {
    removeAuthSession();

    navigate("/login?returnUrl=/profile", {
      replace: true,
    });
  }, [navigate]);

  const loadProfileDashboard = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setPageError("");

      const [profileResult, bankResult, orderResult] = await Promise.allSettled(
        [
          getCurrentCustomer(signal),
          getLinkedBanks(signal),
          getMyOrders(signal),
        ],
      );

      const results = [profileResult, bankResult, orderResult];

      const unauthorizedResult = results.find(
        (result) =>
          result.status === "rejected" &&
          result.reason instanceof Error &&
          result.reason.message === "UNAUTHORIZED",
      );

      if (unauthorizedResult) {
        handleUnauthorized();
        return;
      }

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value);
      }

      if (bankResult.status === "fulfilled") {
        setBanks(bankResult.value);
      }

      if (orderResult.status === "fulfilled") {
        setOrders(orderResult.value);
      }

      const firstFailure = results.find(
        (result) => result.status === "rejected",
      );

      if (firstFailure?.status === "rejected" && !signal?.aborted) {
        setPageError(
          firstFailure.reason instanceof Error
            ? firstFailure.reason.message
            : "Some account information could not be loaded.",
        );
      }

      if (!signal?.aborted) {
        setIsLoading(false);
      }
    },
    [handleUnauthorized],
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadProfileDashboard(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadProfileDashboard]);

  useEffect(() => {
    document.title = "My Account | NexusMart";
  }, []);

  const activeOrders = useMemo(
    () =>
      orders.filter((order) => {
        const status = order.status.toLowerCase();

        return ![
          "delivered",
          "completed",
          "cancelled",
          "failed",
          "refunded",
        ].includes(status);
      }).length,
    [orders],
  );

  const totalSpent = useMemo(
    () =>
      orders
        .filter((order) => {
          const status = order.status.toLowerCase();

          return !["cancelled", "failed"].includes(status);
        })
        .reduce((total, order) => total + order.totalAmount, 0),
    [orders],
  );

  const profileName = profile?.name || "NexusMart customer";

  const firstName = profileName.split(" ")[0];

  const initials = profileName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const showSuccess = (message: string) => {
    setSuccessMessage(message);

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);
  };

  const handleLinkBank = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setBankFormError("");

    const cleanAccountNumber = bankAccountNumber.trim();

    const cleanAccountName = bankAccountName.trim();

    if (cleanAccountNumber.length < 6) {
      setBankFormError("Enter a valid NexusCore account number.");

      return;
    }

    if (cleanAccountName.length < 2) {
      setBankFormError("Enter the account holder's full name.");

      return;
    }

    setIsLinkingBank(true);

    try {
      const message = await linkBankAccount({
        accountNumber: cleanAccountNumber,

        fullName: cleanAccountName,
      });

      const refreshedBanks = await getLinkedBanks();

      setBanks(refreshedBanks);

      setBankAccountNumber("");
      setBankAccountName("");
      setIsLinkModalOpen(false);

      showSuccess(message);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Could not link this account.";

      if (message === "UNAUTHORIZED") {
        handleUnauthorized();
        return;
      }

      setBankFormError(message);
    } finally {
      setIsLinkingBank(false);
    }
  };

  const handleDisconnectBank = async () => {
    if (!disconnectTarget) {
      return;
    }

    setIsDisconnecting(true);

    try {
      const message = await disconnectBankAccount(
        disconnectTarget.accountNumber,
      );

      setBanks((currentBanks) =>
        currentBanks.filter((bank) => bank.linkId !== disconnectTarget.linkId),
      );

      setDisconnectTarget(null);

      showSuccess(message);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Could not disconnect this account.";

      if (message === "UNAUTHORIZED") {
        handleUnauthorized();
        return;
      }

      setPageError(message);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const toggleOrderDetails = async (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);

    if (orderDetails[orderId]) {
      return;
    }

    setLoadingOrderId(orderId);

    setOrderDetailsErrors((current) => ({
      ...current,
      [orderId]: "",
    }));

    try {
      const details = await getOrderDetails(orderId);

      setOrderDetails((current) => ({
        ...current,
        [orderId]: details,
      }));
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Could not load the order receipt.";

      if (message === "UNAUTHORIZED") {
        handleUnauthorized();
        return;
      }

      setOrderDetailsErrors((current) => ({
        ...current,
        [orderId]: message,
      }));
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleSignOut = () => {
    removeAuthSession();

    navigate("/", {
      replace: true,
    });
  };

  const handleSearch = (value: string) => {
    navigate(`/?search=${encodeURIComponent(value.trim())}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050a13]">
        <MartNavbar
          cartCount={getCartCount()}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onSearchSubmit={handleSearch}
        />

        <div className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center">
          <LoaderCircle size={34} className="animate-spin text-indigo-600" />

          <p className="mt-4 text-sm font-black text-slate-500">
            Loading your NexusMart account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#050a13] dark:text-white">
      <MartNavbar
        cartCount={getCartCount()}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearch}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between dark:border-white/10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
              Customer account
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Welcome back, {firstName}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Manage your orders, connected bank accounts and NexusMart
              identity.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-800 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
          >
            <ArrowLeft size={17} />
            Return to shop
          </Link>
        </header>

        {pageError && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
            <CircleAlert size={20} className="mt-0.5 shrink-0" />

            <div className="flex-1">
              <p className="text-sm font-black">
                Some information could not be loaded
              </p>

              <p className="mt-1 text-xs font-medium">{pageError}</p>
            </div>

            <button
              type="button"
              onClick={() => void loadProfileDashboard()}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-black/5 dark:hover:bg-white/5"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        )}

        <div className="mt-8 grid items-start gap-7 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-28 dark:border-white/10 dark:bg-[#0b1424]">
            <div className="border-b border-slate-200 p-6 text-center dark:border-white/10">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-black text-white shadow-lg shadow-indigo-600/20">
                {initials || "NM"}
              </span>

              <h2 className="mt-4 truncate text-lg font-black">
                {profileName}
              </h2>

              <p className="mt-1 truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                {profile?.email}
              </p>

              <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300">
                <ShieldCheck size={14} />
                NexusCore member
              </span>
            </div>

            <nav className="grid grid-cols-2 gap-2 p-3 lg:block lg:space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;

                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={[
                      "flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-black transition lg:w-full",
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                        : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-indigo-400",
                    ].join(" ")}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleSignOut}
                className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-black text-rose-600 transition hover:bg-rose-50 lg:mt-5 lg:w-full dark:text-rose-400 dark:hover:bg-rose-400/10"
              >
                <LogOut size={18} />
                Sign out
              </button>
            </nav>
          </aside>

          <section className="min-w-0">
            {activeTab === "overview" && (
              <OverviewSection
                firstName={firstName}
                orders={orders}
                banks={banks}
                activeOrders={activeOrders}
                totalSpent={totalSpent}
                onOpenOrders={() => setActiveTab("orders")}
                onOpenWallet={() => setActiveTab("wallet")}
              />
            )}

            {activeTab === "orders" && (
              <OrdersSection
                orders={orders}
                expandedOrderId={expandedOrderId}
                orderDetails={orderDetails}
                loadingOrderId={loadingOrderId}
                orderDetailsErrors={orderDetailsErrors}
                onToggleDetails={toggleOrderDetails}
              />
            )}

            {activeTab === "wallet" && (
              <WalletSection
                banks={banks}
                onLinkAccount={() => {
                  setBankFormError("");
                  setBankAccountName(profileName);
                  setIsLinkModalOpen(true);
                }}
                onDisconnect={setDisconnectTarget}
              />
            )}

            {activeTab === "settings" && <SettingsSection profile={profile} />}
          </section>
        </div>
      </main>

      {isLinkModalOpen && (
        <LinkBankModal
          accountNumber={bankAccountNumber}
          accountName={bankAccountName}
          error={bankFormError}
          isSubmitting={isLinkingBank}
          onAccountNumberChange={setBankAccountNumber}
          onAccountNameChange={setBankAccountName}
          onClose={() => {
            if (!isLinkingBank) {
              setIsLinkModalOpen(false);
            }
          }}
          onSubmit={handleLinkBank}
        />
      )}

      {disconnectTarget && (
        <DisconnectBankModal
          bank={disconnectTarget}
          isSubmitting={isDisconnecting}
          onCancel={() => setDisconnectTarget(null)}
          onConfirm={() => void handleDisconnectBank()}
        />
      )}

      {successMessage && (
        <div className="fixed bottom-5 right-4 z-[200] w-[calc(100%-2rem)] max-w-sm rounded-xl border border-emerald-200 bg-white p-4 shadow-2xl sm:right-6 dark:border-emerald-400/20 dark:bg-[#0b1424]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
              <Check size={18} />
            </span>

            <div>
              <p className="text-sm font-black">Account updated</p>

              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface OverviewSectionProps {
  firstName: string;
  orders: CustomerOrder[];
  banks: LinkedBankAccount[];
  activeOrders: number;
  totalSpent: number;
  onOpenOrders: () => void;
  onOpenWallet: () => void;
}

function OverviewSection({
  firstName,
  orders,
  banks,
  activeOrders,
  totalSpent,
  onOpenOrders,
  onOpenWallet,
}: OverviewSectionProps) {
  return (
    <div className="space-y-7">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#0b1424]">
        <p className="text-xs font-black uppercase tracking-[0.17em] text-indigo-600 dark:text-indigo-400">
          Account overview
        </p>

        <h2 className="mt-3 text-2xl font-black">
          Good to see you, {firstName}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Here is the latest activity across your NexusMart account.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            icon={Truck}
            title="Active orders"
            value={String(activeOrders)}
            description="Pending, processing or shipped"
          />

          <StatCard
            icon={CreditCard}
            title="Linked accounts"
            value={String(banks.length)}
            description="Verified NexusCore accounts"
          />

          <StatCard
            icon={ReceiptText}
            title="Total purchases"
            value={formatCurrency(totalSpent)}
            description={`${orders.length} recorded orders`}
          />
        </div>
      </section>

      <div className="grid gap-7 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#0b1424]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">
                Recent orders
              </p>

              <h3 className="mt-2 text-xl font-black">Purchase activity</h3>
            </div>

            <button
              type="button"
              onClick={onOpenOrders}
              className="text-sm font-black text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              View all
            </button>
          </div>

          {orders.length === 0 ? (
            <EmptyMiniState
              icon={ShoppingBag}
              title="No orders yet"
              description="Your completed purchases will appear here."
            />
          ) : (
            <div className="mt-5 space-y-3">
              {orders.slice(0, 3).map((order) => (
                <div
                  key={order.orderId}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-white/10"
                >
                  <div>
                    <p className="text-sm font-black">Order #{order.orderId}</p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(order.orderDate)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black">
                      {formatCurrency(order.totalAmount)}
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-lg border px-2 py-1 text-[10px] font-black uppercase ${getStatusClasses(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#0b1424]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">
                Payment wallet
              </p>

              <h3 className="mt-2 text-xl font-black">NexusCore connection</h3>
            </div>

            <button
              type="button"
              onClick={onOpenWallet}
              className="text-sm font-black text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Manage
            </button>
          </div>

          {banks.length === 0 ? (
            <EmptyMiniState
              icon={Banknote}
              title="No linked account"
              description="Connect NexusCore Bank for secure checkout."
            />
          ) : (
            <div className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-400/20 dark:bg-indigo-400/10">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-black text-white">
                  NC
                </span>

                <div className="min-w-0">
                  <p className="truncate font-black">{banks[0].fullName}</p>

                  <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    NexusCore Bank {maskAccountNumber(banks[0].accountNumber)}
                  </p>
                </div>

                <Check className="ml-auto shrink-0 text-emerald-500" />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: typeof Truck;
  title: string;
  value: string;
  description: string;
}

function StatCard({ icon: Icon, title, value, description }: StatCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.035]">
      <Icon className="text-indigo-600 dark:text-indigo-400" />

      <p className="mt-5 text-xs font-black uppercase tracking-[0.13em] text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-2xl font-black">{value}</p>

      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </article>
  );
}

interface OrdersSectionProps {
  orders: CustomerOrder[];
  expandedOrderId: number | null;
  orderDetails: Record<number, CustomerOrderItem[]>;
  loadingOrderId: number | null;
  orderDetailsErrors: Record<number, string>;
  onToggleDetails: (orderId: number) => void;
}

function OrdersSection({
  orders,
  expandedOrderId,
  orderDetails,
  loadingOrderId,
  orderDetailsErrors,
  onToggleDetails,
}: OrdersSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#0b1424]">
      <p className="text-xs font-black uppercase tracking-[0.17em] text-indigo-600 dark:text-indigo-400">
        Purchase records
      </p>

      <h2 className="mt-3 text-2xl font-black">Order history</h2>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Review payment totals, delivery status and itemised receipts.
      </p>

      {orders.length === 0 ? (
        <div className="mt-7 flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 text-center dark:border-white/15">
          <ShoppingBag
            size={38}
            className="text-slate-300 dark:text-slate-600"
          />

          <h3 className="mt-4 text-lg font-black">No orders found</h3>

          <p className="mt-2 text-sm text-slate-500">
            Your NexusMart orders will appear here.
          </p>

          <Link
            to="/"
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-7 space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.orderId;

            return (
              <article
                key={order.orderId}
                className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10"
              >
                <button
                  type="button"
                  onClick={() => onToggleDetails(order.orderId)}
                  className="flex w-full items-center justify-between gap-5 p-5 text-left transition hover:bg-slate-50 dark:hover:bg-white/[0.025]"
                >
                  <div>
                    <p className="font-black">Order #{order.orderId}</p>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      {formatDate(order.orderDate)}
                    </p>
                  </div>

                  <div className="ml-auto text-right">
                    <p className="font-black">
                      {formatCurrency(order.totalAmount)}
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${getStatusClasses(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <ChevronDown
                    size={19}
                    className={[
                      "shrink-0 text-slate-400 transition-transform",
                      isExpanded ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.025]">
                    {loadingOrderId === order.orderId ? (
                      <div className="flex items-center justify-center gap-3 py-7">
                        <LoaderCircle
                          size={20}
                          className="animate-spin text-indigo-600"
                        />

                        <span className="text-sm font-bold text-slate-500">
                          Loading receipt...
                        </span>
                      </div>
                    ) : orderDetailsErrors[order.orderId] ? (
                      <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-400">
                        {orderDetailsErrors[order.orderId]}
                      </p>
                    ) : (
                      <OrderReceipt items={orderDetails[order.orderId] || []} />
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function OrderReceipt({ items }: { items: CustomerOrderItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-5 text-center text-sm font-medium text-slate-500">
        No receipt items were returned.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <ReceiptItem key={`${item.productName}-${index}`} item={item} />
      ))}
    </div>
  );
}

function ReceiptItem({ item }: { item: CustomerOrderItem }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#0b1424]">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-slate-50 p-2 dark:bg-white/[0.035]">
        {!imageFailed ? (
          <img
            src={item.imageUrl}
            alt={item.productName}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-contain"
          />
        ) : (
          <ImageOff className="text-slate-300" />
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-black">{item.productName}</p>

        <p className="mt-1 text-xs font-medium text-slate-500">
          Quantity {item.quantity} × {formatCurrency(item.unitPrice)}
        </p>
      </div>

      <p className="text-sm font-black">{formatCurrency(item.subtotal)}</p>
    </div>
  );
}

interface WalletSectionProps {
  banks: LinkedBankAccount[];
  onLinkAccount: () => void;
  onDisconnect: (bank: LinkedBankAccount) => void;
}

function WalletSection({
  banks,
  onLinkAccount,
  onDisconnect,
}: WalletSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#0b1424]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.17em] text-indigo-600 dark:text-indigo-400">
            Connected payments
          </p>

          <h2 className="mt-3 text-2xl font-black">Payment wallet</h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Manage the NexusCore Bank accounts available during checkout.
          </p>
        </div>

        <button
          type="button"
          onClick={onLinkAccount}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
        >
          <Plus size={17} />
          Link account
        </button>
      </div>

      <div className="mt-7 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-400/20 dark:bg-indigo-400/10">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400" />

          <div>
            <p className="text-sm font-black">Secure account verification</p>

            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
              NexusMart stores only the verified link reference. Your bank
              credentials remain with NexusCore Bank.
            </p>
          </div>
        </div>
      </div>

      {banks.length === 0 ? (
        <div className="mt-7 flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-white/15">
          <Banknote size={40} className="text-slate-300 dark:text-slate-600" />

          <h3 className="mt-4 text-lg font-black">No linked bank account</h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Link NexusCore Bank to unlock secure one-click checkout.
          </p>

          <button
            type="button"
            onClick={onLinkAccount}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white"
          >
            Link NexusCore Bank
          </button>
        </div>
      ) : (
        <div className="mt-7 grid gap-4 xl:grid-cols-2">
          {banks.map((bank) => (
            <article
              key={bank.linkId}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.035]"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-black text-white">
                  NC
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-black">{bank.fullName}</p>

                  <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    NexusCore Bank {maskAccountNumber(bank.accountNumber)}
                  </p>

                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
                    <Check size={12} />
                    Verified
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onDisconnect(bank)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-400/10"
                  aria-label="Disconnect account"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function SettingsSection({ profile }: { profile: MartCustomerProfile | null }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#0b1424]">
      <p className="text-xs font-black uppercase tracking-[0.17em] text-indigo-600 dark:text-indigo-400">
        Personal information
      </p>

      <h2 className="mt-3 text-2xl font-black">Account settings</h2>

      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        Review the identity attached to your NexusMart account.
      </p>

      <div className="mt-7 grid gap-5">
        <ReadOnlyField
          icon={UserRound}
          label="Full name"
          value={profile?.name || "Unavailable"}
        />

        <ReadOnlyField
          icon={Mail}
          label="Email address"
          value={profile?.email || "Unavailable"}
        />
      </div>

      <div className="mt-7 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.035]">
        <ShieldCheck className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400" />

        <div>
          <p className="text-sm font-black">Identity-protected fields</p>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Name and email changes require additional verification to protect
            your purchases and bank links.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-800 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
      >
        <ExternalLink size={17} />
        Request identity change
      </button>
    </section>
  );
}

function ReadOnlyField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <label>
      <span className="text-sm font-black text-slate-700 dark:text-slate-200">
        {label}
      </span>

      <div className="relative mt-2">
        <Icon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          value={value}
          readOnly
          className="min-h-13 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-semibold text-slate-600 outline-none dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300"
        />
      </div>
    </label>
  );
}

function EmptyMiniState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ShoppingBag;
  title: string;
  description: string;
}) {
  return (
    <div className="mt-5 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 text-center dark:border-white/15">
      <Icon className="text-slate-300 dark:text-slate-600" />

      <p className="mt-3 text-sm font-black">{title}</p>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

interface LinkBankModalProps {
  accountNumber: string;
  accountName: string;
  error: string;
  isSubmitting: boolean;
  onAccountNumberChange: (value: string) => void;
  onAccountNameChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function LinkBankModal({
  accountNumber,
  accountName,
  error,
  isSubmitting,
  onAccountNumberChange,
  onAccountNameChange,
  onClose,
  onSubmit,
}: LinkBankModalProps) {
  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1424]">
        <div className="flex items-start justify-between border-b border-slate-200 p-6 dark:border-white/10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
              Secure verification
            </p>

            <h2 className="mt-2 text-2xl font-black">Link NexusCore Bank</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            Enter the account number and holder name exactly as they appear in
            NexusCore Bank.
          </p>

          <label className="mt-6 block">
            <span className="text-sm font-black">Account number</span>

            <div className="relative mt-2">
              <CreditCard
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={(event) =>
                  onAccountNumberChange(event.target.value.replace(/\D/g, ""))
                }
                disabled={isSubmitting}
                placeholder="Enter NexusCore account number"
                className="min-h-13 w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.035]"
              />
            </div>
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-black">Account holder name</span>

            <div className="relative mt-2">
              <UserRound
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={accountName}
                onChange={(event) => onAccountNameChange(event.target.value)}
                disabled={isSubmitting}
                placeholder="Full legal name"
                className="min-h-13 w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.035]"
              />
            </div>
          </label>

          {error && (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-400">
              {error}
            </div>
          )}

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-12 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black dark:border-white/10 dark:bg-white/[0.04]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck size={17} />
                  Verify and link
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DisconnectBankModal({
  bank,
  isSubmitting,
  onCancel,
  onConfirm,
}: {
  bank: LinkedBankAccount;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0b1424]">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400">
          <Trash2 size={21} />
        </span>

        <h2 className="mt-5 text-xl font-black">Disconnect bank account?</h2>

        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          The NexusCore account ending in{" "}
          <strong>{bank.accountNumber.slice(-4)}</strong> will no longer be
          available for NexusMart checkout.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="min-h-11 rounded-xl border border-slate-300 text-sm font-black dark:border-white/10"
          >
            Keep account
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 text-sm font-black text-white disabled:opacity-60"
          >
            {isSubmitting ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Trash2 size={17} />
            )}
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
