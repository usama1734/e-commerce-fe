import type { Dispatch, SetStateAction } from "react";

export type Product = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  pricePkr: number;
  /** Optional list / compare-at price when greater than {@link Product.pricePkr} (sale). */
  compareAtPricePkr?: number | null;
  discountPercent?: number;
  brand: string;
  category: string;
  color: string;
  size: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type UserRole = "user" | "admin";

export type AuthUser = {
  id?: number;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  phone?: string;
  city?: string;
  addressLine?: string;
  logoUrl?: string;
  role?: UserRole;
};

export type AdminOutletContext = {
  accessToken: string;
};

export type AuthState = {
  user: AuthUser | null;
  accessToken: string;
  refreshToken: string;
};

export type Filters = {
  q: string;
  brand: string;
  category: string;
  color: string;
  size: string;
  minPrice: string;
  maxPrice: string;
  sortBy: "featured" | "price_low" | "price_high" | "newest" | "most_sold" | "biggest_discount";
};

export type HeroSlide = {
  title: string;
  subtitle: string;
};

export type CartPricing = {
  subtotal: number;
  gstRate: number;
  shipping: number;
  gst: number;
  grandTotal: number;
};

export type SetFilters = Dispatch<SetStateAction<Filters>>;
export type AddedMap = { [productId: number]: boolean };

export type CheckoutDetails = {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  addressLine: string;
  paymentMethod: "cod" | "card";
};

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type OrderPaymentMethod = "cod" | "stripe";

export type OrderSummary = {
  id: number;
  total: number;
  status: OrderStatus;
  paymentMethod: OrderPaymentMethod;
  createdAt: string;
};

export type RefundRequestStatus = "pending" | "approved" | "rejected" | "completed";

export type RefundRequestSummary = {
  id: number;
  status: RefundRequestStatus;
  reason: string;
  createdAt: string;
  decidedAt: string | null;
  adminNote: string | null;
};

export type OrderLineItem = {
  id: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  gst: number;
  total: number;
  variantId: number;
  color: string;
  size: string;
  productName: string;
  productId: number;
};

