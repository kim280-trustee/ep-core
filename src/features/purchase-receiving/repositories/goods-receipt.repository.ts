import type { GoodsReceipt } from "../types/goods-receipt.types";

export interface GoodsReceiptRepository {
  findAll(tenantId: string): Promise<GoodsReceipt[]>;
  findById(tenantId: string, id: string): Promise<GoodsReceipt | undefined>;
  findByPurchaseOrder(
    tenantId: string,
    purchaseOrderId: string
  ): Promise<GoodsReceipt[]>;
  create(receipt: GoodsReceipt): Promise<GoodsReceipt>;
  update(
    tenantId: string,
    id: string,
    receipt: GoodsReceipt
  ): Promise<GoodsReceipt>;
  delete(tenantId: string, id: string): Promise<void>;
}
