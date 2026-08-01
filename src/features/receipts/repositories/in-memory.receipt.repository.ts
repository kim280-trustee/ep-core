import type {
  Receipt,
} from "../types/receipt.types";

import type {
  ReceiptRepository,
} from "./receipt.repository";

class InMemoryReceiptRepository
implements ReceiptRepository {

  private receipts: Receipt[] = [];

  findAll() {

    return this.receipts;

  }

  findById(
    id: string,
  ) {

    return this.receipts.find(

      (receipt) =>

        receipt.id === id,

    );

  }

  findBySalesOrderId(
    salesOrderId: string,
  ) {

    return this.receipts.find(

      (receipt) =>

        receipt.salesOrderId === salesOrderId,

    );

  }

  create(
    receipt: Receipt,
  ) {

    this.receipts.push(receipt);

    return receipt;

  }

  update(
    id: string,
    updates: Partial<Receipt>,
  ) {

    const index =

      this.receipts.findIndex(

        (receipt) =>

          receipt.id === id,

      );

    if (index === -1) {

      return undefined;

    }

    this.receipts[index] = {

      ...this.receipts[index],

      ...updates,

      updatedAt:

        new Date().toISOString(),

    };

    return this.receipts[index];

  }

}

export const inMemoryReceiptRepository =
  new InMemoryReceiptRepository();