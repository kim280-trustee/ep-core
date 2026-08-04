import type {
  GoodsReceipt,
} from "../types/goods-receipt.types";


export interface GoodsReceiptRepository {

  findAll(): GoodsReceipt[];

  findById(
    id: string,
  ): GoodsReceipt | undefined;

  findByPurchaseOrder(
    purchaseOrderId: string,
  ): GoodsReceipt[];

  create(
    receipt: GoodsReceipt,
  ): GoodsReceipt;

  update(
    id: string,
    receipt: GoodsReceipt,
  ): GoodsReceipt;

  delete(
    id: string,
  ): void;

}