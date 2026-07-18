import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./Pages/public/HomePage";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
          NexusMart
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
          {title}
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          This route is ready for the next vertical slice.
        </p>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<PlaceholderPage title="Customer sign in" />} />
      <Route path="/profile" element={<PlaceholderPage title="Customer profile" />} />
      <Route path="/checkout" element={<PlaceholderPage title="Secure checkout" />} />
      <Route path="/products/:productId" element={<PlaceholderPage title="Product details" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
