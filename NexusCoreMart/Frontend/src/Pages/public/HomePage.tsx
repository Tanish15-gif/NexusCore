import {
  ArrowRight,
  BadgeIndianRupee,
  Boxes,
  Check,
  CreditCard,
  Gamepad2,
  Laptop,
  LockKeyhole,
  PackageSearch,
  RefreshCw,
  ShieldCheck,
  ShoppingBasket,
  SlidersHorizontal,
  Sparkles,
  Truck,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useSearchParams } from "react-router-dom";

import MartNavbar from "../../Components/layout/MartNavbar";
import ProductCard from "../../Components/product/ProductCard";

import {
  addProductToCart,
  CART_UPDATED_EVENT,
  getCartCount,
} from "../../services/cartService";

import { getAllProducts } from "../../services/productService";

import type { Product, ProductSortOption } from "../../types/product";

function getCategoryIcon(category: string) {
  const normalizedCategory = category.toLowerCase();

  if (normalizedCategory.includes("grocery")) {
    return ShoppingBasket;
  }

  if (normalizedCategory.includes("electronic")) {
    return Laptop;
  }

  if (normalizedCategory.includes("gaming")) {
    return Gamepad2;
  }

  if (normalizedCategory.includes("software")) {
    return Boxes;
  }

  return PackageSearch;
}

function sortProducts(
  products: Product[],
  sortOption: ProductSortOption,
): Product[] {
  const sortedProducts = [...products];

  switch (sortOption) {
    case "name-asc":
      return sortedProducts.sort((first, second) =>
        first.name.localeCompare(second.name),
      );

    case "name-desc":
      return sortedProducts.sort((first, second) =>
        second.name.localeCompare(first.name),
      );

    case "price-desc":
      return sortedProducts.sort((first, second) => second.price - first.price);

    case "rating-desc":
      return sortedProducts.sort(
        (first, second) => (second.rating ?? 0) - (first.rating ?? 0),
      );

    case "newest":
      return sortedProducts.sort((first, second) => second.id - first.id);

    case "price-asc":
    default:
      return sortedProducts.sort((first, second) => first.price - second.price);
  }
}

export default function HomePage() {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [activeCategory, setActiveCategory] = useState("All");

  const [sortOption, setSortOption] = useState<ProductSortOption>("price-asc");

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? "",
  );

  const [cartCount, setCartCount] = useState(getCartCount);

  const [lastAddedProduct, setLastAddedProduct] = useState<string | null>(null);

  useEffect(() => {
    setSearchValue(searchParams.get("search") ?? "");
  }, [searchParams]);

  const loadProducts = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getAllProducts(signal);

      setProducts(response);
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
          : "Could not load products.",
      );
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void loadProducts(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadProducts]);

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

  const categories = useMemo(() => {
    const productCategories = products
      .map((product) => product.category.trim())
      .filter(Boolean);

    return ["All", ...Array.from(new Set(productCategories)).sort()];
  }, [products]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    const filteredProducts = products.filter((product) => {
      const categoryMatches =
        activeCategory === "All" ||
        product.category.toLowerCase() === activeCategory.toLowerCase();

      const searchMatches =
        normalizedSearch.length === 0 ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch);

      return categoryMatches && searchMatches;
    });

    return sortProducts(filteredProducts, sortOption);
  }, [activeCategory, products, searchValue, sortOption]);

  const handleAddToCart = (product: Product) => {
    try {
      addProductToCart(product, 1);

      setCartCount(getCartCount());

      setLastAddedProduct(product.name);

      window.setTimeout(() => {
        setLastAddedProduct(null);
      }, 2600);
    } catch (cartError) {
      setError(
        cartError instanceof Error
          ? cartError.message
          : "Could not add product.",
      );
    }
  };

  const scrollToProducts = () => {
    document.getElementById("mart-products")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#050a13] dark:text-white">
      <MartNavbar
        cartCount={cartCount}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={scrollToProducts}
      />

      <main>
        <section className="mart-grid-background relative overflow-hidden border-b border-slate-200 bg-white dark:border-white/10 dark:bg-[#07101d]">
          <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-black uppercase tracking-[0.15em] text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300">
                <Sparkles size={15} />
                NexusCore cardholder sale
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
                Shop smarter.
                <span className="block text-indigo-600 dark:text-indigo-400">
                  Pay directly through NexusCore Bank.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-slate-600 sm:text-lg dark:text-slate-400">
                A secure connected marketplace for electronics, gaming,
                groceries and software.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={scrollToProducts}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
                >
                  Explore products
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-sm font-black text-slate-800 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                >
                  <ShieldCheck size={18} />
                  How bank payment works
                </button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: LockKeyhole,
                    title: "Bank verified",
                    text: "Secure account linking",
                  },
                  {
                    icon: BadgeIndianRupee,
                    title: "Instant debit",
                    text: "Real-time payment",
                  },
                  {
                    icon: Truck,
                    title: "Order protected",
                    text: "Track every purchase",
                  },
                ].map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.035]"
                    >
                      <Icon
                        size={19}
                        className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
                      />

                      <div>
                        <p className="text-sm font-black text-slate-950 dark:text-white">
                          {feature.title}
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                          {feature.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-indigo-950/10 dark:border-white/10 dark:bg-[#0b1424]">
              <div className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-white/10">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
                    NexusPay checkout
                  </p>

                  <h2 className="mt-2 text-xl font-black text-slate-950 dark:text-white">
                    Connected bank payment
                  </h2>
                </div>

                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
                  <CreditCard size={21} />
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Linked account
                  </span>

                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
                    Verified
                  </span>
                </div>

                <p className="mt-4 font-black text-slate-950 dark:text-white">
                  NexusCore Savings
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Account ending •• 4821
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  ["Order total", "₹18,999"],
                  ["Bank discount", "− ₹1,500"],
                  ["Secure delivery", "Free"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      {label}
                    </span>

                    <span className="font-black text-slate-950 dark:text-white">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5 dark:border-white/10">
                <div>
                  <p className="text-xs font-bold text-slate-400">
                    Amount payable
                  </p>

                  <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                    ₹17,499
                  </p>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white"
                >
                  Pay securely
                  <Check size={17} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          id="mart-products"
          className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
        >
          <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between dark:border-white/10">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                Curated marketplace
              </p>

              <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
                Products built for everyday life
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Live inventory from your ASP.NET Core API.
              </p>
            </div>

            <label className="flex items-center gap-3">
              <SlidersHorizontal size={18} className="text-indigo-600" />

              <span className="text-sm font-bold text-slate-500">Sort by</span>

              <select
                value={sortOption}
                onChange={(event) =>
                  setSortOption(event.target.value as ProductSortOption)
                }
                className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-[#0b1424]"
              >
                <option value="name-asc">Name (A–Z)</option>

                <option value="name-desc">Name (Z–A)</option>

                <option value="price-asc">Price: low to high</option>

                <option value="price-desc">Price: high to low</option>

                <option value="rating-desc">Highest rated</option>

                <option value="newest">Newest first</option>
              </select>
            </label>
          </div>

          <div className="mt-7 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category);

              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={[
                    "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-black transition",
                    isActive
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-[#0b1424] dark:text-slate-300",
                  ].join(" ")}
                >
                  <Icon size={17} />
                  {category}
                </button>
              );
            })}
          </div>

          <p className="mt-8 text-sm font-bold text-slate-500 dark:text-slate-400">
            Showing{" "}
            <span className="text-slate-950 dark:text-white">
              {visibleProducts.length}
            </span>{" "}
            products
          </p>

          {isLoading ? (
            <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0b1424]">
              <RefreshCw size={28} className="animate-spin text-indigo-600" />

              <p className="mt-4 text-sm font-bold text-slate-500">
                Loading latest inventory...
              </p>
            </div>
          ) : error ? (
            <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-400/20 dark:bg-rose-400/5">
              <PackageSearch size={38} className="text-rose-500" />

              <h3 className="mt-4 text-lg font-black">
                Could not load products
              </h3>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {error}
              </p>

              <button
                type="button"
                onClick={() => void loadProducts()}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white"
              >
                Try again
              </button>
            </div>
          ) : visibleProducts.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-white/15 dark:bg-[#0b1424]">
              <PackageSearch size={40} className="text-slate-300" />

              <h3 className="mt-4 text-lg font-black">No matching products</h3>
            </div>
          )}
        </section>
      </main>

      {lastAddedProduct && (
        <div className="fixed bottom-5 right-4 z-[100] w-[calc(100%-2rem)] max-w-sm rounded-xl border border-emerald-200 bg-white p-4 shadow-2xl sm:right-6 dark:border-emerald-400/20 dark:bg-[#0b1424]">
          <div className="flex items-center gap-3">
            <Check className="text-emerald-600" />

            <div>
              <p className="text-sm font-black">Added to cart</p>

              <p className="text-xs text-slate-500">{lastAddedProduct}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
