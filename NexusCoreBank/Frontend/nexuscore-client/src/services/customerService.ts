import { API_BASE_URL, getAuthToken, removeAuthToken } from "./authService";

export interface CustomerProfile {
  fullName: string;
  email: string;
  phoneNumber?: string;
  dateofBirth?: string;
  address?: string;
}

export interface CustomerAccount {
  accountId: number;
  accountNumber: string | number;
  accountType: string;
  balance: number;
  status: string;
  fullName?: string;
  dailyAmount?: number;
  overDraftLimit?: number;
}

export interface CustomerTransaction {
  transactionId?: number;
  accountId: number;
  transactionDate?: string;
  transactionType?: string;
  merchantName?: string;
  amount: number;
  status?: string;
}

export interface ApiMessage {
  message: string;
}

export interface DepositRequest {
  AccountId: number;
  Amount: number;
}

export interface WithdrawRequest {
  AccountId: number;
  Amount: number;
  AccountType: string;
}

export interface TransferRequest {
  SourceAccountId: number;
  TargetAccountNumber: number;
  Amount: number;
}

export interface TransferResponse {
  message: string;
  action?: "SHOW_OTP" | "COMPLETED";
}

export interface VerifyTransferRequest {
  OtpCode: string;
  TransferDetails: TransferRequest;
}

interface ApiErrorResponse {
  message?: string;
  Message?: string;
  title?: string;
  errors?: Record<string, string[]>;
}

async function readResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  const errorData = data as ApiErrorResponse;

  if (errorData.message) {
    return errorData.message;
  }

  if (errorData.Message) {
    return errorData.Message;
  }

  if (errorData.errors) {
    const messages = Object.values(errorData.errors).flat();

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  return errorData.title ?? null;
}

async function authorizedRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Unable to connect to the NexusCore server.");
  }

  if (response.status === 401) {
    removeAuthToken();
    throw new Error("UNAUTHORIZED");
  }

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data) ?? `Request failed with status ${response.status}.`,
    );
  }

  return data as T;
}

function normalizeMessage(data: unknown, fallback: string): ApiMessage {
  if (data && typeof data === "object") {
    const result = data as {
      message?: string;
      Message?: string;
    };

    return {
      message: result.message ?? result.Message ?? fallback,
    };
  }

  return {
    message: fallback,
  };
}

export function getCustomerProfile() {
  return authorizedRequest<CustomerProfile>("/Users/profile");
}

export function getCustomerAccounts() {
  return authorizedRequest<CustomerAccount[]>("/Account/my-accounts");
}

export function getCustomerTransactions() {
  return authorizedRequest<CustomerTransaction[]>("/Account/transactions");
}

export async function depositFunds(
  request: DepositRequest,
): Promise<ApiMessage> {
  const data = await authorizedRequest<unknown>("/Account/deposit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return normalizeMessage(data, "Deposit completed successfully.");
}

export async function withdrawFunds(
  request: WithdrawRequest,
): Promise<ApiMessage> {
  const data = await authorizedRequest<unknown>("/Account/withdraw", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return normalizeMessage(data, "Withdrawal completed successfully.");
}

export async function transferFunds(
  request: TransferRequest,
): Promise<TransferResponse> {
  const data = await authorizedRequest<TransferResponse>("/Account/transfer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return {
    message: data?.message ?? "Transfer request processed successfully.",
    action: data?.action,
  };
}

export async function verifyTransferOtp(
  request: VerifyTransferRequest,
): Promise<TransferResponse> {
  const data = await authorizedRequest<TransferResponse>("/Account/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return {
    message: data?.message ?? "Transfer verified successfully.",
    action: data?.action,
  };
}
export type NexusAccountType =
  | "Savings"
  | "Current"
  | "FixedDeposit"
  | "RecurringDeposit"
  | "Loan"
  | "DailyDeposit";

export interface OpenAccountRequest {
  AccountType: NexusAccountType;
  InitialDeposit: number;
  SourceofFunds: string;
  NomineeName: string;
  NomineeRelationship: string;
  TermDuration: number | null;
  DailyAmount: number | null;
}

export async function createCustomerAccount(
  request: OpenAccountRequest,
): Promise<ApiMessage> {
  const data = await authorizedRequest<unknown>("/Account/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return normalizeMessage(
    data,
    "Your account application was submitted successfully.",
  );
}

export interface UpdateLegalInfoRequest {
  LegalName: string;
  DOB: string;
  Address: string;
}

export async function updateCustomerLegalInfo(
  request: UpdateLegalInfoRequest,
): Promise<ApiMessage> {
  const data = await authorizedRequest<unknown>("/Users/update-legal-info", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return normalizeMessage(data, "Personal information updated successfully.");
}

export interface CustomerKycStatus {
  needsProfile: boolean;
}

export interface CompleteCustomerProfileRequest {
  FullName: string;
  DateofBirth: string;
  PhoneNumber: string;
  Address: string;
}

interface CompleteCustomerProfileResponse {
  message?: string;
  Message?: string;
}

export async function checkCustomerKycStatus(): Promise<CustomerKycStatus> {
  return authorizedRequest<CustomerKycStatus>("/Users/check-kyc", {
    method: "GET",
  });
}

export async function completeCustomerProfile(
  request: CompleteCustomerProfileRequest,
): Promise<string> {
  const response = await authorizedRequest<CompleteCustomerProfileResponse>(
    "/Users/complete-profile",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  return (
    response?.message ?? response?.Message ?? "Profile completed successfully."
  );
}
