import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  Check,
  ChevronDown,
  CircleDollarSign,
  ImageOff,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Moon,
  PackageOpen,
  PenLine,
  Plus,
  RefreshCw,
  Search,
  Server,
  ShoppingBag,
  Store,
  Sun,
  Trash2,
  Truck,
  UploadCloud,
  X,
} from "lucide-react";

import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  getAuthToken,
  getRoleFromToken,
  removeAuthSession,
} from "../../services/authService";

import {
  createProduct,
  deleteProduct,
  getAdminProductById,
  getAdminProducts,
  updateProduct,
  uploadProductImage,
  type AdminProduct,
} from "../../services/adminProductService";

type AdminView = "inventory" | "orders";

type StockFilter = "all" | "available" | "low" | "out";

type Theme = "light" | "dark";

type EditorMode = "create" | "edit";

interface ProductEditorState {
  mode: EditorMode;
  product: AdminProduct | null;
}

interface ProductFormValues {
  name: string;
  category: string;
  price: string;
  stockQuantity: string;
  description: string;
  existingImageUrl: string;
}

const CATEGORY_OPTIONS = [
  "Electronics",
  "Gaming",
  "Groceries",
  "Software",
  "Clothing",
  "Home",
];

const THEME_STORAGE_KEY = "nexusmart-theme";

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

function getStockLabel(stockQuantity: number): {
  label: string;
  classes: string;
} {
  if (stockQuantity <= 0) {
    return {
      label: "Out of stock",
      classes:
        "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-400",
    };
  }

  if (stockQuantity <= 5) {
    return {
      label: `Low stock · ${stockQuantity}`,
      classes:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400",
    };
  }

  return {
    label: `${stockQuantity} available`,
    classes:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400",
  };
}

export default function AdminPage() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [activeView, setActiveView] = useState<AdminView>("inventory");

  const [products, setProducts] = useState<AdminProduct[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchValue, setSearchValue] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("All");

  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  const [editor, setEditor] = useState<ProductEditorState | null>(null);

  const [isLoadingEditor, setIsLoadingEditor] = useState(false);

  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const [editorError, setEditorError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);

  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const handleUnauthorized = useCallback(() => {
    removeAuthSession();

    navigate("/login?returnUrl=/admin", {
      replace: true,
    });
  }, [navigate]);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      navigate("/login?returnUrl=/admin", {
        replace: true,
      });

      return;
    }

    const role = getRoleFromToken(token)?.trim().toLowerCase();

    if (role !== "admin" && role !== "superadmin") {
      navigate("/profile", {
        replace: true,
      });
    }
  }, [navigate]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");

    document.documentElement.style.colorScheme = theme;

    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.title = "Admin Dashboard | NexusMart";
  }, []);

  const loadProducts = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getAdminProducts(signal);

        setProducts(response);
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
            : "Could not load inventory.";

        if (message === "UNAUTHORIZED") {
          handleUnauthorized();
          return;
        }

        setError(message);
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [handleUnauthorized],
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadProducts(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadProducts]);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(products.map((product) => product.category)),
      ).sort(),
    ],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch) ||
        String(product.id).includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === "All" || product.category === categoryFilter;

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "available" && product.stockQuantity > 5) ||
        (stockFilter === "low" &&
          product.stockQuantity > 0 &&
          product.stockQuantity <= 5) ||
        (stockFilter === "out" && product.stockQuantity <= 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [categoryFilter, products, searchValue, stockFilter]);

  const totalInventoryValue = useMemo(
    () =>
      products.reduce(
        (total, product) => total + product.price * product.stockQuantity,
        0,
      ),
    [products],
  );

  const lowStockCount = products.filter(
    (product) => product.stockQuantity > 0 && product.stockQuantity <= 5,
  ).length;

  const outOfStockCount = products.filter(
    (product) => product.stockQuantity <= 0,
  ).length;

  const showSuccess = (message: string) => {
    setSuccessMessage(message);

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3200);
  };

  const openCreateEditor = () => {
    setEditorError("");

    setEditor({
      mode: "create",
      product: null,
    });
  };

  const openEditEditor = async (productId: number) => {
    setEditorError("");
    setIsLoadingEditor(true);

    try {
      const product = await getAdminProductById(productId);

      setEditor({
        mode: "edit",
        product,
      });
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Could not load this product.";

      if (message === "UNAUTHORIZED") {
        handleUnauthorized();
        return;
      }

      setError(message);
    } finally {
      setIsLoadingEditor(false);
    }
  };

  const handleSaveProduct = async (
    values: ProductFormValues,
    imageFile: File | null,
  ) => {
    setEditorError("");

    const price = Number(values.price);

    const stockQuantity = Number(values.stockQuantity);

    if (!values.name.trim()) {
      setEditorError("Enter the product name.");

      return;
    }

    if (!values.category) {
      setEditorError("Select a product category.");

      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setEditorError("Enter a valid product price.");

      return;
    }

    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      setEditorError("Stock must be zero or a positive whole number.");

      return;
    }

    if (values.description.trim().length < 5) {
      setEditorError("Enter a useful product description.");

      return;
    }

    setIsSavingProduct(true);

    try {
      let imageUrl = values.existingImageUrl;

      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
      }

      if (editor?.mode === "create" && !imageUrl) {
        setEditorError("Select a product image.");

        return;
      }

      let message: string;

      if (editor?.mode === "edit" && editor.product) {
        message = await updateProduct({
          id: editor.product.id,
          name: values.name,
          category: values.category,
          price,
          stockQuantity,
          description: values.description,
          imageUrl,
        });
      } else {
        message = await createProduct({
          name: values.name,
          category: values.category,
          price,
          stockQuantity,
          description: values.description,
          imageUrl,
        });
      }

      setEditor(null);

      await loadProducts();

      showSuccess(message);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Could not save this product.";

      if (message === "UNAUTHORIZED") {
        handleUnauthorized();
        return;
      }

      setEditorError(message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeletingProduct(true);

    try {
      const message = await deleteProduct(deleteTarget.id);

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== deleteTarget.id),
      );

      setDeleteTarget(null);
      setEditor(null);

      showSuccess(message);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Could not delete this product.";

      if (message === "UNAUTHORIZED") {
        handleUnauthorized();
        return;
      }

      setEditorError(message);
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const handleSignOut = () => {
    removeAuthSession();

    navigate("/", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#050a13] dark:text-white">
      <div className="min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside
          className={[
            "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/10 bg-[#07101d] text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0",
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
            <Link to="/admin" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/25">
                <Server size={20} />
              </span>

              <span>
                <span className="block font-black">MartAdmin</span>

                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Operations console
                </span>
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-2 p-4">
            <button
              type="button"
              onClick={() => {
                setActiveView("inventory");

                setIsMobileSidebarOpen(false);
              }}
              className={[
                "flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-black transition",
                activeView === "inventory"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              ].join(" ")}
            >
              <Boxes size={19} />
              Inventory
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveView("orders");

                setIsMobileSidebarOpen(false);
              }}
              className={[
                "flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-black transition",
                activeView === "orders"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              ].join(" ")}
            >
              <Truck size={19} />
              Orders
            </button>
          </nav>

          <div className="mt-auto space-y-2 border-t border-white/10 p-4">
            <Link
              to="/"
              className="flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm font-black text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft size={18} />
              Back to store
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-black text-rose-400 transition hover:bg-rose-400/10"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </aside>

        {isMobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          />
        )}

        <main className="min-w-0">
          <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8 dark:border-white/10 dark:bg-[#07101d]/90">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 lg:hidden dark:border-white/10"
              >
                <Menu size={20} />
              </button>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
                  NexusMart administration
                </p>

                <h1 className="mt-1 text-lg font-black sm:text-xl">
                  {activeView === "inventory"
                    ? "Inventory management"
                    : "Order operations"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setTheme((currentTheme) =>
                    currentTheme === "dark" ? "light" : "dark",
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {activeView === "inventory" && (
                <button
                  type="button"
                  onClick={openCreateEditor}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
                >
                  <Plus size={17} />

                  <span className="hidden sm:inline">Add product</span>
                </button>
              )}
            </div>
          </header>

          <div className="p-4 sm:p-6 lg:p-8">
            {activeView === "inventory" ? (
              <>
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <AdminStatCard
                    icon={Boxes}
                    title="Total products"
                    value={String(products.length)}
                    description="Products in inventory"
                  />

                  <AdminStatCard
                    icon={AlertTriangle}
                    title="Low stock"
                    value={String(lowStockCount)}
                    description="Five items or fewer"
                    warning
                  />

                  <AdminStatCard
                    icon={PackageOpen}
                    title="Out of stock"
                    value={String(outOfStockCount)}
                    description="Require restocking"
                    danger
                  />

                  <AdminStatCard
                    icon={CircleDollarSign}
                    title="Inventory value"
                    value={formatCurrency(totalInventoryValue)}
                    description="Price × available stock"
                  />
                </section>

                <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1424]">
                  <div className="border-b border-slate-200 p-5 sm:p-6 dark:border-white/10">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
                          Product catalogue
                        </p>

                        <h2 className="mt-2 text-2xl font-black">Inventory</h2>

                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          Add, edit, restock and remove NexusMart products.
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <label className="relative sm:col-span-1">
                          <Search
                            size={17}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            value={searchValue}
                            onChange={(event) =>
                              setSearchValue(event.target.value)
                            }
                            placeholder="Search inventory"
                            className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.035]"
                          />
                        </label>

                        <select
                          value={categoryFilter}
                          onChange={(event) =>
                            setCategoryFilter(event.target.value)
                          }
                          className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-[#0b1424]"
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category === "All" ? "All categories" : category}
                            </option>
                          ))}
                        </select>

                        <select
                          value={stockFilter}
                          onChange={(event) =>
                            setStockFilter(event.target.value as StockFilter)
                          }
                          className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-[#0b1424]"
                        >
                          <option value="all">All stock</option>

                          <option value="available">Available</option>

                          <option value="low">Low stock</option>

                          <option value="out">Out of stock</option>
                        </select>
                      </div>
                    </div>

                    <p className="mt-5 text-xs font-bold text-slate-400">
                      Showing {filteredProducts.length} of {products.length}{" "}
                      products
                    </p>
                  </div>

                  {isLoading ? (
                    <div className="flex min-h-96 flex-col items-center justify-center">
                      <LoaderCircle
                        size={32}
                        className="animate-spin text-indigo-600"
                      />

                      <p className="mt-4 text-sm font-black text-slate-500">
                        Loading inventory...
                      </p>
                    </div>
                  ) : error ? (
                    <div className="flex min-h-96 flex-col items-center justify-center p-8 text-center">
                      <AlertTriangle size={38} className="text-rose-500" />

                      <h3 className="mt-4 text-lg font-black">
                        Inventory unavailable
                      </h3>

                      <p className="mt-2 max-w-md text-sm text-slate-500">
                        {error}
                      </p>

                      <button
                        type="button"
                        onClick={() => void loadProducts()}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white"
                      >
                        <RefreshCw size={17} />
                        Try again
                      </button>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="flex min-h-96 flex-col items-center justify-center p-8 text-center">
                      <PackageOpen
                        size={42}
                        className="text-slate-300 dark:text-slate-600"
                      />

                      <h3 className="mt-4 text-lg font-black">
                        No products found
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Change the filters or add a new product.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="hidden overflow-x-auto lg:block">
                        <table className="w-full">
                          <thead className="bg-slate-50 text-left dark:bg-white/[0.025]">
                            <tr>
                              {[
                                "Product",
                                "Category",
                                "Price",
                                "Stock",
                                "Value",
                                "Actions",
                              ].map((heading) => (
                                <th
                                  key={heading}
                                  className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.13em] text-slate-400"
                                >
                                  {heading}
                                </th>
                              ))}
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                            {filteredProducts.map((product) => (
                              <ProductTableRow
                                key={product.id}
                                product={product}
                                onEdit={() => void openEditEditor(product.id)}
                                onDelete={() => setDeleteTarget(product)}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="grid gap-4 p-4 lg:hidden">
                        {filteredProducts.map((product) => (
                          <ProductMobileCard
                            key={product.id}
                            product={product}
                            onEdit={() => void openEditEditor(product.id)}
                            onDelete={() => setDeleteTarget(product)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </section>
              </>
            ) : (
              <OrdersPlaceholder />
            )}
          </div>
        </main>
      </div>

      {isLoadingEditor && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-white/10 bg-[#0b1424] p-8 text-white shadow-2xl">
            <LoaderCircle
              size={30}
              className="mx-auto animate-spin text-indigo-400"
            />

            <p className="mt-4 text-sm font-black">Loading product...</p>
          </div>
        </div>
      )}

      {editor && (
        <ProductEditorModal
          key={`${editor.mode}-${editor.product?.id ?? "new"}`}
          editor={editor}
          error={editorError}
          isSaving={isSavingProduct}
          onClose={() => {
            if (!isSavingProduct) {
              setEditor(null);
            }
          }}
          onSave={handleSaveProduct}
          onDelete={
            editor.product ? () => setDeleteTarget(editor.product) : undefined
          }
        />
      )}

      {deleteTarget && (
        <DeleteProductModal
          product={deleteTarget}
          isDeleting={isDeletingProduct}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void handleDeleteProduct()}
        />
      )}

      {successMessage && (
        <div className="fixed bottom-5 right-4 z-[220] w-[calc(100%-2rem)] max-w-sm rounded-xl border border-emerald-200 bg-white p-4 shadow-2xl sm:right-6 dark:border-emerald-400/20 dark:bg-[#0b1424]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
              <Check size={18} />
            </span>

            <div>
              <p className="text-sm font-black">Inventory updated</p>

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

interface AdminStatCardProps {
  icon: typeof Boxes;
  title: string;
  value: string;
  description: string;
  warning?: boolean;
  danger?: boolean;
}

function AdminStatCard({
  icon: Icon,
  title,
  value,
  description,
  warning = false,
  danger = false,
}: AdminStatCardProps) {
  const iconClasses = danger
    ? "bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400"
    : warning
      ? "bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400"
      : "bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1424]">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClasses}`}
      >
        <Icon size={20} />
      </span>

      <p className="mt-5 text-xs font-black uppercase tracking-[0.13em] text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>

      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </article>
  );
}

function ProductTableRow({
  product,
  onEdit,
  onDelete,
}: {
  product: AdminProduct;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  const stock = getStockLabel(product.stockQuantity);

  return (
    <tr className="transition hover:bg-slate-50 dark:hover:bg-white/[0.02]">
      <td className="px-6 py-4">
        <div className="flex min-w-[260px] items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-2 dark:bg-white/[0.035]">
            {!imageFailed ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                onError={() => setImageFailed(true)}
                className="h-full w-full object-contain"
              />
            ) : (
              <ImageOff className="text-slate-300" />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black">{product.name}</p>

            <p className="mt-1 text-xs font-semibold text-slate-400">
              Product #{product.id}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <span className="rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-black text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300">
          {product.category}
        </span>
      </td>

      <td className="px-6 py-4 text-sm font-black">
        {formatCurrency(product.price)}
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-lg border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.09em] ${stock.classes}`}
        >
          {stock.label}
        </span>
      </td>

      <td className="px-6 py-4 text-sm font-black">
        {formatCurrency(product.price * product.stockQuantity)}
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:text-slate-300"
          >
            <PenLine size={15} />
            Edit
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-400/10"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function ProductMobileCard({
  product,
  onEdit,
  onDelete,
}: {
  product: AdminProduct;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  const stock = getStockLabel(product.stockQuantity);

  return (
    <article className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
      <div className="flex gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-2 dark:bg-white/[0.035]">
          {!imageFailed ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-contain"
            />
          ) : (
            <ImageOff className="text-slate-300" />
          )}
        </div>

        <div className="min-w-0">
          <p className="line-clamp-2 font-black">{product.name}</p>

          <p className="mt-1 text-xs font-semibold text-slate-400">
            #{product.id} · {product.category}
          </p>

          <p className="mt-2 text-lg font-black">
            {formatCurrency(product.price)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span
          className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-black uppercase ${stock.classes}`}
        >
          {stock.label}
        </span>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-black dark:border-white/10"
          >
            <PenLine size={15} />
            Edit
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-400/10"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

function OrdersPlaceholder() {
  return (
    <section className="flex min-h-[620px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-[#0b1424]">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
        <Truck size={30} />
      </span>

      <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
        Next administration slice
      </p>

      <h2 className="mt-3 text-2xl font-black">Order management</h2>

      <p className="mt-3 max-w-lg text-sm leading-7 text-slate-500 dark:text-slate-400">
        The inventory dashboard is complete. Order operations will be connected
        after reviewing the exact admin-order API endpoints.
      </p>
    </section>
  );
}

function ProductEditorModal({
  editor,
  error,
  isSaving,
  onClose,
  onSave,
  onDelete,
}: {
  editor: ProductEditorState;
  error: string;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: ProductFormValues, file: File | null) => void;
  onDelete?: () => void;
}) {
  const product = editor.product;

  const [values, setValues] = useState<ProductFormValues>({
    name: product?.name ?? "",
    category: product?.category ?? "",
    price: product?.price !== undefined ? String(product.price) : "",
    stockQuantity:
      product?.stockQuantity !== undefined ? String(product.stockQuantity) : "",
    description: product?.description ?? "",
    existingImageUrl: product?.rawImageUrl ?? "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState(product?.imageUrl ?? "");

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(product?.imageUrl ?? "");

      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);

    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [product?.imageUrl, selectedFile]);

  const updateField = (field: keyof ProductFormValues, value: string) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setSelectedFile(file);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSave(values, selectedFile);
  };

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1424]">
        <div className="flex items-start justify-between border-b border-slate-200 p-6 dark:border-white/10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
              {editor.mode === "create"
                ? "New catalogue item"
                : `Product #${product?.id}`}
            </p>

            <h2 className="mt-2 text-2xl font-black">
              {editor.mode === "create" ? "Add product" : "Edit product"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
            <div>
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.035]">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Product preview"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <ImageOff
                    size={42}
                    className="text-slate-300 dark:text-slate-600"
                  />
                )}
              </div>

              <label className="mt-4 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50 px-4 text-sm font-black text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-indigo-300">
                <UploadCloud size={18} />

                {selectedFile
                  ? "Change image"
                  : editor.mode === "create"
                    ? "Select image"
                    : "Replace image"}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSaving}
                  className="hidden"
                />
              </label>

              {selectedFile && (
                <p className="mt-2 break-all text-center text-xs font-semibold text-slate-400">
                  {selectedFile.name}
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <AdminInput
                label="Product name"
                value={values.name}
                placeholder="4K Gaming Monitor"
                disabled={isSaving}
                onChange={(value) => updateField("name", value)}
                className="sm:col-span-2"
              />

              <label className="block">
                <span className="text-sm font-black">Category</span>

                <div className="relative mt-2">
                  <select
                    value={values.category}
                    onChange={(event) =>
                      updateField("category", event.target.value)
                    }
                    disabled={isSaving}
                    className="min-h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm font-semibold outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.035]"
                  >
                    <option value="">Select category</option>

                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category === "Home" ? "Home & Kitchen" : category}
                      </option>
                    ))}

                    {values.category &&
                      !CATEGORY_OPTIONS.includes(values.category) && (
                        <option value={values.category}>
                          {values.category}
                        </option>
                      )}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </label>

              <AdminInput
                label="Price"
                type="number"
                value={values.price}
                placeholder="0.00"
                disabled={isSaving}
                min="0"
                step="0.01"
                onChange={(value) => updateField("price", value)}
              />

              <AdminInput
                label="Stock quantity"
                type="number"
                value={values.stockQuantity}
                placeholder="0"
                disabled={isSaving}
                min="0"
                step="1"
                onChange={(value) => updateField("stockQuantity", value)}
              />

              <label className="block sm:col-span-2">
                <span className="text-sm font-black">Description</span>

                <textarea
                  value={values.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  disabled={isSaving}
                  rows={5}
                  placeholder="Product details, features and important information..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold leading-6 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.035]"
                />
              </label>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-400">
              {error}
            </div>
          )}

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
            <div>
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={isSaving}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 text-sm font-black text-rose-600 transition hover:bg-rose-50 dark:border-rose-400/20 dark:text-rose-400 dark:hover:bg-rose-400/10"
                >
                  <Trash2 size={17} />
                  Delete product
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="min-h-11 rounded-xl border border-slate-300 px-5 text-sm font-black dark:border-white/10"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />

                    {editor.mode === "create" ? "Creating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Check size={17} />

                    {editor.mode === "create"
                      ? "Create product"
                      : "Save changes"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
  min,
  step,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  min?: string;
  step?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-black">{label}</span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        step={step}
        className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.035]"
      />
    </label>
  );
}

function DeleteProductModal({
  product,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  product: AdminProduct;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0b1424]">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400">
          <Trash2 size={21} />
        </span>

        <h2 className="mt-5 text-xl font-black">Delete this product?</h2>

        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          <strong>{product.name}</strong> will be permanently removed from the
          NexusMart catalogue.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="min-h-11 rounded-xl border border-slate-300 text-sm font-black dark:border-white/10"
          >
            Keep product
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 text-sm font-black text-white disabled:opacity-60"
          >
            {isDeleting ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Trash2 size={17} />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
