import {
  paymentRefundRepository,
  paymentRepository,
} from "../repositories";

import type {
  Payment,
  PaymentMethod,
} from "../types/payment.types";
import type { PaymentRefund } from "../types/payment-refund.types";

export interface PaymentSummary {
  salesOrderId: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID";
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function createId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (character) => {
      const random = Math.random() * 16 | 0;
      const value =
        character === "x"
          ? random
          : (random & 0x3) | 0x8;

      return value.toString(16);
    },
  );
}

class PaymentService {
  async getPayments(
    tenantId: string,
  ): Promise<Payment[]> {
    if (!tenantId.trim()) {
      throw new Error("Tenant ID is required.");
    }

    return paymentRepository.findAll(tenantId);
  }

  async getPaymentsForOrder(
    tenantId: string,
    salesOrderId: string,
  ): Promise<Payment[]> {
    if (!tenantId.trim()) {
      throw new Error("Tenant ID is required.");
    }

    if (!salesOrderId.trim()) {
      throw new Error("Sales order ID is required.");
    }

    return paymentRepository.findByOrderId(
      tenantId,
      salesOrderId,
    );
  }

  async getOrderPaymentSummary(
    tenantId: string,
    salesOrderId: string,
    totalAmount: number,
  ): Promise<PaymentSummary> {
    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      throw new Error("Invalid order total.");
    }

    const payments =
      await this.getPaymentsForOrder(
        tenantId,
        salesOrderId,
      );

    const paidAmount = roundMoney(
      payments
        .filter(
          (payment) =>
            payment.status === "COMPLETED",
        )
        .reduce(
          (sum, payment) =>
            sum + payment.amount,
          0,
        ),
    );

    const outstandingAmount = roundMoney(
      Math.max(
        0,
        totalAmount - paidAmount,
      ),
    );

    let status:
      | "UNPAID"
      | "PARTIALLY_PAID"
      | "PAID";

    if (paidAmount <= 0) {
      status = "UNPAID";
    } else if (paidAmount >= totalAmount) {
      status = "PAID";
    } else {
      status = "PARTIALLY_PAID";
    }

    return {
      salesOrderId,
      totalAmount: roundMoney(totalAmount),
      paidAmount,
      outstandingAmount,
      status,
    };
  }

  async createPayment(
    tenantId: string,
    salesOrderId: string,
    method: PaymentMethod,
    amount: number,
    provider?: string,
  ): Promise<Payment> {
    if (!tenantId.trim()) {
      throw new Error("Tenant ID is required.");
    }

    if (!salesOrderId.trim()) {
      throw new Error("Sales order ID is required.");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(
        "Payment amount must be greater than zero.",
      );
    }

    const now = new Date().toISOString();

    const payment: Payment = {
      id: createId(),
      tenantId,
      salesOrderId,
      method,
      provider: provider?.trim() || undefined,
      amount: roundMoney(amount),
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
    };

    return paymentRepository.create(payment);
  }

  async completePayment(
    tenantId: string,
    id: string,
    reference?: string,
  ): Promise<Payment | undefined> {
    return paymentRepository.update(
      tenantId,
      id,
      {
        status: "COMPLETED",
        reference,
      },
    );
  }

  async failPayment(
    tenantId: string,
    id: string,
  ): Promise<Payment | undefined> {
    return paymentRepository.update(
      tenantId,
      id,
      {
        status: "FAILED",
      },
    );
  }

  async refundPaymentAmount(
    tenantId: string,
    id: string,
    amount: number,
    reference?: string,
  ): Promise<Payment | undefined> {
    if (!tenantId.trim()) {
      throw new Error("Tenant ID is required.");
    }

    if (!id.trim()) {
      throw new Error("Payment ID is required.");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(
        "Refund amount must be greater than zero.",
      );
    }

    const payment =
      await paymentRepository.findById(
        tenantId,
        id,
      );

    if (!payment) {
      throw new Error("Payment not found.");
    }

    if (payment.status === "REFUNDED") {
      return payment;
    }

    if (payment.status !== "COMPLETED") {
      throw new Error(
        `Payment cannot be refunded from status ${payment.status}.`,
      );
    }

    const refunds =
      await paymentRefundRepository.findByPaymentId(
        tenantId,
        payment.id,
      );

    const refundedAmount = roundMoney(
      refunds.reduce(
        (sum, refund) =>
          sum + refund.amount,
        0,
      ),
    );

    const remainingAmount = roundMoney(
      payment.amount - refundedAmount,
    );

    if (remainingAmount <= 0) {
      return paymentRepository.update(
        tenantId,
        id,
        {
          status: "REFUNDED",
        },
      );
    }

    const refundAmount = roundMoney(amount);

    if (refundAmount > remainingAmount) {
      throw new Error(
        `Refund amount cannot exceed the remaining refundable amount of ${remainingAmount.toFixed(2)}.`,
      );
    }

    const refund: PaymentRefund = {
      id: createId(),
      tenantId,
      paymentId: payment.id,
      salesOrderId: payment.salesOrderId,
      amount: refundAmount,
      createdAt: new Date().toISOString(),
      reference: reference?.trim() || undefined,
    };

    await paymentRefundRepository.create(
      refund,
    );

    const newRefundedAmount = roundMoney(
      refundedAmount + refundAmount,
    );

    if (newRefundedAmount >= payment.amount) {
      return paymentRepository.update(
        tenantId,
        id,
        {
          status: "REFUNDED",
        },
      );
    }

    return paymentRepository.findById(
      tenantId,
      id,
    );
  }

  async refundPayment(
    tenantId: string,
    id: string,
  ): Promise<Payment | undefined> {
    if (!tenantId.trim()) {
      throw new Error("Tenant ID is required.");
    }

    if (!id.trim()) {
      throw new Error("Payment ID is required.");
    }

    const payment =
      await paymentRepository.findById(
        tenantId,
        id,
      );

    if (!payment) {
      throw new Error("Payment not found.");
    }

    if (payment.status === "REFUNDED") {
      return payment;
    }

    if (payment.status !== "COMPLETED") {
      throw new Error(
        `Payment cannot be refunded from status ${payment.status}.`,
      );
    }

    const refunds =
      await paymentRefundRepository.findByPaymentId(
        tenantId,
        payment.id,
      );

    const refundedAmount = roundMoney(
      refunds.reduce(
        (sum, refund) =>
          sum + refund.amount,
        0,
      ),
    );

    const remainingAmount = roundMoney(
      payment.amount - refundedAmount,
    );

    if (remainingAmount <= 0) {
      return paymentRepository.update(
        tenantId,
        id,
        {
          status: "REFUNDED",
        },
      );
    }

    return this.refundPaymentAmount(
      tenantId,
      id,
      remainingAmount,
    );
  }
}

export const paymentService =
  new PaymentService();
