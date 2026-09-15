import type { SupplierCreditLedgerEntry } from "../types/supplier-credit-ledger.types";
import type { SupplierCreditLedgerRepository } from "./supplier-credit-ledger.repository";

class InMemorySupplierCreditLedgerRepository
  implements SupplierCreditLedgerRepository {
  private entries: SupplierCreditLedgerEntry[] = [];

  async findAll(
    tenantId: string,
    storeId: string,
    supplierId?: string,
  ): Promise<SupplierCreditLedgerEntry[]> {
    return this.entries.filter(
      (entry) =>
        entry.tenantId === tenantId &&
        entry.storeId === storeId &&
        (supplierId === undefined || entry.supplierId === supplierId),
    );
  }

  async create(
    entry: SupplierCreditLedgerEntry,
  ): Promise<SupplierCreditLedgerEntry> {
    this.entries.push(entry);
    return entry;
  }
}

export const inMemorySupplierCreditLedgerRepository =
  new InMemorySupplierCreditLedgerRepository();
