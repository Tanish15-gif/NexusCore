import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import SelectDropdown from "../../Components/ui/SelectDropdown";

import {
  changeAdminStaffRole,
  getAdminStaffList,
  registerAdminStaff,
  type AdminDepartment,
  type AdminStaffMember,
  type AdminStaffRole,
} from "../../services/adminService";

interface RegisterFormState {
  fullName: string;
  email: string;
  password: string;
  department: AdminDepartment | "";
  role: AdminStaffRole | "";
}

const initialRegisterForm: RegisterFormState = {
  fullName: "",
  email: "",
  password: "",
  department: "",
  role: "",
};

function getRoleClasses(role: string): string {
  if (role.toLowerCase() === "manager") {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/[0.08] dark:text-amber-300";
  }

  return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/[0.08] dark:text-blue-300";
}

export default function AdminStaffManagementPage() {
  const [staff, setStaff] = useState<AdminStaffMember[]>([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "employee" | "manager">(
    "all",
  );

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState<AdminStaffMember | null>(
    null,
  );

  const [selectedRole, setSelectedRole] = useState<AdminStaffRole | "">("");

  const [registerForm, setRegisterForm] =
    useState<RegisterFormState>(initialRegisterForm);

  const [showPassword, setShowPassword] = useState(false);

  const [activeAction, setActiveAction] = useState<"register" | "role" | null>(
    null,
  );

  const loadStaff = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getAdminStaffList();

      setStaff(response);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load staff records.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Staff Management | NexusCore";

    void loadStaff();
  }, [loadStaff]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => setNotice(""), 4500);

    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staff.filter((member) => {
      const matchesRole =
        roleFilter === "all" || member.currentRole.toLowerCase() === roleFilter;

      if (!matchesRole) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        member.userId,
        member.name,
        member.email,
        member.currentRole,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      );
    });
  }, [staff, search, roleFilter]);

  const closeRegisterModal = () => {
    if (activeAction) {
      return;
    }

    setIsRegisterOpen(false);
    setRegisterForm(initialRegisterForm);
    setShowPassword(false);
    setError("");
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!registerForm.fullName.trim()) {
      setError("Enter the staff member's name.");
      return;
    }

    if (!registerForm.email.trim()) {
      setError("Enter the staff email.");
      return;
    }

    if (registerForm.password.length < 8) {
      setError("Temporary password must contain at least 8 characters.");
      return;
    }

    if (!registerForm.department || !registerForm.role) {
      setError("Select a department and role.");
      return;
    }

    setActiveAction("register");

    try {
      const response = await registerAdminStaff({
        FullName: registerForm.fullName.trim(),
        Email: registerForm.email.trim().toLowerCase(),
        Password: registerForm.password,
        Department: registerForm.department,
        Role: registerForm.role,
      });

      setNotice(response.message);
      closeRegisterModal();
      await loadStaff();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create staff identity.",
      );
    } finally {
      setActiveAction(null);
    }
  };

  const openRoleModal = (member: AdminStaffMember) => {
    setSelectedStaff(member);

    const normalizedRole =
      member.currentRole === "Manager" ? "Manager" : "Employee";

    setSelectedRole(normalizedRole);
    setError("");
  };

  const closeRoleModal = () => {
    if (activeAction) {
      return;
    }

    setSelectedStaff(null);
    setSelectedRole("");
    setError("");
  };

  const handleRoleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedStaff || !selectedRole) {
      return;
    }

    setError("");
    setActiveAction("role");

    try {
      const response = await changeAdminStaffRole({
        userId: selectedStaff.userId,
        newRole: selectedRole,
      });

      setNotice(response.message);
      closeRoleModal();
      await loadStaff();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update staff role.",
      );
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <>
      {notice && (
        <div className="fixed right-4 top-24 z-[110] flex max-w-sm items-start gap-3 rounded-xl border border-emerald-300 bg-white px-5 py-4 text-emerald-700 shadow-xl sm:right-6 dark:border-emerald-400/20 dark:bg-[#0c1b18] dark:text-emerald-300">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <p className="text-sm font-bold">{notice}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">
              Identity administration
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Staff Management
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Register staff and manage operational access roles.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 text-sm font-black text-white transition hover:bg-violet-500"
          >
            <UserPlus size={17} />
            Register Staff
          </button>
        </div>

        <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between dark:border-white/10 dark:bg-[#0b1526]">
          <div className="relative w-full lg:max-w-xl">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search staff name, email or ID"
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-white/[0.035] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(["all", "employee", "manager"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setRoleFilter(filter)}
                className={[
                  "min-h-10 rounded-lg px-4 text-xs font-black capitalize transition",
                  roleFilter === filter
                    ? "bg-violet-600 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.05]",
                ].join(" ")}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {error && !isRegisterOpen && !selectedStaff && (
          <ErrorMessage message={error} />
        )}

        {isLoading ? (
          <div className="h-96 animate-pulse rounded-xl bg-white dark:bg-[#0b1526]" />
        ) : filteredStaff.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-20 text-center dark:border-white/10 dark:bg-[#0b1526]">
            <Users
              size={36}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <h3 className="mt-5 text-xl font-black">No staff records found</h3>
          </div>
        ) : (
          <>
            <section className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block dark:border-white/10 dark:bg-[#0b1526]">
              <table className="min-w-full">
                <thead className="bg-slate-50 dark:bg-white/[0.025]">
                  <tr>
                    <TableHeading>User ID</TableHeading>
                    <TableHeading>Staff Member</TableHeading>
                    <TableHeading>Email</TableHeading>
                    <TableHeading>Role</TableHeading>
                    <TableHeading align="right">Action</TableHeading>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {filteredStaff.map((member) => (
                    <tr
                      key={member.userId}
                      className="transition hover:bg-slate-50 dark:hover:bg-white/[0.025]"
                    >
                      <td className="px-6 py-5 font-mono text-sm text-slate-500">
                        #{member.userId}
                      </td>

                      <td className="px-6 py-5 font-black">{member.name}</td>

                      <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">
                        {member.email}
                      </td>

                      <td className="px-6 py-5">
                        <RoleBadge role={member.currentRole} />
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => openRoleModal(member)}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-violet-200 px-3 text-xs font-black text-violet-600 transition hover:bg-violet-50 dark:border-violet-400/20 dark:text-violet-300 dark:hover:bg-violet-400/10"
                        >
                          <ShieldCheck size={15} />
                          Change Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="space-y-3 lg:hidden">
              {filteredStaff.map((member) => (
                <article
                  key={member.userId}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1526]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-black">{member.name}</h3>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {member.email}
                      </p>

                      <p className="mt-2 font-mono text-xs text-slate-400">
                        User #{member.userId}
                      </p>
                    </div>

                    <RoleBadge role={member.currentRole} />
                  </div>

                  <button
                    type="button"
                    onClick={() => openRoleModal(member)}
                    className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-sm font-black text-white"
                  >
                    <ShieldCheck size={16} />
                    Change Role
                  </button>
                </article>
              ))}
            </section>
          </>
        )}
      </div>

      {/* Register modal */}
      {isRegisterOpen && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRegisterModal();
            }
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
        >
          <form
            onSubmit={handleRegisterSubmit}
            className="nexus-scrollbar max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1526]"
          >
            <ModalHeader
              eyebrow="Staff identity"
              title="Register New Staff"
              onClose={closeRegisterModal}
            />

            <div className="space-y-5 p-5 sm:p-6">
              <FormField label="Full name" htmlFor="staff-name">
                <input
                  id="staff-name"
                  type="text"
                  value={registerForm.fullName}
                  disabled={activeAction === "register"}
                  onChange={(event) =>
                    setRegisterForm((current) => ({
                      ...current,
                      fullName: event.target.value,
                    }))
                  }
                  className="form-input"
                  placeholder="Employee legal name"
                />
              </FormField>

              <FormField label="Email address" htmlFor="staff-email">
                <div className="relative">
                  <Mail
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="staff-email"
                    type="email"
                    value={registerForm.email}
                    disabled={activeAction === "register"}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    className="form-input pl-11"
                    placeholder="staff@nexuscore.com"
                  />
                </div>
              </FormField>

              <FormField label="Temporary password" htmlFor="staff-password">
                <div className="relative">
                  <input
                    id="staff-password"
                    type={showPassword ? "text" : "password"}
                    value={registerForm.password}
                    disabled={activeAction === "register"}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    className="form-input pr-12"
                    placeholder="Minimum 8 characters"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-slate-400"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Department" htmlFor="staff-department">
                  <SelectDropdown
                    id="staff-department"
                    value={registerForm.department}
                    placeholder="Select department"
                    options={[
                      {
                        value: "Fraud",
                        label: "Fraud",
                      },
                      {
                        value: "Accounts",
                        label: "Accounts",
                      },
                      {
                        value: "Customer Service",
                        label: "Customer Service",
                      },
                    ]}
                    onChange={(value) =>
                      setRegisterForm((current) => ({
                        ...current,
                        department: value as AdminDepartment,
                      }))
                    }
                  />
                </FormField>

                <FormField label="Role" htmlFor="staff-role">
                  <SelectDropdown
                    id="staff-role"
                    value={registerForm.role}
                    placeholder="Select role"
                    options={[
                      {
                        value: "Employee",
                        label: "Employee",
                        description: "Branch operations",
                      },
                      {
                        value: "Manager",
                        label: "Manager",
                        description: "Executive branch access",
                      },
                    ]}
                    onChange={(value) =>
                      setRegisterForm((current) => ({
                        ...current,
                        role: value as AdminStaffRole,
                      }))
                    }
                  />
                </FormField>
              </div>

              {error && <ErrorMessage message={error} />}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end dark:border-white/10">
              <button
                type="button"
                onClick={closeRegisterModal}
                disabled={Boolean(activeAction)}
                className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-black dark:border-white/10"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={activeAction === "register"}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 text-sm font-black text-white disabled:opacity-60"
              >
                {activeAction === "register" ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus size={17} />
                    Create Staff
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Role modal */}
      {selectedStaff && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleRoleSubmit}
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1526]"
          >
            <ModalHeader
              eyebrow="Authorization"
              title="Change Staff Role"
              onClose={closeRoleModal}
            />

            <div className="space-y-5 p-6">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                <p className="font-black">{selectedStaff.name}</p>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedStaff.email}
                </p>
              </div>

              <SelectDropdown
                value={selectedRole}
                placeholder="Select role"
                options={[
                  {
                    value: "Employee",
                    label: "Employee",
                  },
                  {
                    value: "Manager",
                    label: "Manager",
                  },
                ]}
                onChange={(value) => setSelectedRole(value as AdminStaffRole)}
              />

              {error && <ErrorMessage message={error} />}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end dark:border-white/10">
              <button
                type="button"
                onClick={closeRoleModal}
                disabled={Boolean(activeAction)}
                className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-black dark:border-white/10"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={activeAction === "role" || !selectedRole}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 text-sm font-black text-white disabled:opacity-60"
              >
                {activeAction === "role" ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={17} />
                    Update Role
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={[
        "inline-flex rounded-md border px-2.5 py-1 text-[11px] font-black uppercase",
        getRoleClasses(role),
      ].join(" ")}
    >
      {role}
    </span>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-400/20 dark:bg-red-400/[0.07] dark:text-red-300">
      <AlertCircle size={18} className="mt-0.5 shrink-0" />
      <p className="text-sm font-semibold">{message}</p>
    </div>
  );
}

function ModalHeader({
  eyebrow,
  title,
  onClose,
}: {
  eyebrow: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <header className="flex items-start justify-between gap-5 border-b border-slate-200 p-5 sm:p-6 dark:border-white/10">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.17em] text-violet-600 dark:text-violet-400">
          {eyebrow}
        </p>

        <h3 className="mt-2 text-xl font-black">{title}</h3>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 dark:border-white/10"
      >
        <X size={17} />
      </button>
    </header>
  );
}

function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>

      {children}
    </div>
  );
}

function TableHeading({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={[
        "px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400",
        align === "right" ? "text-right" : "text-left",
      ].join(" ")}
    >
      {children}
    </th>
  );
}
