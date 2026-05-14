import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Heading,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { api } from "@/services/api";
import type { OrderSummary } from "@/types";
import { formatOrderStatus, orderStatusColor } from "@/utils/orderStatus";

type OrdersPageProps = {
  accessToken: string;
};

export function OrdersPage({ accessToken }: OrdersPageProps) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [nextBeforeId, setNextBeforeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (beforeId?: number) => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string | number> = {};
      if (beforeId != null) params.beforeId = beforeId;
      const res = await api.get<{ orders: OrderSummary[]; nextBeforeId: number | null }>("/orders", {
        params,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setOrders((prev) => (beforeId != null ? [...prev, ...res.data.orders] : res.data.orders));
      setNextBeforeId(res.data.nextBeforeId);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Could not load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return (
    <VStack align="stretch" spacing={6}>
      <Heading size="lg">My orders</Heading>
      {loading && orders.length === 0 ? (
        <Spinner />
      ) : error ? (
        <Text color="red.600">{error}</Text>
      ) : orders.length === 0 ? (
        <Text color="gray.600">You have not placed any orders yet.</Text>
      ) : (
        <>
          <TableContainer borderWidth="1px" borderRadius="xl" borderColor="gray.200" bg="white">
            <Table size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Order</Th>
                  <Th>Date</Th>
                  <Th>Total</Th>
                  <Th>Payment</Th>
                  <Th>Status</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {orders.map((o) => (
                  <Tr key={o.id}>
                    <Td fontWeight="600">#{o.id}</Td>
                    <Td>{new Date(o.createdAt).toLocaleString()}</Td>
                    <Td>PKR {o.total.toLocaleString()}</Td>
                    <Td textTransform="uppercase">{o.paymentMethod}</Td>
                    <Td>
                      <Badge colorScheme={orderStatusColor(o.status)}>{formatOrderStatus(o.status)}</Badge>
                    </Td>
                    <Td>
                      <Button as={RouterLink} to={`/orders/${o.id}`} size="sm" variant="outline">
                        View
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          {nextBeforeId != null ? (
            <Button
              variant="outline"
              alignSelf="flex-start"
              isLoading={loading}
              onClick={() => void load(nextBeforeId)}
            >
              Load more
            </Button>
          ) : null}
        </>
      )}
      <Box>
        <Button as={RouterLink} to="/" variant="ghost">
          Back to shop
        </Button>
      </Box>
    </VStack>
  );
}
