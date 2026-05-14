import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Spinner,
  Text,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { api } from "@/services/api";
import type { OrderLineItem, OrderPaymentMethod, OrderStatus, RefundRequestSummary } from "@/types";
import { ORDER_FLOW, formatOrderStatus, orderStatusColor } from "@/utils/orderStatus";

type OrderDetail = {
  id: number;
  subtotal: number;
  gst: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: OrderPaymentMethod;
  createdAt: string;
  updatedAt: string;
};

type OrderDetailPageProps = {
  accessToken: string;
};

export function OrderDetailPage({ accessToken }: OrderDetailPageProps) {
  const { orderId } = useParams<{ orderId: string }>();
  const toast = useToast();
  const [detail, setDetail] = useState<{
    order: OrderDetail;
    items: OrderLineItem[];
    refundRequests: RefundRequestSummary[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const idNum = orderId ? Number(orderId) : NaN;

  const refresh = async () => {
    if (!Number.isFinite(idNum)) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get<{
        order: OrderDetail;
        items: OrderLineItem[];
        refundRequests: RefundRequestSummary[];
      }>(`/orders/${idNum}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setDetail(res.data);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Could not load order");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, idNum]);

  const pendingRefund = useMemo(
    () => detail?.refundRequests?.find((r) => r.status === "pending"),
    [detail],
  );

  const canRequestRefund = useMemo(() => {
    if (!detail?.order) return false;
    const s = detail.order.status;
    if (s === "REFUNDED" || s === "CANCELLED") return false;
    return !pendingRefund;
  }, [detail, pendingRefund]);

  async function submitRefundRequest() {
    if (!Number.isFinite(idNum)) return;
    setSubmitting(true);
    try {
      await api.post(
        `/orders/${idNum}/refund-requests`,
        { reason: reason.trim() },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      toast({ title: "Refund request submitted", status: "success", duration: 4000 });
      setReason("");
      await refresh();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ title: "Request failed", description: msg || "Try again later", status: "error", duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  }

  if (!Number.isFinite(idNum)) {
    return <Text>Invalid order</Text>;
  }

  if (loading && !detail) return <Spinner />;
  if (error || !detail) return <Text color="red.600">{error || "Not found"}</Text>;

  const { order, items, refundRequests } = detail;
  const flowIndex = ORDER_FLOW.indexOf(order.status);

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between" flexWrap="wrap" gap={3}>
        <Heading size="lg">Order #{order.id}</Heading>
        <Badge colorScheme={orderStatusColor(order.status)} fontSize="0.9em" px={2} py={1}>
          {formatOrderStatus(order.status)}
        </Badge>
      </HStack>

      <Box borderWidth="1px" borderRadius="xl" p={5} bg="white" borderColor="gray.200">
        <Text color="gray.600" fontSize="sm">
          Placed {new Date(order.createdAt).toLocaleString()} · Payment:{" "}
          <Text as="span" fontWeight="700" textTransform="uppercase">
            {order.paymentMethod}
          </Text>
        </Text>
        <Text mt={2} fontWeight="600">
          Total PKR {order.total.toLocaleString()}
        </Text>
      </Box>

      {order.status === "CANCELLED" || order.status === "REFUNDED" ? (
        <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
          <Text fontWeight="600">This order is {formatOrderStatus(order.status).toLowerCase()}.</Text>
        </Box>
      ) : (
        <Box borderWidth="1px" borderRadius="xl" p={5} bg="gray.50" borderColor="gray.200">
          <Text fontWeight="700" mb={3} fontSize="sm" color="gray.700">
            Tracking
          </Text>
          <VStack align="stretch" spacing={2}>
            {ORDER_FLOW.map((step, i) => {
              const done = flowIndex > i || (flowIndex === i && order.status === step);
              const current = flowIndex === i && order.status === step;
              return (
                <HStack key={step} spacing={3}>
                  <Box
                    w="10px"
                    h="10px"
                    borderRadius="full"
                    bg={done || current ? "brand.500" : "gray.300"}
                    flexShrink={0}
                  />
                  <Text
                    fontWeight={current ? "700" : "500"}
                    color={done || current ? "gray.800" : "gray.500"}
                  >
                    {formatOrderStatus(step)}
                    {current ? " (current)" : ""}
                  </Text>
                </HStack>
              );
            })}
          </VStack>
        </Box>
      )}

      <Box>
        <Heading size="md" mb={3}>
          Items
        </Heading>
        <VStack align="stretch" spacing={2} divider={<Divider />}>
          {items.map((line) => (
            <HStack key={line.id} justify="space-between" flexWrap="wrap">
              <Box>
                <Text fontWeight="600">{line.productName}</Text>
                <Text fontSize="sm" color="gray.600">
                  {line.color} / {line.size} × {line.quantity}
                </Text>
              </Box>
              <Text fontWeight="600">PKR {line.total.toLocaleString()}</Text>
            </HStack>
          ))}
        </VStack>
      </Box>

      <Box borderWidth="1px" borderRadius="xl" p={5} borderColor="gray.200">
        <Heading size="sm" mb={3}>
          Refunds
        </Heading>
        {refundRequests.length === 0 ? (
          <Text fontSize="sm" color="gray.600">
            No refund requests for this order.
          </Text>
        ) : (
          <VStack align="stretch" spacing={3}>
            {refundRequests.map((r) => (
              <Box key={r.id} bg="gray.50" borderRadius="md" p={3}>
                <HStack justify="space-between">
                  <Badge>{r.status}</Badge>
                  <Text fontSize="xs" color="gray.500">
                    {new Date(r.createdAt).toLocaleString()}
                  </Text>
                </HStack>
                {r.reason ? (
                  <Text fontSize="sm" mt={2}>
                    {r.reason}
                  </Text>
                ) : null}
                {r.adminNote ? (
                  <Text fontSize="sm" mt={1} color="gray.700">
                    Admin: {r.adminNote}
                  </Text>
                ) : null}
              </Box>
            ))}
          </VStack>
        )}
        {canRequestRefund ? (
          <VStack align="stretch" mt={4} spacing={2}>
            <Text fontSize="sm" fontWeight="600">
              Request a refund
            </Text>
            <Textarea
              placeholder="Optional reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <Button colorScheme="purple" isLoading={submitting} onClick={() => void submitRefundRequest()}>
              Submit refund request
            </Button>
          </VStack>
        ) : pendingRefund ? (
          <Text mt={3} fontSize="sm" color="gray.600">
            A refund request is pending review.
          </Text>
        ) : null}
      </Box>

      <Button as={RouterLink} to="/orders" variant="outline" alignSelf="flex-start">
        All orders
      </Button>
    </VStack>
  );
}
