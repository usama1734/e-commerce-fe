import type { OrderStatus } from "@/types";

const LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export const ORDER_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export function formatOrderStatus(status: string): string {
  return LABELS[status as OrderStatus] ?? status;
}

export function orderStatusColor(status: string): string {
  if (status === "DELIVERED") return "green";
  if (status === "REFUNDED") return "purple";
  if (status === "CANCELLED") return "red";
  if (status === "PENDING") return "orange";
  return "blue";
}
