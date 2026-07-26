import { paymentRepository } from "../repositories";

import type { Payment } from "../types/payment.types";
import type { PaymentMethod } from "../types/payment-method.types";

export interface CreatePaymentInput {
  tenantId: string;
  storeId: string;
  saleId: string;
  amount: number;
  method: PaymentMethod;
  currency: string;
  referenceNumber?: string;
}

class PaymentService {
  createPayment(input: CreatePaymentInput): Payment {
    const payment: Payment = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      storeId: input.storeId,
      saleId: input.saleId,
      amount: input.amount,
      method: input.method,
      status: "PAID",
      currency: input.currency,
      referenceNumber: input.referenceNumber,
      createdAt: new Date().toISOString(),
    };

    return paymentRepository.create(payment);
  }

  getPayments(): Payment[] {
    return paymentRepository.findAll();
  }

  getPaymentById(id: string): Payment | undefined {
    return paymentRepository.findById(id);
  }

  getPaymentsBySaleId(saleId: string): Payment[] {
    return paymentRepository.findBySaleId(saleId);
  }
}

export const paymentService = new PaymentService();