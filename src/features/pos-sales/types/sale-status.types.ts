export type SaleStatus =
  | "DRAFT"
  | "COMPLETED"
  | "VOIDED";

export const SALE_STATUS = {
  DRAFT: "DRAFT",
  COMPLETED: "COMPLETED",
  VOIDED: "VOIDED",
} as const satisfies Record<SaleStatus, SaleStatus>;

export function canCompleteSale(
  status: SaleStatus,
): boolean {
  return status === "DRAFT";
}

export function canVoidSale(
  status: SaleStatus,
): boolean {
  return (
    status === "DRAFT" ||
    status === "COMPLETED"
  );
}

export function isTerminalSaleStatus(
  status: SaleStatus,
): boolean {
  return (
    status === "VOIDED"
  );
}
