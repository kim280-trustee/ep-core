import type {
  GoodsReceipt,
} from "../types/goods-receipt.types";


import type {
  GoodsReceiptRepository,
} from "./goods-receipt.repository";


class InMemoryGoodsReceiptRepository
implements GoodsReceiptRepository {


  private receipts:
    GoodsReceipt[] = [];


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


  findByPurchaseOrder(
    purchaseOrderId: string,
  ) {

    return this.receipts.filter(

      (receipt) =>

        receipt.purchaseOrderId === purchaseOrderId,

    );

  }


  create(
    receipt: GoodsReceipt,
  ) {

    this.receipts.push(
      receipt,
    );

    return receipt;

  }


  update(
    id: string,
    receipt: GoodsReceipt,
  ) {

    const index =

      this.receipts.findIndex(

        (item) =>

          item.id === id,

      );


    if (index === -1) {

      throw new Error(

        "Goods receipt not found.",

      );

    }


    this.receipts[index] = receipt;

    return receipt;

  }


  delete(
    id: string,
  ) {

    this.receipts =

      this.receipts.filter(

        (receipt) =>

          receipt.id !== id,

      );

  }

}


export const inMemoryGoodsReceiptRepository =

  new InMemoryGoodsReceiptRepository();