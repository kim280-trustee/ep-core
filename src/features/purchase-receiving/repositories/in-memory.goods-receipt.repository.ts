import type { GoodsReceipt } from "../types/goods-receipt.types";
import type { GoodsReceiptRepository } from "./goods-receipt.repository";

class InMemoryGoodsReceiptRepository implements GoodsReceiptRepository {
  private receipts: GoodsReceipt[] = [];

  async findAll(tenantId: string) {
    return this.receipts.filter((receipt) => receipt.tenantId === tenantId);
  }

  async findById(tenantId: string, id: string) {
    return this.receipts.find(
      (receipt) => receipt.tenantId === tenantId && receipt.id === id
    );
  }

  async findByPurchaseOrder(tenantId: string, purchaseOrderId: string) {
    return this.receipts.filter(
      (receipt) =>
        receipt.tenantId === tenantId &&
        receipt.purchaseOrderId === purchaseOrderId
    );
  }

  async create(receipt: GoodsReceipt) {
    this.receipts.push(receipt);
    return receipt;
  }

  async update(tenantId: string, id: string, receipt: GoodsReceipt) {
    const index = this.receipts.findIndex(
      (item) => item.tenantId === tenantId && item.id === id
    );

    if (index === -1) {
      throw new Error("Goods receipt not found.");
    }

    this.receipts[index] = receipt;
    return receipt;
  }

  async delete(tenantId: string, id: string) {
    this.receipts = this.receipts.filter(
      (receipt) =>
        !(receipt.tenantId === tenantId && receipt.id === id)
    );
  }
}

export const inMemoryGoodsReceiptRepository =
  new InMemoryGoodsReceiptRepository();
