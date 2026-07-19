import {
  ArrowRight,
  Check,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

import { Link, useNavigate, useSearchParams } from "react-router-dom";

import MartNavbar from "../../Components/layout/MartNavbar";
import { getCartCount } from "../../services/cartService";

export default function OrderStatusPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("orderId");

  const status = searchParams.get("status");

  const isSuccess = status === "success";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#050a13] dark:text-white">
      <MartNavbar
        cartCount={getCartCount()}
        searchValue=""
        onSearchChange={() => undefined}
        onSearchSubmit={(value) =>
          navigate(`/?search=${encodeURIComponent(value)}`)
        }
      />

      <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-3xl items-center justify-center px-4 py-16 sm:px-6">
        <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/5 dark:border-white/10 dark:bg-[#0b1424]">
          <div className="border-b border-slate-200 p-8 text-center sm:p-10 dark:border-white/10">
            <span
              className={[
                "mx-auto flex h-20 w-20 items-center justify-center rounded-2xl",
                isSuccess
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400",
              ].join(" ")}
            >
              {isSuccess ? <Check size={37} /> : <PackageCheck size={37} />}
            </span>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
              NexusMart order
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {isSuccess ? "Payment successful" : "Order status unavailable"}
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
              {isSuccess
                ? "Your payment was processed securely through NexusCore Bank and your NexusMart order has been created."
                : "We could not confirm the current state of this order."}
            </p>
          </div>

          {isSuccess && (
            <div className="p-8 sm:p-10">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.035]">
                  <ReceiptText
                    size={20}
                    className="text-indigo-600 dark:text-indigo-400"
                  />

                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.13em] text-slate-400">
                    Order number
                  </p>

                  <p className="mt-2 text-xl font-black">
                    #{orderId || "Pending"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.035]">
                  <ShieldCheck
                    size={20}
                    className="text-emerald-600 dark:text-emerald-400"
                  />

                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.13em] text-slate-400">
                    Payment method
                  </p>

                  <p className="mt-2 text-sm font-black">NexusCore Bank</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white transition hover:bg-indigo-500"
                >
                  Continue shopping
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/profile"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-black transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  View my orders
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
