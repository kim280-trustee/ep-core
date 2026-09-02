import type {
  PaymentMethod,
} from "@/features/payments/types/payment.types";

export type CheckoutPaymentMethod =
  PaymentMethod;

export interface CheckoutRequest {
  tenantId: string;
  salesOrderId: string;
  paymentMethod:
    CheckoutPaymentMethod;
  paymentAmount: number;
  provider?: string;
  reference?: string;
}

export interface CheckoutResult {
  salesOrderId: string;
  paymentId: string;
  receiptId: string;
  completedAt: string;
}
