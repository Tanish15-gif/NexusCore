const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!rawApiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is missing. Add it to .env.development.");
}

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

export const GOOGLE_LOGIN_URL = `${API_BASE_URL}/Users/login-google`;

const TOKEN_STORAGE_KEY = "nexus_token";

/* =========================================================
   REGISTER
========================================================= */

export interface RegisterRequest {
  FullName: string;
  Email: string;
  Password: string;
  PhoneNumber: string;
  Address: string;
  DateofBirth: string;
}

export interface RegisterResponse {
  message: string;
}

/* =========================================================
   LOGIN
========================================================= */

export interface LoginRequest {
  Email: string;
  Password: string;
}

export interface LoginResponse {
  token: string;
  message: string;
}

interface ApiErrorResponse {
  message?: string;
  Message?: string;
  title?: string;
  errors?: Record<string, string[]>;
}

interface RawLoginResponse {
  token?: string;
  Token?: string;
  message?: string;
  Message?: string;
}

/* =========================================================
   RESPONSE HELPERS
========================================================= */

async function readResponseBody(response: Response): Promise<unknown> {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
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
    const validationErrors = Object.values(errorData.errors).flat();

    if (validationErrors.length > 0) {
      return validationErrors.join(" ");
    }
  }

  if (errorData.title) {
    return errorData.title;
  }

  return null;
}

/* =========================================================
   REGISTER API
========================================================= */

export async function registerUser(
  registerData: RegisterRequest,
): Promise<RegisterResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/Users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(registerData),
    });
  } catch {
    throw new Error(
      "Unable to connect to the NexusCore server. Make sure the backend is running on port 5066.",
    );
  }

  const data = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data) ??
        `Registration failed with status ${response.status}.`,
    );
  }

  if (data && typeof data === "object") {
    const result = data as {
      message?: string;
      Message?: string;
    };

    return {
      message:
        result.message ?? result.Message ?? "Account created successfully.",
    };
  }

  return {
    message: "Account created successfully.",
  };
}

/* =========================================================
   LOGIN API
========================================================= */

export async function loginUser(
  loginData: LoginRequest,
): Promise<LoginResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/Users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(loginData),
    });
  } catch {
    throw new Error(
      "Unable to connect to the NexusCore server. Make sure the backend is running on port 5066.",
    );
  }

  const data = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data) ?? `Login failed with status ${response.status}.`,
    );
  }

  if (!data || typeof data !== "object") {
    throw new Error("The server returned an invalid login response.");
  }

  const loginResponse = data as RawLoginResponse;

  const token = loginResponse.token ?? loginResponse.Token;

  if (!token) {
    throw new Error("Login succeeded, but the server did not return a token.");
  }

  return {
    token,
    message:
      loginResponse.message ?? loginResponse.Message ?? "Login successful.",
  };
}

/* =========================================================
   TOKEN STORAGE
========================================================= */

export function saveAuthToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

/* =========================================================
   JWT DECODING
========================================================= */

export interface JwtPayload {
  exp?: number;
  role?: string | string[];
  Role?: string | string[];
  [key: string]: unknown;
}

export function decodeJwtToken(token: string): JwtPayload | null {
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

    const decodedPayload = atob(paddedPayload);

    const bytes = Uint8Array.from(decodedPayload, (character) =>
      character.charCodeAt(0),
    );

    const jsonPayload = new TextDecoder().decode(bytes);

    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

export function getRoleFromToken(token: string): string | null {
  const payload = decodeJwtToken(token);

  if (!payload) {
    return null;
  }

  const claimRole =
    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  const role = claimRole ?? payload.role ?? payload.Role;

  if (Array.isArray(role)) {
    return role[0] ?? null;
  }

  return typeof role === "string" ? role : null;
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtToken(token);

  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
}

export function getDashboardPath(role: string | null): string {
  switch (role?.toLowerCase()) {
    case "customer":
      return "/dashboard/accounts";

    case "employee":
      return "/employee/approvals";

    case "manager":
      return "/manager/deposits";

    case "admin":
    case "superadmin":
      return "/admin/overview";

    default:
      return "/";
  }
}

export interface GoogleLoginCookies {
  token: string | null;
  name: string | null;
  pictureUrl: string | null;
}
export interface GoogleLoginResult {
  token: string | null;
  name: string | null;
  pictureUrl: string | null;
}

function decodeCookieValue(value: string): string {
  let result = value;

  /*
   * Handles old values that may have been
   * encoded more than once.
   */
  for (let index = 0; index < 3; index++) {
    try {
      const decoded = decodeURIComponent(result);

      if (decoded === result) {
        break;
      }

      result = decoded;
    } catch {
      break;
    }
  }

  return result;
}

function readCookie(cookieName: string): string | null {
  const prefix = `${cookieName}=`;

  const cookieEntry = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(prefix));

  if (!cookieEntry) {
    return null;
  }

  const rawValue = cookieEntry.substring(prefix.length);

  return decodeCookieValue(rawValue);
}

function deleteCookie(cookieName: string): void {
  document.cookie =
    `${cookieName}=; ` +
    "expires=Thu, 01 Jan 1970 00:00:00 GMT; " +
    "path=/; SameSite=Lax";
}

export function consumeGoogleLoginCookies(): GoogleLoginResult {
  const token = readCookie("temp_nexus_token");

  const name = readCookie("temp_nexus_name");

  const pictureUrl = readCookie("temp_nexus_picture");

  if (token) {
    localStorage.setItem("nexus_token", token);
  }

  if (name) {
    localStorage.setItem("nexus_google_name", name);
  }

  if (pictureUrl && pictureUrl.startsWith("http")) {
    localStorage.setItem("nexus_google_picture", pictureUrl);
  } else {
    localStorage.removeItem("nexus_google_picture");
  }

  deleteCookie("temp_nexus_token");
  deleteCookie("temp_nexus_name");
  deleteCookie("temp_nexus_picture");

  return {
    token,
    name,
    pictureUrl,
  };
}
