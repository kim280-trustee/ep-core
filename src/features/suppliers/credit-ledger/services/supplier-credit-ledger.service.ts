import { getSupplierCreditLedgerRepository } from "../repositories/repository.provider";
import { purchaseOrderRepository } from "@/features/purchasing/repositories";
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

interface ApplyCreditInput {
  tenantId: string;
  storeId: string;
  supplierId: string;
  purchaseOrderId: string;
  amount: number;
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
    const entries = await this.getEntries(tenantId, storeId, supplierId);
    const debit = entries.reduce((total, entry) => total + entry.debit, 0);
    const credit = entries.reduce((total, entry) => total + entry.credit, 0);

    return { supplierId, debit, credit, balance: debit - credit };
  }

  async addEntry(input: AddEntryInput): Promise<SupplierCreditLedgerEntry> {
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
    input: Omit<AddEntryInput, "entryType" | "debit" | "credit"> & { amount: number },
  ): Promise<SupplierCreditLedgerEntry> {
    return this.addEntry({ ...input, entryType: "PURCHASE", debit: input.amount });
  }

  async recordPayment(
    input: Omit<AddEntryInput, "entryType" | "debit" | "credit"> & { amount: number },
  ): Promise<SupplierCreditLedgerEntry> {
    return this.addEntry({ ...input, entryType: "PAYMENT", credit: input.amount });
  }

  async recordPurchaseReturn(
    input: Omit<AddEntryInput, "entryType" | "debit" | "credit"> & { amount: number },
  ): Promise<SupplierCreditLedgerEntry> {
    return this.addEntry({ ...input, entryType: "PURCHASE_RETURN", credit: input.amount });
  }

  async applyCreditToPurchaseOrder(
    input: ApplyCreditInput,
  ): Promise<SupplierCreditLedgerEntry> {
    if (!input.purchaseOrderId || !input.amount || input.amount <= 0) {
      throw new Error("Purchase order and a valid credit amount are required.");
    }

    const [balance, order, entries] = await Promise.all([
      this.getBalance(input.tenantId, input.storeId, input.supplierId),
      purchaseOrderRepository.findById(input.tenantId, input.purchaseOrderId),
      this.getEntries(input.tenantId, input.storeId, input.supplierId),
    ]);

    if (!order) throw new Error("Purchase order not found.");
    if (order.storeId !== input.storeId) throw new Error("Purchase order belongs to another store.");
    if (order.supplierId !== input.supplierId) throw new Error("Purchase order belongs to another supplier.");
    if (order.status !== "RECEIVED" && order.status !== "PARTIALLY_RECEIVED") {
      throw new Error("Credit can only be applied to a received purchase order.");
    }

    const availableCredit = Math.max(0, -balance.balance);
    if (availableCredit <= 0) throw new Error("This supplier has no available credit.");
    if (input.amount > availableCredit) {
      throw new Error(`Credit amount cannot exceed the available supplier credit of ${availableCredit.toFixed(2)}.`);
    }

    const alreadyApplied = entries
      .filter((entry) => entry.referenceType === "CREDIT_APPLICATION" && entry.referenceNumber === order.orderNumber)
      .reduce((total, entry) => total + entry.debit, 0);
    const remainingPurchaseAmount = Math.max(0, order.totalAmount - alreadyApplied);
    if (remainingPurchaseAmount <= 0) throw new Error("This purchase order has no remaining amount for supplier credit.");
    if (input.amount > remainingPurchaseAmount) {
      throw new Error(`Credit amount cannot exceed the remaining purchase amount of ${remainingPurchaseAmount.toFixed(2)}.`);
    }

    return this.addEntry({
      tenantId: input.tenantId,
      storeId: input.storeId,
      supplierId: input.supplierId,
      entryType: "ADJUSTMENT",
      referenceType: "CREDIT_APPLICATION",
      referenceId: crypto.randomUUID(),
      referenceNumber: order.orderNumber,
      description: `Supplier credit applied to ${order.orderNumber}`,
      debit: input.amount,
    });
  }
}

export const supplierCreditLedgerService = new SupplierCreditLedgerService();
