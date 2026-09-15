import type { SupplierCreditLedgerEntry } from "../types/supplier-credit-ledger.types";

export interface SupplierCreditLedgerRepository {
  findAll(
    tenantId: string,
    storeId: string,
    supplierId?: string,
  ): Promise<SupplierCreditLedgerEntry[]>;
  create(
    entry: SupplierCreditLedgerEntry,
  ): Promise<SupplierCreditLedgerEntry>;
}
