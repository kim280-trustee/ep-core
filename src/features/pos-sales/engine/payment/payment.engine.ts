export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "TRANSFER"
  | "QR"
  | "OTHER";

export interface PaymentEntry {
  method: PaymentMethod;

  amount: number;
}

export interface PaymentResult {
  totalAmount: number;

  paidAmount: number;

  remainingAmount: number;

  changeAmount: number;

  completed: boolean;

  payments: PaymentEntry[];
}

export class PaymentEngine {
  process(
    totalAmount: number,
    payments: PaymentEntry[],
  ): PaymentResult {
    if (
      !Number.isFinite(
        totalAmount,
      ) ||
      totalAmount < 0
    ) {
      throw new Error(
        "Invalid sale total.",
      );
    }

    const validPayments =
      payments.filter(
        (payment) =>
          Number.isFinite(
            payment.amount,
          ) &&
          payment.amount > 0,
      );

    const paidAmount =
      validPayments.reduce(
        (
          total,
          payment,
        ) =>
          total +
          payment.amount,
        0,
      );

    const remainingAmount =
      Math.max(
        0,
        totalAmount -
          paidAmount,
      );

    const changeAmount =
      Math.max(
        0,
        paidAmount -
          totalAmount,
      );

    return {
      totalAmount,
      paidAmount,
      remainingAmount,
      changeAmount,
      completed:
        paidAmount >=
        totalAmount,
      payments:
        validPayments,
    };
  }
}

export const paymentEngine =
  new PaymentEngine();
