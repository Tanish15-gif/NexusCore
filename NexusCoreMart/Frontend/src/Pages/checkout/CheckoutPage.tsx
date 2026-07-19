import {
  ArrowLeft,
  Banknote,
  Check,
  ChevronDown,
  CreditCard,
  ImageOff,
  LoaderCircle,
  LockKeyhole,
  Minus,
  PackageCheck,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Truck,
  UserRound,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import MartNavbar from "../../Components/layout/MartNavbar";

import {
  CART_UPDATED_EVENT,
  clearCart,
  getCartCount,
  getCartItems,
  removeProductFromCart,
  updateCartQuantity,
  type CartItem,
} from "../../services/cartService";

import {
  getLinkedBankAccounts,
  placeOrder,
  type LinkedBankAccount,
} from "../../services/checkoutService";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) {
    return "Account unavailable";
  }

  const lastFour = accountNumber.slice(-4);

  return `•••• ${lastFour}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();

  const token = localStorage.getItem("nexusmart_token");

  const [cartItems, setCartItems] = useState<CartItem[]>(getCartItems);

  const [cartCount, setCartCount] = useState(getCartCount);

  const [linkedBankAccounts, setLinkedBankAccounts] = useState<
    LinkedBankAccount[]
  >([]);

  const [selectedLinkId, setSelectedLinkId] = useState("");

  const [isLoadingBanks, setIsLoadingBanks] = useState(Boolean(token));

  const [bankLoadError, setBankLoadError] = useState("");

  const [paymentError, setPaymentError] = useState("");

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const updateCartState = useCallback(() => {
    const currentItems = getCartItems();

    setCartItems(currentItems);

    setCartCount(getCartCount(currentItems));
  }, []);

  const loadBankAccounts = useCallback(
    async (signal?: AbortSignal) => {
      if (!token) {
        setIsLoadingBanks(false);
        return;
      }

      setIsLoadingBanks(true);
      setBankLoadError("");

      try {
        const accounts = await getLinkedBankAccounts(signal);

        setLinkedBankAccounts(accounts);

        if (accounts.length > 0) {
          setSelectedLinkId(String(accounts[0].linkId));
        }
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        const message =
          requestError instanceof Error
            ? requestError.message
            : "Could not load payment methods.";

        if (message === "UNAUTHORIZED") {
          setBankLoadError("Your session has expired. Please sign in again.");

          return;
        }

        setBankLoadError(message);
      } finally {
        if (!signal?.aborted) {
          setIsLoadingBanks(false);
        }
      }
    },
    [token],
  );

  useEffect(() => {
    const handleCartUpdate = () => {
      updateCartState();
    };

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdate);

    window.addEventListener("storage", handleCartUpdate);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdate);

      window.removeEventListener("storage", handleCartUpdate);
    };
  }, [updateCartState]);

  useEffect(() => {
    const controller = new AbortController();

    void loadBankAccounts(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadBankAccounts]);

  const subtotal = useMemo(
    () =>
      cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );

  const gstRate = 0.18;

  const taxes = useMemo(() => subtotal * gstRate, [subtotal]);

  const shipping = 0;

  const grandTotal = subtotal + taxes + shipping;

  const selectedBank = linkedBankAccounts.find(
    (bank) => String(bank.linkId) === selectedLinkId,
  );

  const handleRemoveItem = (productId: number) => {
    const updatedItems = removeProductFromCart(productId);

    setCartItems(updatedItems);

    setCartCount(getCartCount(updatedItems));
  };

  const handleQuantityChange = (item: CartItem, quantity: number) => {
    const updatedItems = updateCartQuantity(item.productId, quantity);

    setCartItems(updatedItems);

    setCartCount(getCartCount(updatedItems));
  };

  const handlePayment = async () => {
    setPaymentError("");

    if (!token) {
      navigate("/login?returnUrl=/checkout");

      return;
    }

    if (cartItems.length === 0) {
      setPaymentError("Your cart is empty.");

      return;
    }

    const linkId = Number(selectedLinkId);

    if (!Number.isInteger(linkId) || linkId <= 0) {
      setPaymentError("Select a valid linked NexusCore Bank account.");

      return;
    }

    setIsProcessingPayment(true);

    try {
      const result = await placeOrder({
        linkId,

        items: cartItems.map((item) => ({
          productId: item.productId,

          quantity: item.quantity,
        })),
      });

      clearCart();

      setCartItems([]);
      setCartCount(0);

      navigate(`/order-status?orderId=${result.orderId}&status=success`, {
        replace: true,
      });
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Payment failed. Please try again.";

      if (message === "UNAUTHORIZED") {
        navigate("/login?returnUrl=/checkout");

        return;
      }

      setPaymentError(message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSearch = (value: string) => {
    navigate(`/?search=${encodeURIComponent(value.trim())}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#050a13] dark:text-white">
      <MartNavbar
        cartCount={cartCount}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearch}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between dark:border-white/10">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-black text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
            >
              <ArrowLeft size={17} />
              Continue shopping
            </Link>

            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Secure checkout
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Review your order and pay securely using a linked NexusCore Bank
              account.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400">
            <ShieldCheck size={19} />

            <div>
              <p className="text-xs font-black uppercase tracking-[0.13em]">
                Protected checkout
              </p>

              <p className="mt-0.5 text-xs font-semibold opacity-80">
                Secured by NexusCore
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <section>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.17em] text-indigo-600 dark:text-indigo-400">
                  Cart review
                </p>

                <h2 className="mt-2 text-2xl font-black">Your items</h2>
              </div>

              <span className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-black text-slate-700 dark:bg-white/10 dark:text-slate-300">
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </span>
            </div>

            {cartItems.length === 0 ? (
              <div className="mt-6 flex min-h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-white/15 dark:bg-[#0b1424]">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
                  <ShoppingCart size={30} />
                </span>

                <h3 className="mt-5 text-xl font-black">Your cart is empty</h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Add products from NexusMart before continuing to payment.
                </p>

                <Link
                  to="/"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-500"
                >
                  <ShoppingBag size={17} />
                  Browse products
                </Link>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {cartItems.map((item) => (
                  <CartItemRow
                    key={item.productId}
                    item={item}
                    onRemove={() => handleRemoveItem(item.productId)}
                    onQuantityChange={(quantity) =>
                      handleQuantityChange(item, quantity)
                    }
                  />
                ))}
              </div>
            )}

            {cartItems.length > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    clearCart();
                    setCartItems([]);
                    setCartCount(0);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-400/10"
                >
                  <Trash2 size={17} />
                  Clear cart
                </button>
              </div>
            )}
          </section>

          <aside className="lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/5 dark:border-white/10 dark:bg-[#0b1424]">
              <div className="border-b border-slate-200 p-6 dark:border-white/10">
                <p className="text-xs font-black uppercase tracking-[0.17em] text-indigo-600 dark:text-indigo-400">
                  Payment summary
                </p>

                <h2 className="mt-2 text-2xl font-black">Order summary</h2>
              </div>

              <div className="space-y-4 p-6">
                <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />

                <SummaryRow label="GST (18%)" value={formatCurrency(taxes)} />

                <SummaryRow
                  label="Shipping"
                  value="FREE"
                  valueClassName="text-emerald-600 dark:text-emerald-400"
                />

                <div className="border-t border-slate-200 pt-5 dark:border-white/10">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        Total payable
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-400">
                        Including all taxes
                      </p>
                    </div>

                    <p className="text-2xl font-black tracking-tight">
                      {formatCurrency(grandTotal)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/[0.025]">
                {!token ? (
                  <AuthenticationRequired />
                ) : isLoadingBanks ? (
                  <div className="flex min-h-52 flex-col items-center justify-center text-center">
                    <LoaderCircle
                      size={29}
                      className="animate-spin text-indigo-600 dark:text-indigo-400"
                    />

                    <p className="mt-4 text-sm font-black">
                      Loading linked accounts
                    </p>

                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Connecting securely to NexusCore Bank.
                    </p>
                  </div>
                ) : bankLoadError ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-center dark:border-rose-400/20 dark:bg-rose-400/10">
                    <RefreshCw
                      size={24}
                      className="mx-auto text-rose-600 dark:text-rose-400"
                    />

                    <p className="mt-3 text-sm font-black">
                      Payment methods unavailable
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
                      {bankLoadError}
                    </p>

                    <button
                      type="button"
                      onClick={() => void loadBankAccounts()}
                      className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white"
                    >
                      Try again
                    </button>
                  </div>
                ) : linkedBankAccounts.length === 0 ? (
                  <NoLinkedBank />
                ) : (
                  <>
                    <div className="flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-400/20 dark:bg-indigo-400/10">
                      <Banknote
                        size={20}
                        className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
                      />

                      <div>
                        <p className="text-sm font-black">NexusCore payment</p>

                        <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                          Funds will be debited securely from your selected
                          linked account.
                        </p>
                      </div>
                    </div>

                    <label className="mt-5 block">
                      <span className="text-xs font-black uppercase tracking-[0.13em] text-slate-500 dark:text-slate-400">
                        Payment account
                      </span>

                      <div className="relative mt-2">
                        <CreditCard
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400"
                        />

                        <select
                          value={selectedLinkId}
                          onChange={(event) =>
                            setSelectedLinkId(event.target.value)
                          }
                          className="min-h-14 w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-11 text-sm font-black text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-[#0b1424] dark:text-white"
                        >
                          {linkedBankAccounts.map((bank) => (
                            <option key={bank.linkId} value={bank.linkId}>
                              {bank.fullName} (
                              {maskAccountNumber(bank.accountNumber)})
                            </option>
                          ))}
                        </select>

                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                      </div>
                    </label>

                    {selectedBank && (
                      <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0b1424]">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xs font-black text-white">
                          NC
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black">
                            {selectedBank.fullName}
                          </p>

                          <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            NexusCore Bank{" "}
                            {maskAccountNumber(selectedBank.accountNumber)}
                          </p>
                        </div>

                        <Check
                          size={18}
                          className="ml-auto shrink-0 text-emerald-500"
                        />
                      </div>
                    )}

                    {paymentError && (
                      <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-400">
                        {paymentError}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => void handlePayment()}
                      disabled={
                        isProcessingPayment ||
                        cartItems.length === 0 ||
                        !selectedLinkId
                      }
                      className="mt-5 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isProcessingPayment ? (
                        <>
                          <LoaderCircle size={18} className="animate-spin" />
                          Processing payment...
                        </>
                      ) : (
                        <>
                          <LockKeyhole size={18} />
                          Pay {formatCurrency(grandTotal)}
                        </>
                      )}
                    </button>

                    <p className="mt-3 flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-slate-400">
                      <ShieldCheck size={14} />
                      Bank credentials are never shared with NexusMart
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <CheckoutTrustCard
                icon={Truck}
                title="Free shipping"
                description="On this order"
              />

              <CheckoutTrustCard
                icon={PackageCheck}
                title="Order tracking"
                description="After payment"
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

interface CartItemRowProps {
  item: CartItem;
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
}

function CartItemRow({ item, onRemove, onQuantityChange }: CartItemRowProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const itemTotal = item.price * item.quantity;

  const maximumQuantity = item.stockQuantity > 0 ? item.stockQuantity : 99;

  return (
    <article className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:items-center sm:p-5 dark:border-white/10 dark:bg-[#0b1424]">
      <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-3 dark:bg-white/[0.035]">
        {!imageFailed ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-contain"
          />
        ) : (
          <ImageOff size={30} className="text-slate-300 dark:text-slate-600" />
        )}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">
          NexusMart product
        </p>

        <h3 className="mt-2 line-clamp-2 text-base font-black">{item.name}</h3>

        <p className="mt-2 text-sm font-black text-slate-700 dark:text-slate-300">
          {formatCurrency(item.price)}
          <span className="ml-1 font-medium text-slate-400">each</span>
        </p>

        <div className="mt-4 inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/[0.035]">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, item.quantity - 1))}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-indigo-600 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <Minus size={16} />
          </button>

          <span className="min-w-11 text-center text-sm font-black">
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={() =>
              onQuantityChange(Math.min(maximumQuantity, item.quantity + 1))
            }
            disabled={item.quantity >= maximumQuantity}
            aria-label="Increase quantity"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-indigo-600 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-5 border-t border-slate-200 pt-4 sm:block sm:border-0 sm:pt-0 sm:text-right dark:border-white/10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            Item total
          </p>

          <p className="mt-1 text-lg font-black">{formatCurrency(itemTotal)}</p>
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.name}`}
          className="mt-0 inline-flex h-10 w-10 items-center justify-center rounded-xl text-rose-500 transition hover:bg-rose-50 sm:mt-5 dark:hover:bg-rose-400/10"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </article>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
  valueClassName?: string;
}

function SummaryRow({ label, value, valueClassName = "" }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <span className={`font-black ${valueClassName}`}>{value}</span>
    </div>
  );
}

function AuthenticationRequired() {
  return (
    <div className="text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400">
        <UserRound size={25} />
      </span>

      <h3 className="mt-4 text-lg font-black">Sign in required</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        Sign in to access your linked NexusCore Bank accounts and complete
        payment.
      </p>

      <Link
        to="/login?returnUrl=/checkout"
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white transition hover:bg-indigo-500"
      >
        <LockKeyhole size={17} />
        Sign in to continue
      </Link>
    </div>
  );
}

function NoLinkedBank() {
  return (
    <div className="text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
        <CreditCard size={25} />
      </span>

      <h3 className="mt-4 text-lg font-black">No linked account</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        Link a NexusCore Bank account from your NexusMart profile before
        completing payment.
      </p>

      <Link
        to="/profile"
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-black text-white transition hover:bg-indigo-500"
      >
        Link bank account
      </Link>
    </div>
  );
}

interface CheckoutTrustCardProps {
  icon: typeof Truck;
  title: string;
  description: string;
}

function CheckoutTrustCard({
  icon: Icon,
  title,
  description,
}: CheckoutTrustCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0b1424]">
      <Icon size={18} className="text-indigo-600 dark:text-indigo-400" />

      <p className="mt-3 text-xs font-black">{title}</p>

      <p className="mt-1 text-[11px] font-medium text-slate-400">
        {description}
      </p>
    </div>
  );
}
