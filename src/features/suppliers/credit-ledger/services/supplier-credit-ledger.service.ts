import { getSupplierCreditLedgerRepository } from "../repositories/repository.provider";
import type {
  SupplierCreditBalance,
  SupplierCreditLedgerEntry,
  SupplierCreditLedgerEntryType,
} from "../types/supplier-credit-ledger.types";

interface AddEntryInput {
  tenantId: string;
  storeId: string;
  supplierId: string;
  entryType: SupplierCreditLedgerEntryType;
  referenceType?: string | null;
  referenceId?: string | null;
  referenceNumber?: string | null;
  description?: string | null;
  debit?: number;
  credit?: number;
}

class SupplierCreditLedgerService {
  async getEntries(
    tenantId: string,
    storeId: string,
    supplierId: string,
  ): Promise<SupplierCreditLedgerEntry[]> {
    return getSupplierCreditLedgerRepository().findAll(
      tenantId,
      storeId,
      supplierId,
    );
  }

  async getBalance(
    tenantId: string,
    storeId: string,
    supplierId: string,
  ): Promise<SupplierCreditBalance> {
    const entries = await this.getEntries(
      tenantId,
      storeId,
      supplierId,
    );

    const debit = entries.reduce(
      (total, entry) => total + entry.debit,
      0,
    );
    const credit = entries.reduce(
      (total, entry) => total + entry.credit,
      0,
    );

    return {
      supplierId,
      debit,
      credit,
      balance: debit - credit,
    };
  }

  async addEntry(
    input: AddEntryInput,
  ): Promise<SupplierCreditLedgerEntry> {
    const debit = input.debit ?? 0;
    const credit = input.credit ?? 0;

    if (!input.tenantId || !input.storeId || !input.supplierId) {
      throw new Error("Tenant, store and supplier are required.");
    }

    if (debit < 0 || credit < 0 || (debit > 0 && credit > 0)) {
      throw new Error("Ledger entry must contain either debit or credit.");
    }

    if (debit === 0 && credit === 0) {
      throw new Error("Ledger entry amount must be greater than zero.");
    }

    const entry: SupplierCreditLedgerEntry = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      storeId: input.storeId,
      supplierId: input.supplierId,
      entryType: input.entryType,
      referenceType: input.referenceType ?? null,
      referenceId: input.referenceId ?? null,
      referenceNumber: input.referenceNumber ?? null,
      description: input.description ?? null,
      debit,
      credit,
      createdAt: new Date().toISOString(),
    };

    return getSupplierCreditLedgerRepository().create(entry);
  }

  async recordPurchase(
    input: Omit<AddEntryInput, "entryType" | "debit" | "credit"> & {
      amount: number;
    },
  ): Promise<SupplierCreditLedgerEntry> {
    return this.addEntry({
      ...input,
      entryType: "PURCHASE",
      debit: input.amount,
    });
  }

  async recordPayment(
    input: Omit<AddEntryInput, "entryType" | "debit" | "credit"> & {
      amount: number;
    },
  ): Promise<SupplierCreditLedgerEntry> {
    return this.addEntry({
      ...input,
      entryType: "PAYMENT",
      credit: input.amount,
    });
  }

  async recordPurchaseReturn(
    input: Omit<AddEntryInput, "entryType" | "debit" | "credit"> & {
      amount: number;
    },
  ): Promise<SupplierCreditLedgerEntry> {
    return this.addEntry({
      ...input,
      entryType: "PURCHASE_RETURN",
      credit: input.amount,
    });
  }
}

export const supplierCreditLedgerService =
  new SupplierCreditLedgerService();
