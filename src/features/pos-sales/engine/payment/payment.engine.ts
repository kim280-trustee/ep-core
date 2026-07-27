export interface PaymentResult {

  paid: number;

  balance: number;

  change: number;

  completed: boolean;

}

export class PaymentEngine {

  process(

    total: number,

    amountPaid: number,

  ): PaymentResult {

    const balance =
      Math.max(
        total - amountPaid,
        0,
      );

    const change =
      Math.max(
        amountPaid - total,
        0,
      );

    return {

      paid: amountPaid,

      balance,

      change,

      completed:
        amountPaid >= total,

    };

  }

}

export const paymentEngine =
  new PaymentEngine();