import type { PaymentRefund } from "../types/payment-refund.types";
import type { PaymentRefundRepository } from "./payment-refund.repository";

class InMemoryPaymentRefundRepository
  implements PaymentRefundRepository
{
  private refunds: PaymentRefund[] = [];

  async findByPaymentId(
    tenantId: string,
    paymentId: string,
  ): Promise<PaymentRefund[]> {
    return this.refunds.filter(
      (refund) =>
        refund.tenantId === tenantId &&
        refund.paymentId === paymentId,
    );
  }

  async create(
    refund: PaymentRefund,
  ): Promise<PaymentRefund> {
    this.refunds.push(refund);
    return refund;
  }
}

export const inMemoryPaymentRefundRepository =
  new InMemoryPaymentRefundRepository();
