import type { PaymentRefund } from "../types/payment-refund.types";

export interface PaymentRefundRepository {
  findByPaymentId(
    tenantId: string,
    paymentId: string,
  ): Promise<PaymentRefund[]>;

  create(
    refund: PaymentRefund,
  ): Promise<PaymentRefund>;
}
