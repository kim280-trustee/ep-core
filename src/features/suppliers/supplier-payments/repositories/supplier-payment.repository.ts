import type { SupplierPayment } from "../types/supplier-payment.types";

export interface SupplierPaymentRepository {
  findAll(
    tenantId: string,
    storeId: string,
    supplierId?: string,
  ): Promise<SupplierPayment[]>;

  create(
    payment: SupplierPayment,
  ): Promise<SupplierPayment>;
}
