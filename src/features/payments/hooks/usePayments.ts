import { paymentService } from "../services/payment.service";

export const usePayments = () => {
  return {
    createPayment:
      paymentService.createPayment.bind(paymentService),

    getPayments:
      paymentService.getPayments.bind(paymentService),

    getPaymentById:
      paymentService.getPaymentById.bind(paymentService),

    getPaymentsBySaleId:
      paymentService.getPaymentsBySaleId.bind(paymentService),
  };
};