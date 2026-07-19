import { getAuthToken } from "./authService";

import { API_BASE_URL, resolveProductImageUrl } from "./productService";

type UnknownRecord = Record<string, unknown>;

export interface MartCustomerProfile {
  name: string;
  email: string;
}

export interface LinkedBankAccount {
  linkId: number;
  fullName: string;
  accountNumber: string;
}

export interface LinkBankRequest {
  accountNumber: string;
  fullName: string;
}

export interface CustomerOrder {
  orderId: number;
  orderDate: string;
  totalAmount: number;
  status: string;
}

export interface CustomerOrderItem {
  productName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

function readString(source: UnknownRecord, ...keys: string[]): string {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
}

function readNumber(source: UnknownRecord, ...keys: string[]): number {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim() &&
      Number.isFinite(Number(value))
    ) {
      return Number(value);
    }
  }

  return 0;
}

async function readErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const payload = (await response.json()) as {
      message?: string;
      title?: string;
    };

    return payload.message || payload.title || fallback;
  } catch {
    return fallback;
  }
}

async function authorizedRequest<T>(
  path: string,
  options: RequestInit = {},
  signal?: AbortSignal,
): Promise<T> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    signal,
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        "The server could not complete the request.",
      ),
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();

  if (!responseText) {
    return undefined as T;
  }

  return JSON.parse(responseText) as T;
}

export async function getCurrentCustomer(
  signal?: AbortSignal,
): Promise<MartCustomerProfile> {
  const payload = await authorizedRequest<UnknownRecord>(
    "/Users/me",
    {
      method: "GET",
    },
    signal,
  );

  return {
    name:
      readString(payload, "name", "Name", "fullName", "FullName") ||
      "NexusMart customer",

    email: readString(payload, "email", "Email") || "Email unavailable",
  };
}

export async function getLinkedBanks(
  signal?: AbortSignal,
): Promise<LinkedBankAccount[]> {
  const payload = await authorizedRequest<unknown>(
    "/Bank/Get-Bank",
    {
      method: "GET",
    },
    signal,
  );

  if (!Array.isArray(payload)) {
    throw new Error("The linked-bank API returned an invalid response.");
  }

  return payload
    .filter(
      (item): item is UnknownRecord =>
        typeof item === "object" && item !== null,
    )
    .map((bank) => ({
      linkId: readNumber(bank, "linkId", "LinkId", "linkid"),

      fullName:
        readString(bank, "fullName", "FullName") || "NexusCore customer",

      accountNumber: readString(bank, "accountNumber", "AccountNumber"),
    }))
    .filter((bank) => bank.linkId > 0);
}

export async function linkBankAccount(
  request: LinkBankRequest,
): Promise<string> {
  const payload = await authorizedRequest<UnknownRecord>("/Bank/link-bank", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      AccountNumber: request.accountNumber.trim(),

      FullName: request.fullName.trim(),
    }),
  });

  return (
    readString(payload, "message", "Message") ||
    "NexusCore Bank account linked successfully."
  );
}

export async function disconnectBankAccount(
  accountNumber: string,
): Promise<string> {
  const encodedAccountNumber = encodeURIComponent(accountNumber);

  const payload = await authorizedRequest<UnknownRecord>(
    `/Bank/disconnect-bank?accountnumber=${encodedAccountNumber}`,
    {
      method: "DELETE",
    },
  );

  return (
    readString(payload, "message", "Message") || "Bank account disconnected."
  );
}

export async function getMyOrders(
  signal?: AbortSignal,
): Promise<CustomerOrder[]> {
  const payload = await authorizedRequest<unknown>(
    "/Order/my-orders",
    {
      method: "GET",
    },
    signal,
  );

  if (!Array.isArray(payload)) {
    throw new Error("The orders API returned an invalid response.");
  }

  return payload
    .filter(
      (item): item is UnknownRecord =>
        typeof item === "object" && item !== null,
    )
    .map((order) => ({
      orderId: readNumber(order, "orderId", "OrderId", "orderid"),

      orderDate: readString(order, "orderDate", "OrderDate"),

      totalAmount: readNumber(order, "totalAmount", "TotalAmount"),

      status: readString(order, "status", "Status") || "Processing",
    }))
    .filter((order) => order.orderId > 0)
    .sort(
      (first, second) =>
        new Date(second.orderDate).getTime() -
        new Date(first.orderDate).getTime(),
    );
}

export async function getOrderDetails(
  orderId: number,
  signal?: AbortSignal,
): Promise<CustomerOrderItem[]> {
  const payload = await authorizedRequest<unknown>(
    `/Order/my-orders/orders/${orderId}/details`,
    {
      method: "GET",
    },
    signal,
  );

  if (!Array.isArray(payload)) {
    throw new Error("The order details API returned an invalid response.");
  }

  return payload
    .filter(
      (item): item is UnknownRecord =>
        typeof item === "object" && item !== null,
    )
    .map((item) => {
      const imagePath = readString(item, "imageUrl", "ImageUrl");

      return {
        productName:
          readString(item, "productName", "ProductName") || "NexusMart product",

        imageUrl: resolveProductImageUrl(imagePath),

        quantity: readNumber(item, "quantity", "Quantity"),

        unitPrice: readNumber(item, "unitPrice", "UnitPrice"),

        subtotal: readNumber(item, "subtotal", "Subtotal"),
      };
    });
}
