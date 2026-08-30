export type SalesOrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export const SALES_ORDER_STATUS = {
  DRAFT: "DRAFT",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const satisfies Record<
  SalesOrderStatus,
  SalesOrderStatus
>;

export function canConfirmSalesOrder(
  status: SalesOrderStatus,
): boolean {
  return status === "DRAFT";
}

export function canProcessSalesOrder(
  status: SalesOrderStatus,
): boolean {
  return status === "CONFIRMED";
}

export function canCompleteSalesOrder(
  status: SalesOrderStatus,
): boolean {
  return status === "PROCESSING";
}

export function canCancelSalesOrder(
  status: SalesOrderStatus,
): boolean {
  return (
    status === "DRAFT" ||
    status === "CONFIRMED"
  );
}

export function canRefundSalesOrder(
  status: SalesOrderStatus,
): boolean {
  return status === "COMPLETED";
}

export function isTerminalSalesOrderStatus(
  status: SalesOrderStatus,
): boolean {
  return (
    status === "COMPLETED" ||
    status === "CANCELLED" ||
    status === "REFUNDED"
  );
}
