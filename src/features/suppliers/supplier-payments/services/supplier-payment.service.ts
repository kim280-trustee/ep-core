import { supplierCreditLedgerService } from "../../credit-ledger";
import { supplierService } from "../../services/supplier.service";
import { supplierPaymentRepository } from "../repositories/repository.provider";
import type {
  CreateSupplierPaymentDto,
  SupplierPayment,
} from "../types/supplier-payment.types";

class SupplierPaymentService {
  private generatePaymentNumber(): string {
    return `SP-${Date.now()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;
  }

  async getPayments(
    tenantId: string,
    storeId: string,
    supplierId?: string,
  ): Promise<SupplierPayment[]> {
    return supplierPaymentRepository.findAll(
      tenantId,
      storeId,
      supplierId,
    );
  }

  async createPayment(
    input: CreateSupplierPaymentDto,
  ): Promise<SupplierPayment> {
    if (!input.tenantId || !input.storeId || !input.supplierId) {
      throw new Error("Tenant, store and supplier are required.");
    }

    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new Error("Supplier payment amount must be greater than zero.");
    }

    const supplier = await supplierService.getSupplierById(
      input.tenantId,
      input.supplierId,
    );

    if (!supplier || supplier.storeId !== input.storeId) {
      throw new Error("Supplier not found for this store.");
    }

    const now = new Date().toISOString();
    const payment: SupplierPayment = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      storeId: input.storeId,
      supplierId: input.supplierId,
      paymentNumber: this.generatePaymentNumber(),
      amount: input.amount,
      method: input.method,
      reference: input.reference ?? null,
      notes: input.notes ?? null,
      status: "COMPLETED",
      paidAt: input.paidAt ?? now,
      createdAt: now,
      updatedAt: now,
    };

    const created = await supplierPaymentRepository.create(payment);

    await supplierCreditLedgerService.recordPayment({
      tenantId: created.tenantId,
      storeId: created.storeId,
      supplierId: created.supplierId,
      referenceType: "SUPPLIER_PAYMENT",
      referenceId: created.id,
      referenceNumber: created.paymentNumber,
      description: `Supplier payment ${created.paymentNumber}`,
      amount: created.amount,
    });

    return created;
  }
}

export const supplierPaymentService =
  new SupplierPaymentService();
