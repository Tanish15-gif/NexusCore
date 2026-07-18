import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import PublicFooter from "./PublicFooter";
import PublicNavbar from "./PublicNavbar";

export default function PublicLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors duration-300 dark:bg-[#050b14] dark:text-white">
      <PublicNavbar />

      <main className="pt-20">
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
}
