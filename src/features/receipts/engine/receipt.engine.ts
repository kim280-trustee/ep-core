import {
  receiptService,
} from "../services";

export class ReceiptEngine {

  issue(

    tenantId: string,

    salesOrderId: string,

    paymentId: string,

    totalAmount: number,

  ) {

    return receiptService.createReceipt(

      tenantId,

      salesOrderId,

      paymentId,

      totalAmount,

    );

  }

  void(

    receiptId: string,

  ) {

    return receiptService.voidReceipt(

      receiptId,

    );

  }

}

export const receiptEngine =
  new ReceiptEngine();