import { API_BASE_URL, getAuthToken, removeAuthToken } from "./authService";

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

export async function authorizedRequest<T>(
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
