import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Skeleton,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FiArrowRight, FiLock, FiShoppingBag, FiTrash2 } from "react-icons/fi";
import { LazyImage } from "@/components/media/LazyImage";
import type { CartItem, CartPricing } from "@/types";

type CartDetailsProps = {
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

export function CartDetails({
  cartItems,
  cartPricing,
  isPricingLoading,
  onDecrease,
  onIncrease,
  onRemove,
  onClearCart,
  onContinueShopping,
  onPlaceOrder,
}: CartDetailsProps) {
  return (
    <>
      <Box
        bg="white"
        borderRadius="2xl"
        p={{ base: "5", md: "6" }}
        borderWidth="1px"
        borderColor="gray.200"
        mb="5"
        boxShadow="0 10px 24px rgba(15, 23, 42, 0.06)"
      >
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
          Shopping Bag
        </Text>
        <HStack spacing="2" mb="1" align="center">
          <FiShoppingBag />
          <Heading size="md">Your Cart</Heading>
        </HStack>
        <Text color="gray.600">Review selected items and continue to secure checkout.</Text>
      </Box>
      <Box
        bg="white"
        borderRadius="2xl"
        p={{ base: "4", md: "5" }}
        borderWidth="1px"
        borderColor="gray.200"
        boxShadow="0 10px 24px rgba(15, 23, 42, 0.06)"
      >
        {!cartItems.length ? <Text>No products selected yet.</Text> : null}
        <VStack spacing="3.5" align="stretch">
          {cartItems.map((item) => (
            <Flex
              key={item.product.id}
              justify="space-between"
              align={{ base: "flex-start", md: "center" }}
              direction={{ base: "column", md: "row" }}
              gap="3"
              p="3"
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="xl"
              bg="gray.50"
            >
              <HStack spacing="3.5">
                <LazyImage
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  boxSize="64px"
                  borderRadius="lg"
                  objectFit="cover"
                  rootMargin="120px"
                />
                <Box>
                  <Text fontWeight="700">{item.product.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {item.product.brand} | {item.product.size} | {item.product.color}
                  </Text>
                </Box>
              </HStack>
              <HStack wrap="wrap" justify={{ base: "flex-start", md: "flex-end" }} align="flex-end">
                <Button size="sm" variant="outline" onClick={() => onDecrease(item)}>
                  -
                </Button>
                <Text minW="24px" textAlign="center" fontWeight="600">
                  {item.quantity}
                </Text>
                <Button size="sm" variant="outline" onClick={() => onIncrease(item)}>
                  +
                </Button>
                <Button size="sm" variant="outline" onClick={() => onRemove(item.product.id)}>
                  Remove
                </Button>
                <VStack align="flex-end" spacing={0}>
                  {item.product.compareAtPricePkr != null &&
                  item.product.compareAtPricePkr > item.product.pricePkr ? (
                    <Text fontSize="xs" color="gray.400" textDecoration="line-through">
                      PKR {(item.product.compareAtPricePkr * item.quantity).toLocaleString()}
                    </Text>
                  ) : null}
                  <Text minW="95px" textAlign="right" fontWeight="700">
                    PKR {(item.product.pricePkr * item.quantity).toLocaleString()}
                  </Text>
                </VStack>
              </HStack>
            </Flex>
          ))}
        </VStack>
        <Divider my="4" />
        <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" borderRadius="xl" p="4">
          <HStack justify="space-between" mb="3" wrap="wrap">
            <Heading size="sm">Cart Totals</Heading>
            <Text fontSize="sm" color="gray.500">
              GST Rate: 18%
            </Text>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="3">
            <Skeleton isLoaded={!isPricingLoading} borderRadius="lg">
              <Stat
                bg="white"
                p="3"
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="lg"
                minH={{ base: "96px", md: "108px" }}
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
              >
                <StatLabel>Subtotal</StatLabel>
                <StatNumber fontSize="lg">PKR {cartPricing.subtotal.toLocaleString()}</StatNumber>
                <StatHelpText mb="0" visibility="hidden">
                  placeholder
                </StatHelpText>
              </Stat>
            </Skeleton>
            <Skeleton isLoaded={!isPricingLoading} borderRadius="lg">
              <Stat
                bg="white"
                p="3"
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="lg"
                minH={{ base: "96px", md: "108px" }}
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
              >
                <StatLabel>GST</StatLabel>
                <StatNumber fontSize="lg">PKR {cartPricing.gst.toLocaleString()}</StatNumber>
                <StatHelpText mb="0">Tax on subtotal</StatHelpText>
              </Stat>
            </Skeleton>
            <Skeleton isLoaded={!isPricingLoading} borderRadius="lg">
              <Stat
                bg="white"
                p="3"
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="lg"
                minH={{ base: "96px", md: "108px" }}
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
              >
                <StatLabel>Shipping</StatLabel>
                <StatNumber fontSize="lg">PKR {cartPricing.shipping.toLocaleString()}</StatNumber>
                <StatHelpText mb="0">Free above PKR 8,000</StatHelpText>
              </Stat>
            </Skeleton>
            <Skeleton isLoaded={!isPricingLoading} borderRadius="lg">
              <Stat
                bg="brand.600"
                p="3"
                borderWidth="1px"
                borderColor="brand.600"
                borderRadius="lg"
                color="white"
                minH={{ base: "96px", md: "108px" }}
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
              >
                <StatLabel color="whiteAlpha.900">Grand Total</StatLabel>
                <StatNumber fontSize="xl">PKR {cartPricing.grandTotal.toLocaleString()}</StatNumber>
                <StatHelpText color="whiteAlpha.800" mb="0">
                  Final payable amount
                </StatHelpText>
              </Stat>
            </Skeleton>
          </SimpleGrid>
        </Box>
        <HStack mt="4" mb="2" spacing="2" color="gray.500" fontSize="sm">
          <FiLock />
          <Text>Secure checkout with encrypted order processing.</Text>
        </HStack>
        <HStack mt="4" wrap="wrap" spacing="3">
          <Button variant="outline" onClick={onContinueShopping}>
            Continue Shopping
          </Button>
          <Button variant="outline" onClick={onClearCart} isDisabled={!cartItems.length} leftIcon={<FiTrash2 />}>
            Clear Cart
          </Button>
          <Button onClick={onPlaceOrder} isDisabled={!cartItems.length} rightIcon={<FiArrowRight />}>
            Proceed to Checkout
          </Button>
        </HStack>
      </Box>
    </>
  );
}
