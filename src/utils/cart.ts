import type { CartItem, CartPricing } from "@/types";

export function calculateCartPricing(items: CartItem[]): CartPricing {
  const subtotal = items.reduce((sum, item) => sum + item.product.pricePkr * item.quantity, 0);
  const gstRate = 0.18;
  const shipping = subtotal >= 8000 ? 0 : subtotal === 0 ? 0 : 250;
  const gst = Math.round(subtotal * gstRate);
  return { subtotal, gstRate, shipping, gst, grandTotal: subtotal + gst + shipping };
}
