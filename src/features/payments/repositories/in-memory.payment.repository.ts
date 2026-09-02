import type {
  Payment,
} from "../types/payment.types";

import type {
  PaymentRepository,
} from "./payment.repository";


class InMemoryPaymentRepository
implements PaymentRepository {

  private payments: Payment[] = [];


  async findAll(
    tenantId: string,
  ): Promise<Payment[]> {

    return this.payments.filter(
      (payment) =>
        payment.tenantId === tenantId,
    );

  }


  async findById(
    tenantId: string,
    id: string,
  ): Promise<Payment | undefined> {

    return this.payments.find(
      (payment) =>
        payment.tenantId === tenantId &&
        payment.id === id,
    );

  }


  async findByOrderId(
    tenantId: string,
    salesOrderId: string,
  ): Promise<Payment[]> {

    return this.payments.filter(
      (payment) =>
        payment.tenantId === tenantId &&
        payment.salesOrderId === salesOrderId,
    );

  }


  async create(
    payment: Payment,
  ): Promise<Payment> {

    this.payments.push(
      payment,
    );

    return payment;

  }


  async update(
    tenantId: string,
    id: string,
    updates: Partial<Payment>,
  ): Promise<Payment | undefined> {

    const index =
      this.payments.findIndex(
        (payment) =>
          payment.tenantId === tenantId &&
          payment.id === id,
      );


    if (index === -1) {

      return undefined;

    }


    this.payments[index] = {

      ...this.payments[index],

      ...updates,

      updatedAt:
        new Date().toISOString(),

    };


    return this.payments[index];

  }

}


export const inMemoryPaymentRepository =
  new InMemoryPaymentRepository();
