export type SupplierCreditLedgerEntryType =
  | "PURCHASE"
  | "PAYMENT"
  | "PURCHASE_RETURN"
  | "ADJUSTMENT";

export interface SupplierCreditLedgerEntry {
  id: string;
  tenantId: string;
  storeId: string;
  supplierId: string;
  entryType: SupplierCreditLedgerEntryType;
  referenceType: string | null;
  referenceId: string | null;
  referenceNumber: string | null;
  description: string | null;
  debit: number;
  credit: number;
  createdAt: string;
}

export interface SupplierCreditBalance {
  supplierId: string;
  debit: number;
  credit: number;
  balance: number;
}
