import { API_BASE_URL } from "./productService";

export interface LinkedBankAccount {
  linkId: number;
  fullName: string;
  accountNumber: string;
}

export interface PlaceOrderItem {
  productId: number;
  quantity: number;
}

export interface PlaceOrderRequest {
  linkId: number;
  items: PlaceOrderItem[];
}

export interface PlaceOrderResponse {
  orderId: number;
  message?: string;
}

type UnknownResponse = Record<string, unknown>;

function getAuthToken(): string | null {
  return localStorage.getItem("nexusmart_token");
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

function readNumber(source: UnknownResponse, ...keys: string[]): number {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  return 0;
}

function readString(source: UnknownResponse, ...keys: string[]): string {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
  }

  return "";
}

function normalizeLinkedBank(bank: UnknownResponse): LinkedBankAccount {
  return {
    linkId: readNumber(bank, "linkId", "LinkId", "linkid"),

    fullName: readString(bank, "fullName", "FullName") || "NexusCore customer",

    accountNumber: readString(bank, "accountNumber", "AccountNumber"),
  };
}

export async function getLinkedBankAccounts(
  signal?: AbortSignal,
): Promise<LinkedBankAccount[]> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  const response = await fetch(`${API_BASE_URL}/Bank/Get-Bank`, {
    method: "GET",

    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },

    signal,
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        "Could not load your linked bank accounts.",
      ),
    );
  }

  const payload: unknown = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error("The linked-bank API returned an invalid response.");
  }

  return payload
    .filter(
      (item): item is UnknownResponse =>
        typeof item === "object" && item !== null,
    )
    .map(normalizeLinkedBank)
    .filter((bank) => bank.linkId > 0);
}

export async function placeOrder(
  request: PlaceOrderRequest,
): Promise<PlaceOrderResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  const response = await fetch(`${API_BASE_URL}/Order/place-order`, {
    method: "POST",

    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(request),
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "NexusCore payment was declined."),
    );
  }

  const payload = (await response.json()) as UnknownResponse;

  const orderId = readNumber(
    payload,
    "orderid",
    "orderId",
    "OrderId",
    "OrderID",
  );

  if (orderId <= 0) {
    throw new Error(
      "The order was created, but the server did not return a valid order number.",
    );
  }

  return {
    orderId,

    message: readString(payload, "message", "Message"),
  };
}
