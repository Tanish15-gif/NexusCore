import { authorizedRequest } from "./apiService";

export interface EmployeeDetails {
  employeeId?: number;
  fullName: string;
  email?: string;
  department?: string;
}

export interface PendingAccount {
  accountId: number;
  accountNumber: string | number;
  accountType: string;
  balance: number;
  status?: string;
  fullName?: string;
  email?: string;
  sourceofFunds?: string;
  nomineeName?: string;
  nomineeRelationship?: string;
  termDuration?: number | null;
  dailyAmount?: number | null;
}

export interface CustomerAccountLookup {
  fullName: string;
  email: string;
  accountNumber: string | number;
  accountType: string;
  balance: number;
  status: string;
}

export interface EmployeeActionRequest {
  AccountId: number;
}

export interface ApiMessage {
  message: string;
}

interface RawApiMessage {
  message?: string;
  Message?: string;
}

function normalizeMessage(
  data: RawApiMessage | null,
  fallback: string,
): ApiMessage {
  return {
    message: data?.message ?? data?.Message ?? fallback,
  };
}

export function getEmployeeDetails() {
  return authorizedRequest<EmployeeDetails>("/Employee/fetchdetails");
}

export function getPendingAccounts() {
  return authorizedRequest<PendingAccount[]>("/Employee/pending-accounts");
}

export async function approvePendingAccount(
  accountId: number,
): Promise<ApiMessage> {
  const response = await authorizedRequest<RawApiMessage>("/Employee/approve", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      AccountId: accountId,
    } satisfies EmployeeActionRequest),
  });

  return normalizeMessage(response, "Account approved successfully.");
}

export async function rejectPendingAccount(
  accountId: number,
): Promise<ApiMessage> {
  const response = await authorizedRequest<RawApiMessage>("/Employee/reject", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      AccountId: accountId,
    } satisfies EmployeeActionRequest),
  });

  return normalizeMessage(response, "Account rejected successfully.");
}

export function searchCustomerAccount(accountNumber: string) {
  return authorizedRequest<CustomerAccountLookup>(
    `/Employee/search/${encodeURIComponent(accountNumber)}`,
  );
}
