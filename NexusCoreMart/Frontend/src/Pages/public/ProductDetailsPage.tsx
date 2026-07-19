import {
  ArrowLeft,
  Check,
  ChevronRight,
  ImageOff,
  LoaderCircle,
  LockKeyhole,
  Minus,
  PackageCheck,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import MartNavbar from "../../Components/layout/MartNavbar";

import {
  addProductToCart,
  CART_UPDATED_EVENT,
  getCartCount,
} from "../../services/cartService";

import { getProductById } from "../../services/productService";

import type { Product } from "../../types/product";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const numericProductId = Number(productId);

  const [product, setProduct] = useState<Product | null>(null);

  const [quantity, setQuantity] = useState(1);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [imageFailed, setImageFailed] = useState(false);

  const [cartCount, setCartCount] = useState(getCartCount);

  const [searchValue, setSearchValue] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const loadProduct = useCallback(
    async (signal?: AbortSignal) => {
      if (!Number.isInteger(numericProductId) || numericProductId <= 0) {
        setError("Invalid product identifier.");

        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await getProductById(numericProductId, signal);

        setProduct(response);
        setQuantity(1);
        setImageFailed(false);
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load product.",
        );
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [numericProductId],
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadProduct(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadProduct]);

  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartCount());
    };

    window.addEventListener(CART_UPDATED_EVENT, updateCartCount);

    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, updateCartCount);

      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  const isOutOfStock = !product || product.stockQuantity <= 0;

  const canIncrease =
    Boolean(product) && quantity < (product?.stockQuantity ?? 0);

  const subtotal = useMemo(
    () => (product?.price ?? 0) * quantity,
    [product, quantity],
  );

  const addCurrentProduct = () => {
    if (!product) {
      return;
    }

    try {
      addProductToCart(product, quantity);

      setCartCount(getCartCount());

      setSuccessMessage(`${quantity} × ${product.name} added to cart.`);

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (cartError) {
      setError(
        cartError instanceof Error
          ? cartError.message
          : "Could not add product.",
      );
    }
  };

  const handleBuyNow = () => {
    if (!product) {
      return;
    }

    addCurrentProduct();
    navigate("/checkout");
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
        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-indigo-600">
            Home
          </Link>

          <ChevronRight size={14} />

          <span>{product?.category || "Products"}</span>

          <ChevronRight size={14} />

          <span className="max-w-xs truncate text-slate-900 dark:text-slate-200">
            {product?.name || "Product details"}
          </span>
        </nav>

        {isLoading ? (
          <div className="mt-8 flex min-h-[540px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0b1424]">
            <LoaderCircle size={34} className="animate-spin text-indigo-600" />

            <p className="mt-4 text-sm font-bold text-slate-500">
              Loading product details...
            </p>
          </div>
        ) : error || !product ? (
          <div className="mt-8 flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-400/20 dark:bg-rose-400/5">
            <PackageCheck size={42} className="text-rose-500" />

            <h1 className="mt-5 text-2xl font-black">Product unavailable</h1>

            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              {error}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => void loadProduct()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white"
              >
                <RefreshCw size={17} />
                Try again
              </button>

              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black dark:border-white/10 dark:bg-white/[0.04]"
              >
                <ArrowLeft size={17} />
                Back to store
              </Link>
            </div>
          </div>
        ) : (
          <>
            <section className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0b1424]">
                <div className="flex min-h-[420px] items-center justify-center bg-slate-50 p-8 sm:min-h-[560px] dark:bg-white/[0.025]">
                  {!imageFailed ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      onError={() => setImageFailed(true)}
                      className="max-h-[500px] w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <ImageOff size={48} />

                      <span className="text-xs font-black uppercase tracking-[0.16em]">
                        Image unavailable
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#0b1424]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                  {product.category}
                </p>

                <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  {product.name}
                </h1>

                {product.rating !== undefined && (
                  <div className="mt-4 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-sm font-black text-amber-600 dark:bg-amber-400/10">
                      <Star size={15} fill="currentColor" />

                      {product.rating.toFixed(1)}
                    </span>

                    {product.reviewCount !== undefined && (
                      <span className="text-sm font-semibold text-slate-400">
                        {product.reviewCount} reviews
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-6 border-b border-slate-200 pb-6 dark:border-white/10">
                  <p className="text-3xl font-black">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                <p className="mt-6 text-sm font-medium leading-7 text-slate-600 dark:text-slate-400">
                  {product.description}
                </p>

                <div
                  className={[
                    "mt-6 flex items-center gap-3 rounded-xl border p-4",
                    isOutOfStock
                      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10",
                  ].join(" ")}
                >
                  <Check size={19} />

                  <div>
                    <p className="text-sm font-black">
                      {isOutOfStock
                        ? "Out of stock"
                        : `In stock — ${product.stockQuantity} available`}
                    </p>
                  </div>
                </div>

                {!isOutOfStock && (
                  <div className="mt-7">
                    <p className="text-sm font-black">Quantity</p>

                    <div className="mt-3 flex items-center gap-4">
                      <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/[0.04]">
                        <button
                          type="button"
                          disabled={quantity <= 1}
                          onClick={() =>
                            setQuantity((current) => Math.max(1, current - 1))
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-lg disabled:opacity-40"
                        >
                          <Minus size={17} />
                        </button>

                        <span className="min-w-12 text-center text-sm font-black">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          disabled={!canIncrease}
                          onClick={() =>
                            setQuantity((current) =>
                              Math.min(product.stockQuantity, current + 1),
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-lg disabled:opacity-40"
                        >
                          <Plus size={17} />
                        </button>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-400">
                          Subtotal
                        </p>

                        <p className="text-lg font-black">
                          {formatCurrency(subtotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={addCurrentProduct}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white disabled:opacity-50"
                  >
                    <ShoppingCart size={18} />
                    Add to cart
                  </button>

                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleBuyNow}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <LockKeyhole size={18} />
                    Buy now
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  icon: ShieldCheck,
                  title: "1-year warranty",
                },
                {
                  icon: RotateCcw,
                  title: "7-day replacement",
                },
                {
                  icon: LockKeyhole,
                  title: "Secure transaction",
                },
                {
                  icon: Truck,
                  title: "Tracked delivery",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0b1424]"
                  >
                    <Icon className="text-indigo-600" />

                    <h2 className="mt-4 text-sm font-black">{item.title}</h2>
                  </article>
                );
              })}
            </section>
          </>
        )}
      </main>

      {successMessage && (
        <div className="fixed bottom-5 right-4 z-[100] max-w-sm rounded-xl border border-emerald-200 bg-white p-4 shadow-2xl dark:border-emerald-400/20 dark:bg-[#0b1424]">
          <p className="font-black">Added to cart</p>

          <p className="mt-1 text-xs text-slate-500">{successMessage}</p>
        </div>
      )}
    </div>
  );
}
