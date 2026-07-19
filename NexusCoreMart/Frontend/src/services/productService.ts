import type { Product } from "../types/product";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5168"
).replace(/\/$/, "");

type ApiProduct = Record<string, unknown>;

function getString(product: ApiProduct, ...keys: string[]): string {
  for (const key of keys) {
    const value = product[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
}

function getNumber(product: ApiProduct, ...keys: string[]): number {
  for (const key of keys) {
    const value = product[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim().length > 0) {
      const parsedValue = Number(value);

      if (Number.isFinite(parsedValue)) {
        return parsedValue;
      }
    }
  }

  return 0;
}

export function resolveProductImageUrl(imagePath?: string | null): string {
  const cleanPath = imagePath?.trim();

  if (!cleanPath) {
    return "/images/default-product.png";
  }

  if (
    cleanPath.startsWith("http://") ||
    cleanPath.startsWith("https://") ||
    cleanPath.startsWith("data:")
  ) {
    return cleanPath;
  }

  return `${API_BASE_URL}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`;
}

function normalizeProduct(rawProduct: ApiProduct): Product {
  const imagePath = getString(
    rawProduct,
    "imageUrl",
    "ImageUrl",
    "imageURL",
    "ImageURL",
  );

  return {
    id: getNumber(
      rawProduct,
      "productid",
      "Productid",
      "productId",
      "ProductId",
      "id",
      "Id",
    ),

    name:
      getString(rawProduct, "productName", "ProductName", "name", "Name") ||
      "Unnamed product",

    description:
      getString(rawProduct, "description", "Description") ||
      "No description is available for this product.",

    category: getString(rawProduct, "category", "Category") || "General",

    price: getNumber(rawProduct, "price", "Price"),

    imageUrl: resolveProductImageUrl(imagePath),

    stockQuantity: getNumber(
      rawProduct,
      "stockQuantity",
      "StockQuantity",
      "stock",
      "Stock",
    ),

    rating: getNumber(rawProduct, "rating", "Rating") || undefined,

    reviewCount:
      getNumber(
        rawProduct,
        "reviewCount",
        "ReviewCount",
        "reviews",
        "Reviews",
      ) || undefined,
  };
}

async function getErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const responseBody = (await response.json()) as {
      message?: string;
      title?: string;
    };

    return responseBody.message || responseBody.title || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function getAllProducts(signal?: AbortSignal): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/Product/all`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Could not load NexusMart products."),
    );
  }

  const responseBody: unknown = await response.json();

  if (!Array.isArray(responseBody)) {
    throw new Error("The products API returned an invalid response.");
  }

  return responseBody
    .filter(
      (item): item is ApiProduct => typeof item === "object" && item !== null,
    )
    .map(normalizeProduct)
    .filter((product) => product.id > 0);
}

export async function getProductById(
  productId: number,
  signal?: AbortSignal,
): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/Product/${productId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        response.status === 404
          ? "Product not found."
          : "Could not load this product.",
      ),
    );
  }

  const responseBody: unknown = await response.json();

  if (typeof responseBody !== "object" || responseBody === null) {
    throw new Error("The product API returned an invalid response.");
  }

  const product = normalizeProduct(responseBody as ApiProduct);

  if (product.id <= 0) {
    product.id = productId;
  }

  return product;
}
