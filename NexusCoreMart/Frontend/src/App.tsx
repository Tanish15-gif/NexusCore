import { Navigate, Route, Routes } from "react-router-dom";

import CheckoutPage from "./Pages/checkout/CheckoutPage";
import OrderStatusPage from "./Pages/orders/OrderStatusPage";
import AuthPage from "./Pages/public/AuthPage";
import HomePage from "./Pages/public/HomePage";
import ProductDetailsPage from "./Pages/public/ProductDetailsPage";
import ProfilePage from "./Pages/profile/ProfilePage";
import AdminPage from "./Pages/admin/AdminPage";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-white/10 dark:bg-slate-900">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">
          NexusMart
        </p>

        <h1 className="mt-3 text-3xl font-black">{title}</h1>

        <p className="mt-3 text-slate-500">
          This feature will be migrated in the next vertical slice.
        </p>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/products/:productId" element={<ProductDetailsPage />} />

      <Route path="/checkout" element={<CheckoutPage />} />

      <Route path="/order-status" element={<OrderStatusPage />} />

      <Route path="/login" element={<AuthPage />} />

      <Route path="/register" element={<AuthPage />} />

      <Route path="/profile" element={<ProfilePage />} />

      <Route path="/admin" element={<AdminPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
