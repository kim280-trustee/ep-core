import type { SupplierPayment } from "../types/supplier-payment.types";
import type { SupplierPaymentRepository } from "./supplier-payment.repository";

class InMemorySupplierPaymentRepository
  implements SupplierPaymentRepository {
  private payments: SupplierPayment[] = [];

  async findAll(
    tenantId: string,
    storeId: string,
    supplierId?: string,
  ): Promise<SupplierPayment[]> {
    return this.payments.filter(
      (payment) =>
        payment.tenantId === tenantId &&
        payment.storeId === storeId &&
        (supplierId === undefined || payment.supplierId === supplierId),
    );
  }

  async create(
    payment: SupplierPayment,
  ): Promise<SupplierPayment> {
    this.payments.push(payment);
    return payment;
  }
}

export const inMemorySupplierPaymentRepository =
  new InMemorySupplierPaymentRepository();
