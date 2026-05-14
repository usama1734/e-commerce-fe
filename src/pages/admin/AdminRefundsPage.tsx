import {
  Badge,
  Button,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
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

type RefundRow = {
  id: number;
  orderId: number;
  userId: number;
  reason: string;
  status: string;
  orderTotal: number;
  orderStatus: OrderStatus;
  paymentMethod: string;
  createdAt: string;
};

export function AdminRefundsPage() {
  const { accessToken } = useOutletContext<AdminOutletContext>();
  const toast = useToast();
  const [rows, setRows] = useState<RefundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: number; note: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ refundRequests: RefundRow[] }>("/admin/refund-requests", {
        params: { status: "pending" },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setRows(res.data.refundRequests);
    } catch {
      toast({ title: "Failed to load refund requests", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [accessToken, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function approve(id: number) {
    setApprovingId(id);
    try {
      await api.post(`/admin/refund-requests/${id}/approve`, {}, { headers: { Authorization: `Bearer ${accessToken}` } });
      toast({ title: "Refund completed", status: "success" });
      await load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ title: "Approve failed", description: msg || "", status: "error" });
    } finally {
      setApprovingId(null);
    }
  }

  async function confirmReject() {
    if (!rejectModal) return;
    setRejectingId(rejectModal.id);
    try {
      await api.post(
        `/admin/refund-requests/${rejectModal.id}/reject`,
        { adminNote: rejectModal.note.trim() || undefined },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      toast({ title: "Refund request rejected", status: "info" });
      setRejectModal(null);
      await load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ title: "Reject failed", description: msg || "", status: "error" });
    } finally {
      setRejectingId(null);
    }
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Heading size="lg">Refund requests</Heading>
      <Text fontSize="sm" color="gray.600">
        Pending customer requests. Approving a Stripe order triggers a Stripe refund; COD orders are marked refunded manually.
      </Text>
      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <Text color="gray.600">No pending refund requests.</Text>
      ) : (
        <TableContainer borderWidth="1px" borderRadius="xl" bg="white">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Req</Th>
                <Th>Order</Th>
                <Th>Order status</Th>
                <Th>Pay</Th>
                <Th>Reason</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((r) => (
                <Tr key={r.id}>
                  <Td>#{r.id}</Td>
                  <Td fontWeight="600">#{r.orderId}</Td>
                  <Td>
                    <Badge colorScheme={orderStatusColor(r.orderStatus)} fontSize="0.65rem">
                      {formatOrderStatus(r.orderStatus)}
                    </Badge>
                  </Td>
                  <Td textTransform="uppercase">{r.paymentMethod}</Td>
                  <Td maxW="220px">
                    <Text fontSize="sm" noOfLines={3}>
                      {r.reason || "—"}
                    </Text>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="green"
                        isLoading={approvingId === r.id}
                        onClick={() => void approve(r.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        isDisabled={approvingId === r.id}
                        onClick={() => setRejectModal({ id: r.id, note: "" })}
                      >
                        Reject
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
      <Button variant="ghost" alignSelf="flex-start" onClick={() => void load()}>
        Refresh
      </Button>

      <Modal isOpen={Boolean(rejectModal)} onClose={() => setRejectModal(null)} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="xl" mx={3}>
          <ModalHeader>Reject refund request?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color="gray.600" mb={2}>
              Optional note for the audit trail.
            </Text>
            <Textarea
              placeholder="Note"
              value={rejectModal?.note ?? ""}
              onChange={(e) =>
                setRejectModal((prev) => (prev ? { ...prev, note: e.target.value } : null))
              }
            />
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="outline" onClick={() => setRejectModal(null)}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              isLoading={Boolean(rejectModal && rejectingId === rejectModal.id)}
              onClick={() => void confirmReject()}
            >
              Reject
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
