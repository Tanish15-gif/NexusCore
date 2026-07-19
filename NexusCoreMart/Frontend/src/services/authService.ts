const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5168"
).replace(/\/$/, "");

const TOKEN_STORAGE_KEY = "nexusmart_token";
const USER_ID_STORAGE_KEY = "userid";

export const AUTH_CHANGED_EVENT = "nexusmart:auth-changed";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
}

export interface NexusMartJwtPayload {
  UserId?: string | number;
  userId?: string | number;
  userid?: string | number;

  role?: string | string[];
  Role?: string | string[];

  email?: string;
  Email?: string;

  exp?: number;

  [key: string]: unknown;
}

type UnknownResponse = Record<string, unknown>;

function readString(source: UnknownResponse, ...keys: string[]): string {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
}

async function readAuthResponse(response: Response): Promise<AuthResponse> {
  try {
    const payload = (await response.json()) as UnknownResponse;

    return {
      message:
        readString(payload, "message", "Message", "title", "Title") ||
        (response.ok
          ? "Request completed successfully."
          : "The server could not complete the request."),

      token:
        readString(payload, "token", "Token", "accessToken", "AccessToken") ||
        undefined,
    };
  } catch {
    return {
      message: response.ok
        ? "Request completed successfully."
        : "The server returned an unexpected response.",
    };
  }
}

export async function registerCustomer(
  request: RegisterRequest,
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/Users/register`, {
    method: "POST",

    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      Name: request.name.trim(),
      Email: request.email.trim().toLowerCase(),
      Password: request.password,
    }),
  });

  const result = await readAuthResponse(response);

  if (!response.ok) {
    throw new Error(
      result.message || "Could not create your NexusMart account.",
    );
  }

  return result;
}

export async function loginCustomer(
  request: LoginRequest,
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/Users/login`, {
    method: "POST",

    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      Email: request.email.trim().toLowerCase(),
      Password: request.password,
    }),
  });

  const result = await readAuthResponse(response);

  if (!response.ok) {
    throw new Error(result.message || "Invalid email or password.");
  }

  if (!result.token) {
    throw new Error(
      "Login succeeded, but the server did not return an authentication token.",
    );
  }

  return result;
}

export function decodeJwtToken(token: string): NexusMartJwtPayload | null {
  try {
    const tokenParts = token.split(".");

    if (tokenParts.length !== 3) {
      return null;
    }

    const encodedPayload = tokenParts[1].replace(/-/g, "+").replace(/_/g, "/");

    const paddedPayload = encodedPayload.padEnd(
      Math.ceil(encodedPayload.length / 4) * 4,
      "=",
    );

    const binaryPayload = window.atob(paddedPayload);

    const bytes = Uint8Array.from(binaryPayload, (character) =>
      character.charCodeAt(0),
    );

    const decodedJson = new TextDecoder().decode(bytes);

    return JSON.parse(decodedJson) as NexusMartJwtPayload;
  } catch {
    return null;
  }
}

export function getUserIdFromToken(token: string): string | null {
  const payload = decodeJwtToken(token);

  if (!payload) {
    return null;
  }

  const userId =
    payload.UserId ??
    payload.userId ??
    payload.userid ??
    payload[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] ??
    payload.sub;

  if (typeof userId !== "string" && typeof userId !== "number") {
    return null;
  }

  return String(userId);
}

export function getRoleFromToken(token: string): string | null {
  const payload = decodeJwtToken(token);

  if (!payload) {
    return null;
  }

  const role =
    payload.role ??
    payload.Role ??
    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  if (typeof role === "string") {
    return role;
  }

  if (Array.isArray(role) && typeof role[0] === "string") {
    return role[0];
  }

  return null;
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtToken(token);

  if (!payload || typeof payload.exp !== "number") {
    return false;
  }

  const currentUnixTime = Math.floor(Date.now() / 1000);

  return payload.exp <= currentUnixTime;
}

export function saveAuthSession(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);

  const userId = getUserIdFromToken(token);

  if (userId) {
    localStorage.setItem(USER_ID_STORAGE_KEY, userId);
  } else {
    localStorage.removeItem(USER_ID_STORAGE_KEY);
  }

  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getAuthToken(): string | null {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!token) {
    return null;
  }

  if (isTokenExpired(token)) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);

    localStorage.removeItem(USER_ID_STORAGE_KEY);

    return null;
  }

  return token;
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

export function removeAuthSession(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);

  localStorage.removeItem(USER_ID_STORAGE_KEY);

  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
