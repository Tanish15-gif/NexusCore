export type ProductCategory =
  | "Groceries"
  | "Electronics"
  | "Gaming"
  | "Software";

export interface MartProduct {
  id: number;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  badge?: string;
  inStock: boolean;
}

export const products: MartProduct[] = [
  {
    id: 1,
    name: "Nexus Mechanical Gaming Keyboard",
    category: "Gaming",
    price: 3499,
    originalPrice: 4299,
    rating: 4.8,
    reviewCount: 214,
    imageUrl: "/images/gaming-keyboard.png",
    badge: "Bank offer",
    inStock: true,
  },
  {
    id: 2,
    name: "UltraView 27-inch QHD Monitor",
    category: "Electronics",
    price: 18999,
    originalPrice: 21999,
    rating: 4.7,
    reviewCount: 168,
    imageUrl: "/images/monitor.png",
    badge: "Best seller",
    inStock: true,
  },
  {
    id: 3,
    name: "Pulse Wireless Gaming Headset",
    category: "Gaming",
    price: 2799,
    originalPrice: 3499,
    rating: 4.6,
    reviewCount: 126,
    imageUrl: "/images/gaming-headset.png",
    inStock: true,
  },
  {
    id: 4,
    name: "Fresh Essentials Grocery Pack",
    category: "Groceries",
    price: 999,
    originalPrice: 1199,
    rating: 4.5,
    reviewCount: 83,
    imageUrl: "/images/grocery-pack.png",
    badge: "Value pack",
    inStock: true,
  },
  {
    id: 5,
    name: "Nexus Productivity Suite Pro",
    category: "Software",
    price: 1499,
    rating: 4.9,
    reviewCount: 302,
    imageUrl: "/images/software-suite.png",
    badge: "Instant delivery",
    inStock: true,
  },
  {
    id: 6,
    name: "SmartCharge 65W GaN Adapter",
    category: "Electronics",
    price: 2299,
    originalPrice: 2799,
    rating: 4.7,
    reviewCount: 191,
    imageUrl: "/images/gan-charger.png",
    inStock: true,
  },
];
