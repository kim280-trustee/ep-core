import type {
  PaymentMethod,
} from "@/features/payments/types/payment.types";

export type {
  PaymentMethod,
};

export interface PaymentEntry {
  method: PaymentMethod;
  amount: number;
  provider?: string;
  reference?: string;
}

export interface PaymentResult {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  changeAmount: number;
  completed: boolean;
  payments: PaymentEntry[];
}

function roundMoney(
  value: number,
): number {
  return Math.round(
    (value + Number.EPSILON) * 100,
  ) / 100;
}

export class PaymentEngine {
  process(
    totalAmount: number,
    payments: PaymentEntry[],
  ): PaymentResult {
    if (
      !Number.isFinite(totalAmount) ||
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
      roundMoney(
        validPayments.reduce(
          (sum, payment) =>
            sum + payment.amount,
          0,
        ),
      );

    const remainingAmount =
      roundMoney(
        Math.max(
          0,
          totalAmount -
            paidAmount,
        ),
      );

    const changeAmount =
      roundMoney(
        Math.max(
          0,
          paidAmount -
            totalAmount,
        ),
      );

    return {
      totalAmount:
        roundMoney(
          totalAmount,
        ),
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
