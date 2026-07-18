import { authorizedRequest } from "./apiService";

export type AdminStaffRole = "Employee" | "Manager";

export type AdminDepartment = "Fraud" | "Accounts" | "Customer Service";

export interface AdminSystemMetrics {
  totalUsers: number;
  totalLiquidity: number;
  totalFrozenAccounts: number;
}

export interface AdminStaffMember {
  userId: number;
  name: string;
  email: string;
  currentRole: string;
}

export interface AdminAuditLog {
  logId: number;
  employeeName: string;
  actionType: string;
  actionDetails: string;
  actionDate: string;
}

export interface RegisterStaffRequest {
  FullName: string;
  Email: string;
  Password: string;
  Department: AdminDepartment;
  Role: AdminStaffRole;
}

export interface ChangeStaffRoleRequest {
  userId: number;
  newRole: AdminStaffRole;
}

export interface ApiMessage {
  message: string;
}

interface RawApiMessage {
  message?: string;
  Message?: string;
}

function normalizeMessage(
  response: RawApiMessage | null,
  fallback: string,
): ApiMessage {
  return {
    message: response?.message ?? response?.Message ?? fallback,
  };
}

export function getAdminSystemMetrics() {
  return authorizedRequest<AdminSystemMetrics>("/Admin/system-metrics");
}

export async function getAdminStaffList(): Promise<AdminStaffMember[]> {
  const response =
    await authorizedRequest<AdminStaffMember[]>("/Admin/staff-list");

  return Array.isArray(response) ? response : [];
}

export async function getAdminAuditLogs(): Promise<AdminAuditLog[]> {
  const response =
    await authorizedRequest<AdminAuditLog[]>("/Admin/audit-logs");

  return Array.isArray(response) ? response : [];
}

export async function registerAdminStaff(
  request: RegisterStaffRequest,
): Promise<ApiMessage> {
  const response = await authorizedRequest<RawApiMessage>(
    "/Admin/register-staff",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  return normalizeMessage(response, "Staff identity created successfully.");
}

export async function changeAdminStaffRole(
  request: ChangeStaffRoleRequest,
): Promise<ApiMessage> {
  const response = await authorizedRequest<RawApiMessage>(
    "/Admin/promote-staff",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  return normalizeMessage(response, "Staff role updated successfully.");
}
