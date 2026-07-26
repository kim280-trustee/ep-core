import type { Payment } from "../types/payment.types";
import type { PaymentRepository } from "./payment.repository";

class InMemoryPaymentRepository implements PaymentRepository {
  private payments: Payment[] = [];

  findAll(): Payment[] {
    return this.payments;
  }

  findById(
    id: string,
  ): Payment | undefined {
    return this.payments.find(
      (payment) => payment.id === id,
    );
  }

  findBySaleId(
    saleId: string,
  ): Payment[] {
    return this.payments.filter(
      (payment) => payment.saleId === saleId,
    );
  }

  create(
    payment: Payment,
  ): Payment {
    this.payments.push(payment);

    return payment;
  }

  update(
    id: string,
    updates: Partial<Payment>,
  ): Payment | undefined {
    const index = this.payments.findIndex(
      (payment) => payment.id === id,
    );

    if (index === -1) {
      return undefined;
    }

    this.payments[index] = {
      ...this.payments[index],
      ...updates,
    };

    return this.payments[index];
  }
}

export const inMemoryPaymentRepository =
  new InMemoryPaymentRepository();