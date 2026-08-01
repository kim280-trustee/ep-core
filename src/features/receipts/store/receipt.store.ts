import {
  create,
} from "zustand";

import {
  receiptEngine,
} from "../engine";

import {
  receiptService,
} from "../services";

import type {
  Receipt,
} from "../types/receipt.types";

interface ReceiptState {

  receipts: Receipt[];

  loadReceipts: () => void;

  issueReceipt: (

    tenantId: string,

    salesOrderId: string,

    paymentId: string,

    totalAmount: number,

  ) => void;

  voidReceipt: (

    receiptId: string,

  ) => void;

}

export const useReceiptStore =

create<ReceiptState>((set) => ({

  receipts: [],

  loadReceipts: () => {

    set({

      receipts:

        receiptService.getReceipts(),

    });

  },

  issueReceipt: (

    tenantId,

    salesOrderId,

    paymentId,

    totalAmount,

  ) => {

    receiptEngine.issue(

      tenantId,

      salesOrderId,

      paymentId,

      totalAmount,

    );

    set({

      receipts:

        receiptService.getReceipts(),

    });

  },

  voidReceipt: (

    receiptId,

  ) => {

    receiptEngine.void(

      receiptId,

    );

    set({

      receipts:

        receiptService.getReceipts(),

    });

  },

}));