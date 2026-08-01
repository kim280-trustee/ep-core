import {
  receiptRepository,
} from "../repositories";

import type {
  Receipt,
} from "../types/receipt.types";

class ReceiptService {

  getReceipts() {

    return receiptRepository.findAll();

  }

  createReceipt(

    tenantId: string,

    salesOrderId: string,

    paymentId: string,

    totalAmount: number,

  ) {

    const now =

      new Date().toISOString();

    const receipt: Receipt = {

      id:

        crypto.randomUUID(),

      tenantId,

      salesOrderId,

      paymentId,

      receiptNumber:

        `RC-${Date.now()}`,

      totalAmount,

      status:

        "ISSUED",

      createdAt:

        now,

      updatedAt:

        now,

    };

    return receiptRepository.create(

      receipt,

    );

  }

  voidReceipt(

    id: string,

  ) {

    return receiptRepository.update(

      id,

      {

        status:

          "VOID",

      },

    );

  }

}

export const receiptService =
  new ReceiptService();