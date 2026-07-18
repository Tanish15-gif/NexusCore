import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  CalendarDays,
  Check,
  IdCard,
  KeyRound,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Monitor,
  Phone,
  ShieldCheck,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  updateCustomerLegalInfo,
  type CustomerProfile,
} from "../../services/customerService";

type SettingsTab = "profile" | "personal" | "security";

interface AccountSettingsModalProps {
  open: boolean;
  profile: CustomerProfile | null;
  pictureUrl?: string | null;
  onClose: () => void;
  onProfileUpdated: () => Promise<void>;
  onSignOut: () => void;
}

interface PersonalInfoForm {
  legalName: string;
  dateOfBirth: string;
  address: string;
}

interface SettingsTabItem {
  id: SettingsTab;
  label: string;
  icon: LucideIcon;
}

const tabs: SettingsTabItem[] = [
  {
    id: "profile",
    label: "Profile",
    icon: UserRound,
  },
  {
    id: "personal",
    label: "Personal information",
    icon: IdCard,
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheck,
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function normalizeDate(value?: string) {
  return value ? value.slice(0, 10) : "";
}

function formatDate(value?: string) {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function AccountSettingsModal({
  open,
  profile,
  pictureUrl,
  onClose,
  onProfileUpdated,
  onSignOut,
}: AccountSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [form, setForm] = useState<PersonalInfoForm>({
    legalName: "",
    dateOfBirth: "",
    address: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fullName = profile?.fullName?.trim() || "Customer";

  const email = profile?.email || "Not provided";

  const phone = profile?.phoneNumber || "Not provided";

  const initials = getInitials(fullName);

  const isGoogleConnected = useMemo(() => {
    return Boolean(
      pictureUrl ||
      localStorage.getItem("nexus_google_name") ||
      localStorage.getItem("nexus_google_picture"),
    );
  }, [pictureUrl, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setActiveTab("profile");
    setIsMobileMenuOpen(false);
    setError("");
    setSuccess("");

    setForm({
      legalName: profile?.fullName ?? "",
      dateOfBirth: normalizeDate(profile?.dateofBirth),
      address: profile?.address ?? "",
    });
  }, [open, profile]);

  useEffect(() => {
    if (!open) {
      return;
    }

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        return;
      }

      if (!isSaving) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, isMobileMenuOpen, isSaving, onClose]);

  if (!open) {
    return null;
  }

  const changeTab = (tab: SettingsTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    setError("");
    setSuccess("");
  };

  const updateField = (field: keyof PersonalInfoForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isSaving) {
      onClose();
    }
  };

  const handlePersonalInfoSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.legalName.trim()) {
      setError("Enter your legal name.");
      return;
    }

    if (!form.dateOfBirth) {
      setError("Select your date of birth.");
      return;
    }

    if (!form.address.trim()) {
      setError("Enter your permanent address.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await updateCustomerLegalInfo({
        LegalName: form.legalName.trim(),
        DOB: form.dateOfBirth,
        Address: form.address.trim(),
      });

      await onProfileUpdated();

      setSuccess(response.message);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update your information.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6 dark:bg-black/75"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="relative grid max-h-[94vh] min-h-[620px] w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)] md:grid-cols-[250px_minmax(0,1fr)] dark:border-white/10 dark:bg-[#0d1424] dark:shadow-[0_30px_100px_rgba(0,0,0,0.6)]"
      >
        {/* Desktop sidebar */}
        <aside className="hidden border-r border-slate-200 bg-slate-50 p-5 md:flex md:flex-col dark:border-white/10 dark:bg-[#080e1c]">
          <SettingsSidebarHeader />

          <SettingsNavigation activeTab={activeTab} onTabChange={changeTab} />

          <div className="mt-auto border-t border-slate-200 px-2 pt-5 dark:border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
              <ShieldCheck size={14} className="text-emerald-500" />
              Secured by NexusCore
            </div>
          </div>
        </aside>

        {/* Mobile menu backdrop */}
        <div
          className={[
            "absolute inset-0 z-40 md:hidden",
            isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none",
          ].join(" ")}
        >
          <button
            type="button"
            aria-label="Close settings menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className={[
              "absolute inset-0 bg-slate-950/45 backdrop-blur-sm transition-opacity",
              isMobileMenuOpen ? "opacity-100" : "opacity-0",
            ].join(" ")}
          />

          <aside
            className={[
              "absolute inset-y-0 left-0 flex w-[82%] max-w-[290px] flex-col",
              "border-r border-slate-200 bg-white p-5 shadow-2xl",
              "transition-transform duration-300",
              "dark:border-white/10 dark:bg-[#080e1c]",
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close settings menu"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <X size={18} />
            </button>

            <SettingsSidebarHeader />

            <SettingsNavigation activeTab={activeTab} onTabChange={changeTab} />

            <div className="mt-auto border-t border-slate-200 px-2 pt-5 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={14} className="text-emerald-500" />
                Secured by NexusCore
              </div>
            </div>
          </aside>
        </div>

        {/* Main content */}
        <main className="nexus-scrollbar min-w-0 overflow-y-auto bg-white dark:bg-[#0d1424]">
          {/* Responsive header */}
          <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl sm:px-6 md:justify-end dark:border-white/10 dark:bg-[#0d1424]/95">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open settings menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 md:hidden dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-3 md:hidden">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              aria-label="Close account settings"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <X size={19} />
            </button>
          </header>

          <div className="p-5 sm:p-8">
            {/* Profile */}
            {activeTab === "profile" && (
              <section>
                <PageHeading
                  eyebrow="Identity"
                  title="Profile details"
                  description="Review your primary NexusCore identity information."
                />

                <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0a1020]">
                  <ProfileRow label="Profile">
                    <div className="flex min-w-0 items-center gap-4">
                      {pictureUrl ? (
                        <img
                          src={pictureUrl}
                          alt={fullName}
                          referrerPolicy="no-referrer"
                          className="h-12 w-12 shrink-0 rounded-full border border-slate-200 object-cover dark:border-white/15"
                        />
                      ) : (
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                          {initials || "NC"}
                        </span>
                      )}

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-950 dark:text-white">
                          {fullName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          NexusCore customer
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => changeTab("personal")}
                      className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Edit
                    </button>
                  </ProfileRow>

                  <ProfileRow label="Email address">
                    <div className="flex min-w-0 flex-wrap items-center gap-3">
                      <Mail
                        size={17}
                        className="shrink-0 text-slate-400 dark:text-slate-500"
                      />

                      <span className="break-all text-slate-700 dark:text-slate-300">
                        {email}
                      </span>

                      <StatusBadge>Primary</StatusBadge>
                    </div>
                  </ProfileRow>

                  <ProfileRow label="Phone number">
                    <div className="flex flex-wrap items-center gap-3">
                      <Phone
                        size={17}
                        className="shrink-0 text-slate-400 dark:text-slate-500"
                      />

                      <span className="text-slate-700 dark:text-slate-300">
                        {phone}
                      </span>

                      {profile?.phoneNumber && (
                        <StatusBadge>Primary</StatusBadge>
                      )}
                    </div>
                  </ProfileRow>

                  <ProfileRow label="Connected account" borderless>
                    {isGoogleConnected ? (
                      <div className="flex min-w-0 flex-wrap items-center gap-3">
                        <GoogleIcon />

                        <span className="font-semibold text-slate-950 dark:text-white">
                          Google
                        </span>

                        <span className="text-slate-300 dark:text-slate-600">
                          /
                        </span>

                        <span className="truncate text-slate-500 dark:text-slate-400">
                          {email}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500">
                        No connected provider
                      </span>
                    )}
                  </ProfileRow>
                </div>
              </section>
            )}

            {/* Personal information */}
            {activeTab === "personal" && (
              <section>
                <PageHeading
                  eyebrow="Verification"
                  title="Personal information"
                  description="Keep your legal and KYC information accurate."
                />

                <form onSubmit={handlePersonalInfoSubmit} className="mt-8">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-white/10 dark:bg-[#0a1020]">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField label="Legal name" htmlFor="legal-name">
                        <UserRound
                          size={17}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                        />

                        <input
                          id="legal-name"
                          type="text"
                          value={form.legalName}
                          disabled={isSaving}
                          onChange={(event) =>
                            updateField("legalName", event.target.value)
                          }
                          className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50 dark:border-white/10 dark:bg-[#0d1424] dark:text-white"
                        />
                      </FormField>

                      <FormField label="Date of birth" htmlFor="date-of-birth">
                        <CalendarDays
                          size={17}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                        />

                        <input
                          id="date-of-birth"
                          type="date"
                          value={form.dateOfBirth}
                          disabled={isSaving}
                          onChange={(event) =>
                            updateField("dateOfBirth", event.target.value)
                          }
                          className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50 dark:border-white/10 dark:bg-[#0d1424] dark:text-white"
                        />
                      </FormField>
                    </div>

                    <div className="mt-5">
                      <FormField
                        label="Permanent address"
                        htmlFor="permanent-address"
                      >
                        <MapPin
                          size={17}
                          className="pointer-events-none absolute left-4 top-4 text-slate-400 dark:text-slate-500"
                        />

                        <textarea
                          id="permanent-address"
                          rows={4}
                          value={form.address}
                          disabled={isSaving}
                          placeholder="Enter your complete address"
                          onChange={(event) =>
                            updateField("address", event.target.value)
                          }
                          className="w-full resize-y rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50 dark:border-white/10 dark:bg-[#0d1424] dark:text-white dark:placeholder:text-slate-600"
                        />
                      </FormField>
                    </div>

                    <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                      <span>Current date of birth</span>

                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {formatDate(profile?.dateofBirth)}
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="mt-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-400/20 dark:bg-red-400/[0.07] dark:text-red-300"
                    >
                      {error}
                    </div>
                  )}

                  {success && (
                    <div
                      role="status"
                      className="mt-5 flex items-center gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/[0.07] dark:text-emerald-300"
                    >
                      <Check size={17} />
                      {success}
                    </div>
                  )}

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => changeTab("profile")}
                      disabled={isSaving}
                      className="h-11 rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSaving ? (
                        <>
                          <LoaderCircle size={17} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check size={17} />
                          Save changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <section>
                <PageHeading
                  eyebrow="Protection"
                  title="Security"
                  description="Review authentication and session information."
                />

                <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0a1020]">
                  <SecurityRow
                    icon={KeyRound}
                    title="Authentication"
                    description="JWT-based authentication protects access to your NexusCore account."
                    status="Protected"
                  />

                  <SecurityRow
                    icon={Monitor}
                    title="Current session"
                    description="This browser is currently signed in and active."
                    status="Active"
                  />

                  <div className="flex flex-col gap-5 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                    <div>
                      <h3 className="font-semibold text-slate-950 dark:text-white">
                        Sign out
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Remove the authentication token from this device.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={onSignOut}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-red-300 px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-400/10"
                    >
                      <LogOut size={17} />
                      Sign out
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function SettingsSidebarHeader() {
  return (
    <div className="px-2 pt-2">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
        NexusCore
      </p>

      <h2
        id="settings-title"
        className="mt-2 text-xl font-semibold text-slate-950 dark:text-white"
      >
        Account settings
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Manage your identity and account security.
      </p>
    </div>
  );
}

function SettingsNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}) {
  return (
    <nav className="mt-8 space-y-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={[
              "relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition",
              isActive
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.035] dark:hover:text-slate-200",
            ].join(" ")}
          >
            {isActive && (
              <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
            )}

            <Icon size={18} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
        {title}
      </h2>

      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ProfileRow({
  label,
  children,
  borderless = false,
}: {
  label: string;
  children: ReactNode;
  borderless?: boolean;
}) {
  return (
    <div
      className={[
        "grid gap-4 p-5 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center",
        borderless ? "" : "border-b border-slate-200 dark:border-white/10",
      ].join(" ")}
    >
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <div className="min-w-0">{children}</div>
    </div>
  );
}

function StatusBadge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/[0.08] dark:text-indigo-300">
      {children}
    </span>
  );
}

function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>

      <div className="relative">{children}</div>
    </div>
  );
}

function SecurityRow({
  icon: Icon,
  title,
  description,
  status,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center dark:border-white/10">
      <Icon
        size={19}
        className="shrink-0 text-indigo-600 dark:text-indigo-400"
      />

      <div className="flex-1">
        <h3 className="font-semibold text-slate-950 dark:text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>

      <span className="w-fit rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/[0.07] dark:text-emerald-300">
        {status}
      </span>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"
      />

      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
      />

      <path
        fill="#FBBC05"
        d="M6.39 13.86A6.01 6.01 0 0 1 6.08 12c0-.65.11-1.28.31-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.48l3.35-2.62Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.01c1.47 0 2.78.51 3.82 1.5l2.87-2.87A9.67 9.67 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6.01 12 6.01Z"
      />
    </svg>
  );
}
