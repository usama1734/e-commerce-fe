import { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FiCheckCircle, FiGift, FiShoppingBag } from "react-icons/fi";
import { ConfirmationSlider } from "@/components/checkout/ConfirmationSlider";
import { api } from "@/services/api";

type Slide = {
  title: string;
  subtitle: string;
};

type StripeVerifyState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "success";
      paid: boolean;
      amountTotalPkr: number;
      orderId: number | null;
      paymentStatus: string;
      orderStatus: string | null;
      paymentMethod: string | null;
    }
  | { status: "error"; message: string };

type OrderConfirmationPageProps = {
  codTotalFromNav?: number;
  codOrderIdFromNav?: number;
  lastOrderTotalFallback: number;
  accessToken: string;
  onStripePaidVerified?: (payload: { total: number }) => void;
  slides: Slide[];
  activeSlide: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onContinueShopping: () => void;
};

export function OrderConfirmationPage({
  codTotalFromNav,
  codOrderIdFromNav,
  lastOrderTotalFallback,
  accessToken,
  onStripePaidVerified,
  slides,
  activeSlide,
  onPrevSlide,
  onNextSlide,
  onContinueShopping,
}: OrderConfirmationPageProps) {
  const [searchParams] = useSearchParams();
  const stripeFlag = searchParams.get("stripe");
  const sessionId = searchParams.get("session_id");

  const needsStripeVerify =
    (stripeFlag === "success" || stripeFlag === "pending") && Boolean(sessionId);

  const paidCallbackFired = useRef(false);

  useEffect(() => {
    paidCallbackFired.current = false;
  }, [sessionId]);

  const [verify, setVerify] = useState<StripeVerifyState>(() =>
    needsStripeVerify ? { status: "loading" } : { status: "idle" }
  );

  useEffect(() => {
    if (!needsStripeVerify) {
      setVerify({ status: "idle" });
      return;
    }

    if (!accessToken) {
      setVerify({
        status: "error",
        message: "Please sign in to view your payment confirmation.",
      });
      return;
    }

    if (!sessionId) return;

    let cancelled = false;
    setVerify({ status: "loading" });

    api
      .get<{
        paid: boolean;
        amountTotalPkr: number;
        orderId: number | null;
        paymentStatus: string;
        orderStatus?: string | null;
        paymentMethod?: string | null;
      }>("/stripe/session-status", {
        params: { session_id: sessionId },
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        if (cancelled) return;
        setVerify({
          status: "success",
          paid: res.data.paid,
          amountTotalPkr: res.data.amountTotalPkr,
          orderId: res.data.orderId ?? null,
          paymentStatus: res.data.paymentStatus,
          orderStatus: res.data.orderStatus ?? null,
          paymentMethod: res.data.paymentMethod ?? null,
        });
      })
      .catch((err: { response?: { data?: { message?: string } } }) => {
        if (cancelled) return;
        setVerify({
          status: "error",
          message: err.response?.data?.message || "Could not verify payment",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [needsStripeVerify, sessionId, accessToken]);

  useEffect(() => {
    if (verify.status !== "success" || !verify.paid || paidCallbackFired.current) return;
    paidCallbackFired.current = true;
    onStripePaidVerified?.({ total: verify.amountTotalPkr });
  }, [verify, onStripePaidVerified]);

  const displayTotal = useMemo(() => {
    if (verify.status === "success") return verify.amountTotalPkr;
    return codTotalFromNav ?? lastOrderTotalFallback;
  }, [verify, codTotalFromNav, lastOrderTotalFallback]);

  const statusBanner = useMemo(() => {
    if (needsStripeVerify) {
      if (verify.status === "loading") {
        return (
          <HStack
            bg="blue.50"
            color="blue.800"
            borderWidth="1px"
            borderColor="blue.200"
            px="3"
            py="2"
            borderRadius="full"
            fontWeight="700"
            fontSize="sm"
          >
            <Spinner size="sm" />
            <Text>Verifying payment…</Text>
          </HStack>
        );
      }
      if (verify.status === "error") {
        return null;
      }
      if (verify.status === "success") {
        if (verify.paid) {
          return (
            <HStack
              bg="green.50"
              color="green.700"
              borderWidth="1px"
              borderColor="green.200"
              px="3"
              py="2"
              borderRadius="full"
              fontWeight="700"
              fontSize="sm"
            >
              <Icon as={FiCheckCircle} />
              <Text>Payment successful</Text>
            </HStack>
          );
        }
        return (
          <HStack
            bg="orange.50"
            color="orange.800"
            borderWidth="1px"
            borderColor="orange.200"
            px="3"
            py="2"
            borderRadius="full"
            fontWeight="700"
            fontSize="sm"
          >
            <Text>
              Payment status: {verify.paymentStatus}. If you believe this is wrong, contact support with your session id.
            </Text>
          </HStack>
        );
      }
    }

    return (
      <HStack
        bg="teal.50"
        color="teal.800"
        borderWidth="1px"
        borderColor="teal.200"
        px="3"
        py="2"
        borderRadius="full"
        fontWeight="700"
        fontSize="sm"
      >
        <Icon as={FiCheckCircle} />
        <Text>Cash on delivery — order placed</Text>
      </HStack>
    );
  }, [needsStripeVerify, verify]);

  const thankYouText = useMemo(() => {
    if (needsStripeVerify && verify.status === "loading") {
      return "Hang tight while we confirm your payment with Stripe.";
    }
    if (needsStripeVerify && verify.status === "error") {
      return "";
    }
    if (needsStripeVerify && verify.status === "success" && !verify.paid) {
      return "We could not confirm a completed payment. If an amount was captured, please contact support with your confirmation details.";
    }
    return `Thank you for shopping with us. Your order has been placed successfully for PKR ${displayTotal.toLocaleString()}.`;
  }, [needsStripeVerify, verify, displayTotal]);

  return (
    <VStack spacing="5" align="stretch">
      <Box
        bg="linear-gradient(120deg, #ffffff, #f6f3ff)"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="2xl"
        p={{ base: "6", md: "8" }}
        boxShadow="0 18px 40px rgba(17, 24, 39, 0.10)"
      >
        <VStack align="start" spacing="3">
          {statusBanner}
          {needsStripeVerify && verify.status === "error" ? (
            <Alert status="error" borderRadius="lg" fontSize="sm">
              <AlertIcon />
              {verify.message}
            </Alert>
          ) : null}
          <Heading size={{ base: "md", md: "lg" }}>Order Confirmed</Heading>
          {thankYouText ? (
            <Text color="gray.600" maxW="700px">
              {thankYouText}
            </Text>
          ) : null}
          {verify.status === "success" && verify.orderId ? (
            <VStack align="start" spacing={2}>
              <Text color="gray.700" fontWeight="600" fontSize="sm">
                Order reference #{verify.orderId}
              </Text>
              {verify.orderStatus ? (
                <Text fontSize="sm" color="gray.600">
                  Status: {verify.orderStatus.replace(/_/g, " ")}
                  {verify.paymentMethod ? ` · ${verify.paymentMethod.toUpperCase()}` : ""}
                </Text>
              ) : null}
              <Button as={RouterLink} to={`/orders/${verify.orderId}`} size="sm" colorScheme="purple" variant="outline">
                Track order
              </Button>
            </VStack>
          ) : null}
          {!needsStripeVerify && codOrderIdFromNav ? (
            <Button as={RouterLink} to={`/orders/${codOrderIdFromNav}`} size="sm" colorScheme="purple" variant="outline">
              Track order
            </Button>
          ) : null}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="3" w="full" pt="2">
            <HStack bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" p="3">
              <Icon as={FiShoppingBag} color="brand.600" />
              <Text fontWeight="600">Order total: PKR {displayTotal.toLocaleString()}</Text>
            </HStack>
            <HStack bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" p="3">
              <Icon as={FiGift} color="brand.600" />
              <Text fontWeight="600">Thanks for choosing Sapphire Store</Text>
            </HStack>
          </SimpleGrid>
          <Button mt="2" onClick={onContinueShopping}>
            Continue Shopping
          </Button>
        </VStack>
      </Box>
      <ConfirmationSlider slides={slides} activeIndex={activeSlide} onPrev={onPrevSlide} onNext={onNextSlide} />
    </VStack>
  );
}
