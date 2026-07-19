import type { Product } from "../types/product";

const CART_STORAGE_KEY = "nexusmart_cart";

export const CART_UPDATED_EVENT = "nexusmart:cart-updated";

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stockQuantity: number;
}

function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));

  window.dispatchEvent(
    new CustomEvent(CART_UPDATED_EVENT, {
      detail: {
        items,
        count: getCartCount(items),
      },
    }),
  );
}

export function getCartItems(): CartItem[] {
  const savedCart = localStorage.getItem(CART_STORAGE_KEY);

  if (!savedCart) {
    return [];
  }

  try {
    const parsedCart: unknown = JSON.parse(savedCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    return parsedCart.filter(
      (item): item is CartItem =>
        typeof item === "object" &&
        item !== null &&
        typeof item.productId === "number" &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        typeof item.quantity === "number",
    );
  } catch {
    return [];
  }
}

export function getCartCount(items: CartItem[] = getCartItems()): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function addProductToCart(product: Product, quantity = 1): CartItem[] {
  if (product.stockQuantity <= 0) {
    throw new Error("This product is currently out of stock.");
  }

  const safeQuantity = Math.max(
    1,
    Math.min(Math.floor(quantity), product.stockQuantity),
  );

  const cartItems = getCartItems();

  const existingItem = cartItems.find((item) => item.productId === product.id);

  if (existingItem) {
    existingItem.quantity = Math.min(
      existingItem.quantity + safeQuantity,
      product.stockQuantity,
    );

    existingItem.stockQuantity = product.stockQuantity;
  } else {
    cartItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: safeQuantity,
      stockQuantity: product.stockQuantity,
    });
  }

  saveCart(cartItems);

  return cartItems;
}

export function updateCartQuantity(
  productId: number,
  quantity: number,
): CartItem[] {
  const cartItems = getCartItems();

  const item = cartItems.find((cartItem) => cartItem.productId === productId);

  if (!item) {
    return cartItems;
  }

  item.quantity = Math.max(
    1,
    Math.min(Math.floor(quantity), item.stockQuantity),
  );

  saveCart(cartItems);

  return cartItems;
}

export function removeProductFromCart(productId: number): CartItem[] {
  const cartItems = getCartItems().filter(
    (item) => item.productId !== productId,
  );

  saveCart(cartItems);

  return cartItems;
}

export function clearCart(): void {
  saveCart([]);
}
