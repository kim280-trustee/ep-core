import type {
  Payment,
} from "../types/payment.types";

export interface PaymentRepository {

  findAll(
    tenantId: string,
  ): Promise<Payment[]>;

  findById(
    tenantId: string,
    id: string,
  ): Promise<Payment | undefined>;

  findByOrderId(
    tenantId: string,
    salesOrderId: string,
  ): Promise<Payment[]>;

  create(
    payment: Payment,
  ): Promise<Payment>;

  update(
    tenantId: string,
    id: string,
    updates: Partial<Payment>,
  ): Promise<Payment | undefined>;

}
