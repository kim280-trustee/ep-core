import type { Payment } from "../types/payment.types";

export interface PaymentRepository {
  findAll(): Payment[];

  findById(
    id: string,
  ): Payment | undefined;

  findBySaleId(
    saleId: string,
  ): Payment[];

  create(
    payment: Payment,
  ): Payment;

  update(
    id: string,
    updates: Partial<Payment>,
  ): Payment | undefined;
}