import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";

import CompleteKycModal from "./CompleteKycModal";
import { checkCustomerKycStatus } from "../../services/customerService";

interface CustomerKycGateProps {
  onReady: () => Promise<void> | void;
  onSignOut: () => Promise<void> | void;
}

export default function CustomerKycGate({
  onReady,
  onSignOut,
}: CustomerKycGateProps) {
  const hasStartedRef = useRef(false);

  const [needsProfile, setNeedsProfile] = useState(false);

  const [isChecking, setIsChecking] = useState(true);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const checkKyc = useCallback(async () => {
    setIsChecking(true);
    setError("");

    try {
      const response = await checkCustomerKycStatus();

      const requiresProfile = Boolean(response.needsProfile);

      setNeedsProfile(requiresProfile);

      if (!requiresProfile) {
        await onReady();
      }
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to verify your customer profile.";

      if (message === "UNAUTHORIZED") {
        await onSignOut();
        return;
      }

      setError(message);
    } finally {
      setIsChecking(false);
    }
  }, [onReady, onSignOut]);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    void checkKyc();
  }, [checkKyc]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setNotice("");
    }, 4500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notice]);

  const handleCompleted = async (message: string) => {
    setNeedsProfile(false);
    setNotice(message);

    await onReady();
  };

  return (
    <>
      <CompleteKycModal
        open={needsProfile}
        initialName={localStorage.getItem("nexus_google_name") ?? ""}
        onCompleted={handleCompleted}
        onSignOut={onSignOut}
      />

      {isChecking && (
        <div className="fixed bottom-5 right-5 z-[140] flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-xl dark:border-white/10 dark:bg-[#0b1526] dark:text-slate-300">
          <LoaderCircle size={17} className="animate-spin text-indigo-500" />
          Verifying customer profile...
        </div>
      )}

      {error && !needsProfile && (
        <div className="fixed bottom-5 right-5 z-[140] w-[calc(100%-2.5rem)] max-w-sm rounded-xl border border-red-200 bg-white p-4 shadow-xl dark:border-red-400/20 dark:bg-[#0b1526]">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />

            <div>
              <p className="text-sm font-black text-slate-950 dark:text-white">
                Profile verification failed
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void checkKyc()}
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-xs font-black text-white"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      )}

      {notice && (
        <div className="fixed right-5 top-24 z-[140] rounded-xl border border-emerald-300 bg-white px-5 py-4 text-sm font-bold text-emerald-700 shadow-xl dark:border-emerald-400/20 dark:bg-[#0c1b18] dark:text-emerald-300">
          {notice}
        </div>
      )}
    </>
  );
}
