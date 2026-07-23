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



}



export const inMemoryGoodsReceiptRepository =

  new InMemoryGoodsReceiptRepository();