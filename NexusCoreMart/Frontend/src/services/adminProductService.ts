import { getAuthToken } from "./authService";

import { API_BASE_URL, resolveProductImageUrl } from "./productService";

type UnknownRecord = Record<string, unknown>;

export interface AdminProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  description: string;
  imageUrl: string;
  rawImageUrl: string;
}

export interface CreateProductRequest {
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  description: string;
  imageUrl: string;
}

export interface UpdateProductRequest extends CreateProductRequest {
  id: number;
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

function normalizeProduct(product: UnknownRecord): AdminProduct {
  const rawImageUrl = readString(
    product,
    "imageUrl",
    "ImageUrl",
    "imageURL",
    "ImageURL",
  );

  return {
    id: readNumber(
      product,
      "productid",
      "Productid",
      "productId",
      "ProductId",
      "id",
      "Id",
    ),

    name:
      readString(product, "productName", "ProductName", "name", "Name") ||
      "Unnamed product",

    category: readString(product, "category", "Category") || "General",

    price: readNumber(product, "price", "Price"),

    stockQuantity: readNumber(product, "stockQuantity", "StockQuantity"),

    description:
      readString(product, "description", "Description") ||
      "No description available.",

    rawImageUrl,

    imageUrl: resolveProductImageUrl(rawImageUrl),
  };
}

async function readErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as {
      message?: string;
      title?: string;
    };

    return body.message || body.title || fallback;
  } catch {
    return fallback;
  }
}

async function adminRequest<T>(
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

  if (response.status === 401 || response.status === 403) {
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

export async function getAdminProducts(
  signal?: AbortSignal,
): Promise<AdminProduct[]> {
  const payload = await adminRequest<unknown>(
    "/Product/all",
    {
      method: "GET",
    },
    signal,
  );

  if (!Array.isArray(payload)) {
    throw new Error("The products API returned an invalid response.");
  }

  return payload
    .filter(
      (item): item is UnknownRecord =>
        typeof item === "object" && item !== null,
    )
    .map(normalizeProduct)
    .filter((product) => product.id > 0);
}

export async function getAdminProductById(
  productId: number,
  signal?: AbortSignal,
): Promise<AdminProduct> {
  const payload = await adminRequest<UnknownRecord>(
    `/Product/${productId}`,
    {
      method: "GET",
    },
    signal,
  );

  const product = normalizeProduct(payload);

  if (product.id <= 0) {
    product.id = productId;
  }

  return product;
}

export async function uploadProductImage(file: File): Promise<string> {
  const formData = new FormData();

  formData.append("file", file);

  const payload = await adminRequest<UnknownRecord>("/Product/upload-image", {
    method: "POST",
    body: formData,
  });

  const imageUrl = readString(payload, "url", "Url", "imageUrl", "ImageUrl");

  if (!imageUrl) {
    throw new Error("The server did not return an image URL.");
  }

  return imageUrl;
}

export async function createProduct(
  request: CreateProductRequest,
): Promise<string> {
  const payload = await adminRequest<UnknownRecord>("/Product/add-product", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      ProductName: request.name.trim(),

      Category: request.category.trim(),

      Price: request.price,

      StockQuantity: request.stockQuantity,

      Description: request.description.trim(),

      ImageUrl: request.imageUrl,
    }),
  });

  return (
    readString(payload, "message", "Message") || "Product created successfully."
  );
}

export async function updateProduct(
  request: UpdateProductRequest,
): Promise<string> {
  const payload = await adminRequest<UnknownRecord>("/Product/update-product", {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      ProductId: request.id,

      ProductName: request.name.trim(),

      Category: request.category.trim(),

      Price: request.price,

      StockQuantity: request.stockQuantity,

      Description: request.description.trim(),

      ImageUrl: request.imageUrl,
    }),
  });

  return (
    readString(payload, "message", "Message") || "Product updated successfully."
  );
}

export async function deleteProduct(productId: number): Promise<string> {
  const payload = await adminRequest<UnknownRecord>(
    `/Product/remove/${productId}`,
    {
      method: "DELETE",
    },
  );

  return (
    readString(payload, "message", "Message") || "Product deleted successfully."
  );
}
