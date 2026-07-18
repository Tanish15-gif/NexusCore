import { authorizedRequest } from "./apiService";

export interface ManagerPendingDeposit {
  transactionId: number;
  fullName: string;
  accountNumber: string | number;
  amount: number;
  transactionDate: string;
}

export interface ManagerLedgerAccount {
  accountId: number;
  accountNumber: string | number;
  fullName: string;
  email: string;
  accountType: string;
  balance: number;
  accountStatus: string;
}

export interface ManagerAuditLog {
  logId: number;
  actionDate: string;
  employeeName: string;
  actionType: string;
  actionDetails: string;
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

export function getManagerPendingDeposits() {
  return authorizedRequest<ManagerPendingDeposit[]>("/Manager/Pending-Deposit");
}

export async function approveManagerDeposit(
  transactionId: number,
): Promise<ApiMessage> {
  const response = await authorizedRequest<RawApiMessage>(
    `/Manager/approve/${transactionId}`,
    {
      method: "PUT",
    },
  );

  return normalizeMessage(response, "Deposit approved successfully.");
}

export async function rejectManagerDeposit(
  transactionId: number,
): Promise<ApiMessage> {
  const response = await authorizedRequest<RawApiMessage>(
    `/Manager/reject/${transactionId}`,
    {
      method: "PUT",
    },
  );

  return normalizeMessage(response, "Deposit rejected successfully.");
}

export function getManagerGlobalLedger() {
  return authorizedRequest<ManagerLedgerAccount[]>("/Manager/global-ledger");
}

export function getManagerAuditLogs() {
  return authorizedRequest<ManagerAuditLog[]>("/Manager/audit-logs");
}

export async function freezeManagerAccount(
  accountNumber: string | number,
): Promise<ApiMessage> {
  const response = await authorizedRequest<RawApiMessage>(
    `/Manager/freeze/${encodeURIComponent(String(accountNumber))}`,
    {
      method: "PUT",
    },
  );

  return normalizeMessage(response, "Account frozen successfully.");
}

export async function unfreezeManagerAccount(
  accountNumber: string | number,
): Promise<ApiMessage> {
  const response = await authorizedRequest<RawApiMessage>(
    `/Manager/unfreeze/${encodeURIComponent(String(accountNumber))}`,
    {
      method: "PUT",
    },
  );

  return normalizeMessage(response, "Account restored successfully.");
}

export async function updateManagerAccountEmail(
  accountId: number,
  newEmail: string,
): Promise<ApiMessage> {
  const response = await authorizedRequest<RawApiMessage>(
    `/Manager/update-email/${accountId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newEmail,
      }),
    },
  );

  return normalizeMessage(response, "Registered email updated successfully.");
}
