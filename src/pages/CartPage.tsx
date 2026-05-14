import { CartDetails } from "@/components/cart/CartDetails";
import type { CartItem, CartPricing } from "@/types";

type CartPageProps = {
  cartItems: CartItem[];
  cartPricing: CartPricing;
  isPricingLoading: boolean;
  onDecrease: (item: CartItem) => void;
  onIncrease: (item: CartItem) => void;
  onRemove: (productId: number) => void;
  onClearCart: () => void;
  onContinueShopping: () => void;
  onPlaceOrder: () => void;
};

export function CartPage(props: CartPageProps) {
  return <CartDetails {...props} />;
}
