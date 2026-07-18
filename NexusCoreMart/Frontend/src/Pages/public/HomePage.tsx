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
  ShieldCheck,
  ShoppingBasket,
  SlidersHorizontal,
  Sparkles,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";

import MartNavbar from "../../Components/layout/MartNavbar";
import ProductCard from "../../Components/product/ProductCard";
import {
  products,
  type MartProduct,
  type ProductCategory,
} from "../../data/products";

type CategoryFilter = "All" | ProductCategory;

type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "newest";

const categories: {
  label: CategoryFilter;
  icon: typeof PackageSearch;
}[] = [
  { label: "All", icon: PackageSearch },
  { label: "Groceries", icon: ShoppingBasket },
  { label: "Electronics", icon: Laptop },
  { label: "Gaming", icon: Gamepad2 },
  { label: "Software", icon: Boxes },
];

function sortProducts(items: MartProduct[], sort: SortOption): MartProduct[] {
  const copy = [...items];

  switch (sort) {
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating-desc":
      return copy.sort((a, b) => b.rating - a.rating);
    case "newest":
      return copy.sort((a, b) => b.id - a.id);
    case "price-asc":
    default:
      return copy.sort((a, b) => a.price - b.price);
  }
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [sortOption, setSortOption] = useState<SortOption>("price-asc");
  const [searchValue, setSearchValue] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [lastAddedProduct, setLastAddedProduct] = useState<string | null>(null);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const categoryMatches =
        activeCategory === "All" || product.category === activeCategory;

      const searchMatches =
        normalizedSearch.length === 0 ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch);

      return categoryMatches && searchMatches;
    });

    return sortProducts(filtered, sortOption);
  }, [activeCategory, searchValue, sortOption]);

  const addToCart = (product: MartProduct) => {
    setCartCount((current) => current + 1);
    setLastAddedProduct(product.name);

    window.setTimeout(() => {
      setLastAddedProduct(null);
    }, 2600);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-[#050a13] dark:text-white">
      <MartNavbar
        cartCount={cartCount}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      <main>
        <section className="mart-grid-background relative overflow-hidden border-b border-slate-200 bg-white dark:border-white/10 dark:bg-[#07101d]">
          <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
            <div className="mart-fade-up">
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
                groceries and software—built around instant bank-verified
                checkout.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("mart-products")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
                >
                  Explore products
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-sm font-black text-slate-800 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:border-indigo-400/30 dark:hover:text-indigo-400"
                >
                  <ShieldCheck size={18} />
                  How bank payment works
                </button>
              </div>

              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
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
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white/75 p-4 backdrop-blur dark:border-white/10 dark:bg-white/[0.035]"
                    >
                      <Icon
                        size={19}
                        className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
                      />
                      <div>
                        <p className="text-sm font-black text-slate-950 dark:text-white">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mart-fade-up relative lg:pl-8">
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

                  <div className="mt-4 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">
                      NC
                    </span>

                    <div>
                      <p className="font-black text-slate-950 dark:text-white">
                        NexusCore Savings
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        Account ending •• 4821
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    ["Order total", "₹18,999"],
                    ["Bank discount", "− ₹1,500"],
                    ["Secure delivery", "Free"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between text-sm"
                    >
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
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-500"
                  >
                    Pay securely
                    <Check size={17} />
                  </button>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-2 hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl lg:flex lg:items-center lg:gap-3 dark:border-white/10 dark:bg-[#0b1424]">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <p className="text-xs font-black text-slate-950 dark:text-white">
                    Payment protected
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Verified by NexusCore Bank
                  </p>
                </div>
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

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                Products built for everyday life
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Search, filter and add products to your cart. The next slice
                will connect this grid to your real NexusMart product API.
              </p>
            </div>

            <label className="flex items-center gap-3">
              <SlidersHorizontal
                size={18}
                className="text-indigo-600 dark:text-indigo-400"
              />

              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Sort by
              </span>

              <select
                value={sortOption}
                onChange={(event) =>
                  setSortOption(event.target.value as SortOption)
                }
                className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-[#0b1424] dark:text-slate-200"
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
              const Icon = category.icon;
              const isActive = activeCategory === category.label;

              return (
                <button
                  key={category.label}
                  type="button"
                  onClick={() => setActiveCategory(category.label)}
                  className={[
                    "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-black transition",
                    isActive
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-[#0b1424] dark:text-slate-300 dark:hover:border-indigo-400/30 dark:hover:text-indigo-400",
                  ].join(" ")}
                >
                  <Icon size={17} />
                  {category.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="text-slate-950 dark:text-white">
                {visibleProducts.length}
              </span>{" "}
              products
            </p>

            {searchValue.trim() && (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="text-sm font-black text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Clear search
              </button>
            )}
          </div>

          {visibleProducts.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-white/15 dark:bg-[#0b1424]">
              <PackageSearch
                size={40}
                className="text-slate-300 dark:text-slate-600"
              />
              <h3 className="mt-4 text-lg font-black text-slate-950 dark:text-white">
                No matching products
              </h3>
              <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                Try another search term or switch to a different category.
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white dark:border-white/10 dark:bg-[#07101d]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <ShieldCheck size={20} />
            </span>
            <div>
              <p className="font-black text-slate-950 dark:text-white">
                NexusMart
              </p>
              <p className="text-xs text-slate-400">
                Secure commerce powered by NexusCore
              </p>
            </div>
          </div>

          <p className="text-sm font-medium text-slate-400">
            © 2026 NexusMart. Built for the NexusCore ecosystem.
          </p>
        </div>
      </footer>

      {lastAddedProduct && (
        <div className="fixed bottom-5 right-4 z-[100] w-[calc(100%-2rem)] max-w-sm rounded-xl border border-emerald-200 bg-white p-4 shadow-2xl sm:right-6 dark:border-emerald-400/20 dark:bg-[#0b1424]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
              <Check size={18} />
            </span>

            <div>
              <p className="text-sm font-black text-slate-950 dark:text-white">
                Added to cart
              </p>
              <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                {lastAddedProduct}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
