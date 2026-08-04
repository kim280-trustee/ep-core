export type PaymentMethod =
  | "CASH"
  | "QR"
  | "CARD"
  | "TRANSFER";


export interface PaymentEntry {

  method: PaymentMethod;

  amount: number;

}


export interface PaymentResult {

  payments: PaymentEntry[];

  paid: number;

  balance: number;

  change: number;

  completed: boolean;

}



export class PaymentEngine {


  process(

    total: number,

    payments: PaymentEntry[],

  ): PaymentResult {


    const paid =
      payments.reduce(

        (sum,payment)=>
          sum + payment.amount,

        0,

      );



    const balance =
      Math.max(

        total - paid,

        0,

      );



    const change =
      Math.max(

        paid - total,

        0,

      );



    return {

      payments,

      paid,

      balance,

      change,

      completed:
        paid >= total,

    };


  }


}


export const paymentEngine =
  new PaymentEngine();