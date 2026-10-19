export interface PaymentRefund {
  id: string;
  tenantId: string;
  paymentId: string;
  salesOrderId: string;
  amount: number;
  createdAt: string;
  reference?: string;
}
