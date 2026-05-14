import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Select,
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
  useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "@/services/api";
import type { AdminOutletContext, OrderStatus } from "@/types";
import { formatOrderStatus, orderStatusColor } from "@/utils/orderStatus";

type AdminOrderRow = {
  id: number;
  userId: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  userEmail: string;
};

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export function AdminOrdersPage() {
  const { accessToken } = useOutletContext<AdminOutletContext>();
  const toast = useToast();
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [nextBeforeId, setNextBeforeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingPatch, setPendingPatch] = useState<number | null>(null);
  const [draftStatus, setDraftStatus] = useState<Record<number, OrderStatus>>({});

  const load = useCallback(
    async (beforeId?: number) => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = {};
        if (beforeId != null) params.beforeId = beforeId;
        const res = await api.get<{ orders: AdminOrderRow[]; nextBeforeId: number | null }>("/admin/orders", {
          params,
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setOrders((prev) => (beforeId != null ? [...prev, ...res.data.orders] : res.data.orders));
        setNextBeforeId(res.data.nextBeforeId);
      } catch {
        toast({ title: "Failed to load orders", status: "error" });
      } finally {
        setLoading(false);
      }
    },
    [accessToken, toast],
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function applyStatus(orderId: number, status: OrderStatus) {
    setPendingPatch(orderId);
    try {
      await api.patch(
        `/admin/orders/${orderId}`,
        { status },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      toast({ title: "Order updated", status: "success" });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ title: "Update failed", description: msg || "", status: "error" });
    } finally {
      setPendingPatch(null);
    }
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Heading size="lg">Orders</Heading>
      {loading && orders.length === 0 ? (
        <Spinner />
      ) : (
        <TableContainer borderWidth="1px" borderRadius="xl" bg="white">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Customer</Th>
                <Th>Total</Th>
                <Th>Pay</Th>
                <Th>Status</Th>
                <Th>Change</Th>
              </Tr>
            </Thead>
            <Tbody>
              {orders.map((o) => (
                <Tr key={o.id}>
                  <Td fontWeight="700">#{o.id}</Td>
                  <Td>
                    <Text fontSize="sm" noOfLines={1}>
                      {o.userEmail}
                    </Text>
                  </Td>
                  <Td>PKR {o.total.toLocaleString()}</Td>
                  <Td textTransform="uppercase">{o.paymentMethod}</Td>
                  <Td>
                    <Badge colorScheme={orderStatusColor(o.status)}>{formatOrderStatus(o.status)}</Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Select
                        size="sm"
                        maxW="180px"
                        value={draftStatus[o.id] ?? o.status}
                        onChange={(e) =>
                          setDraftStatus((prev) => ({ ...prev, [o.id]: e.target.value as OrderStatus }))
                        }
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {formatOrderStatus(s)}
                          </option>
                        ))}
                      </Select>
                      <Button
                        size="sm"
                        colorScheme="purple"
                        isLoading={pendingPatch === o.id}
                        onClick={() =>
                          void applyStatus(o.id, draftStatus[o.id] ?? o.status)
                        }
                      >
                        Save
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
      {nextBeforeId != null ? (
        <Button variant="outline" alignSelf="flex-start" isLoading={loading} onClick={() => void load(nextBeforeId)}>
          Load more
        </Button>
      ) : null}
      <Box>
        <Button variant="ghost" onClick={() => void load()}>
          Refresh
        </Button>
      </Box>
    </VStack>
  );
}
