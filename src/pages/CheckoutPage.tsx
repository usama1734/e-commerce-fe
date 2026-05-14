import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { CartItem, CartPricing, CheckoutDetails } from "@/types";

type CheckoutPageProps = {
  cartItems: CartItem[];
  cartPricing: CartPricing;
  details: CheckoutDetails;
  onChange: (next: CheckoutDetails) => void;
  onBackToCart: () => void;
  onPlaceOrder: () => Promise<void>;
  isSubmitting: boolean;
  isPricingLoading: boolean;
};

export function CheckoutPage({
  cartItems,
  cartPricing,
  details,
  onChange,
  onBackToCart,
  onPlaceOrder,
  isSubmitting,
  isPricingLoading,
}: CheckoutPageProps) {
  const [searchParams] = useSearchParams();
  const stripeNotice = useMemo(() => {
    const s = searchParams.get("stripe");
    if (!s) return null;
    const map: Record<string, { status: "error" | "warning" | "info"; title: string; body: string }> = {
      cancel: {
        status: "info",
        title: "Checkout canceled",
        body: "You left Stripe Checkout before completing payment. Your cart is unchanged.",
      },
      unpaid: {
        status: "warning",
        title: "Payment not completed",
        body: "Stripe reports this session as unpaid. You can try card checkout again or choose cash on delivery.",
      },
      failed: {
        status: "error",
        title: "Payment was not successful",
        body: "The card or payment method was declined or failed. Try another method or COD.",
      },
      error: {
        status: "error",
        title: "Something went wrong",
        body: "We could not confirm your Stripe return. Try again from the cart or contact support.",
      },
      expired: {
        status: "warning",
        title: "Session expired",
        body: "This checkout session expired. Start checkout again from your cart.",
      },
    };
    return map[s] ?? {
      status: "warning" as const,
      title: "Stripe",
      body: `Status: ${s}`,
    };
  }, [searchParams]);

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="5">
      {stripeNotice ? (
        <Alert status={stripeNotice.status} borderRadius="xl" gridColumn={{ base: "1", lg: "1 / -1" }}>
          <AlertIcon />
          <Box>
            <Text fontWeight="700">{stripeNotice.title}</Text>
            <Text fontSize="sm" mt={1}>
              {stripeNotice.body}
            </Text>
          </Box>
        </Alert>
      ) : null}
      <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="2xl" p="6">
        <Text
          fontSize="xs"
          fontWeight="700"
          color="brand.600"
          bg="brand.50"
          display="inline-block"
          px="3"
          py="1"
          borderRadius="full"
          mb="3"
          letterSpacing="widest"
          textTransform="uppercase"
        >
          Checkout Step 1
        </Text>
        <Heading size="md" mb="4">
          Checkout Details
        </Heading>
        <VStack spacing="3" align="stretch">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="3">
            <FormControl>
              <FormLabel>First Name</FormLabel>
              <Input
                value={details.firstName}
                onChange={(e) => onChange({ ...details, firstName: e.target.value })}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Last Name</FormLabel>
              <Input
                value={details.lastName}
                onChange={(e) => onChange({ ...details, lastName: e.target.value })}
              />
            </FormControl>
          </SimpleGrid>
          <FormControl>
            <FormLabel>Phone</FormLabel>
            <Input value={details.phone} onChange={(e) => onChange({ ...details, phone: e.target.value })} />
          </FormControl>
          <FormControl>
            <FormLabel>City</FormLabel>
            <Input value={details.city} onChange={(e) => onChange({ ...details, city: e.target.value })} />
          </FormControl>
          <FormControl>
            <FormLabel>Address</FormLabel>
            <Input
              value={details.addressLine}
              onChange={(e) => onChange({ ...details, addressLine: e.target.value })}
            />
          </FormControl>
          <Text fontSize="sm" color="gray.500">
            Signup details are auto-filled here. You can still edit before placing order.
          </Text>
          <FormControl>
            <FormLabel>Payment Method</FormLabel>
            <Select
              value={details.paymentMethod}
              onChange={(e) => onChange({ ...details, paymentMethod: e.target.value as "cod" | "card" })}
            >
              <option value="cod">Cash on Delivery</option>
              <option value="card">Card (Stripe)</option>
            </Select>
          </FormControl>
        </VStack>
      </Box>

      <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="2xl" p="6" boxShadow="0 10px 28px rgba(15, 23, 42, 0.06)">
        <Text
          fontSize="xs"
          fontWeight="700"
          color="brand.600"
          bg="brand.50"
          display="inline-block"
          px="3"
          py="1"
          borderRadius="full"
          mb="3"
          letterSpacing="widest"
          textTransform="uppercase"
        >
          Checkout Step 2
        </Text>
        <Heading size="md" mb="4">
          Order Summary
        </Heading>
        <VStack align="stretch" spacing="3">
          {cartItems.map((item) => (
            <HStack key={item.product.id} justify="space-between" p="3" borderWidth="1px" borderColor="gray.100" borderRadius="xl">
              <Text>
                {item.product.name} x {item.quantity}
              </Text>
              <Text fontWeight="700">PKR {(item.product.pricePkr * item.quantity).toLocaleString()}</Text>
            </HStack>
          ))}
          <Box borderTop="1px solid" borderColor="gray.200" pt="3">
            <HStack justify="space-between">
              <Text color="gray.600">Subtotal</Text>
              <Text>{isPricingLoading ? "Calculating..." : `PKR ${cartPricing.subtotal.toLocaleString()}`}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">GST</Text>
              <Text>{isPricingLoading ? "Calculating..." : `PKR ${cartPricing.gst.toLocaleString()}`}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">Shipping</Text>
              <Text>{isPricingLoading ? "Calculating..." : `PKR ${cartPricing.shipping.toLocaleString()}`}</Text>
            </HStack>
            <HStack justify="space-between" mt="2">
              <Text fontWeight="700">Total</Text>
              <Text fontWeight="700">
                {isPricingLoading ? "Calculating..." : `PKR ${cartPricing.grandTotal.toLocaleString()}`}
              </Text>
            </HStack>
          </Box>
          <HStack pt="3" wrap="wrap" spacing="3">
            <Button variant="outline" onClick={onBackToCart}>
              Back to Cart
            </Button>
            <Button
              onClick={onPlaceOrder}
              isLoading={isSubmitting}
              loadingText="Placing Order"
              isDisabled={isPricingLoading || !cartItems.length}
            >
              Complete Checkout
            </Button>
          </HStack>
        </VStack>
      </Box>
    </SimpleGrid>
  );
}
