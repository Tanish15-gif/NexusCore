import { ArrowRight, ImageOff, ShoppingCart, Star } from "lucide-react";

import { useState } from "react";
import { Link } from "react-router-dom";

import type { Product } from "../../types/product";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/5 dark:border-white/10 dark:bg-[#0b1424] dark:hover:border-indigo-400/30">
      <Link
        to={`/products/${product.id}`}
        className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-slate-100 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/[0.03]"
      >
        <span className="absolute left-4 top-4 z-10 rounded-lg bg-indigo-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.13em] text-white">
          {product.category}
        </span>

        {!imageFailed ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-300 dark:text-slate-600">
            <ImageOff size={38} />

            <span className="text-xs font-bold uppercase tracking-[0.14em]">
              Product image
            </span>
          </div>
        )}
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
              {product.category}
            </p>

            <Link
              to={`/products/${product.id}`}
              className="mt-2 block min-h-12 text-base font-black leading-6 text-slate-950 transition hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
            >
              {product.name}
            </Link>
          </div>

          <ArrowRight
            size={18}
            className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500"
          />
        </div>

        {product.rating !== undefined && (
          <div className="mt-4 flex items-center gap-2">
            <span className="flex items-center gap-1 text-sm font-black text-amber-500">
              <Star size={15} fill="currentColor" />

              {product.rating.toFixed(1)}
            </span>

            {product.reviewCount !== undefined && (
              <span className="text-xs font-medium text-slate-400">
                ({product.reviewCount} reviews)
              </span>
            )}
          </div>
        )}

        <div className="mt-5 flex items-end justify-between gap-4">
          <p className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
            {formatCurrency(product.price)}
          </p>

          <span
            className={[
              "rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]",
              isOutOfStock
                ? "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-400"
                : "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400",
            ].join(" ")}
          >
            {isOutOfStock
              ? "Out of stock"
              : `${product.stockQuantity} available`}
          </span>
        </div>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={() => onAddToCart(product)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-400"
        >
          <ShoppingCart size={17} />

          {isOutOfStock ? "Unavailable" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
