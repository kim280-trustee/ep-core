import type {
  GoodsReceipt,
} from "../types/goods-receipt.types";

import type {
  GoodsReceiptItem,
} from "../types/goods-receipt-item.types";


export type CreateGoodsReceiptInput = Omit<
  GoodsReceipt,
  "id" | "receivedDate" | "createdAt"
> & {
  id?: string;
  receivedDate?: string;
  createdAt?: string;
};


class GoodsReceiptService {

  private receipts: GoodsReceipt[] = [];


  getReceipts(): GoodsReceipt[] {

    return [
      ...this.receipts,
    ];

  }


  getReceiptById(
    id: string,
  ): GoodsReceipt | undefined {

    return this.receipts.find(
      (receipt) =>
        receipt.id === id,
    );

  }


  async createReceipt(
    input: CreateGoodsReceiptInput,
  ): Promise<GoodsReceipt> {

    if (!input.tenantId) {
      throw new Error(
        "Tenant ID is required.",
      );
    }

    if (!input.storeId) {
      throw new Error(
        "Store ID is required.",
      );
    }

    if (!input.purchaseOrderId) {
      throw new Error(
        "Purchase order is required.",
      );
    }

    if (!input.supplierId) {
      throw new Error(
        "Supplier is required.",
      );
    }

    if (!input.warehouseId) {
      throw new Error(
        "Warehouse is required.",
      );
    }

    if (
      !input.items ||
      input.items.length === 0
    ) {
      throw new Error(
        "Goods receipt must contain at least one item.",
      );
    }


    const items: GoodsReceiptItem[] =
      input.items.map(
        (item) => {

          if (
            item.quantityReceived <= 0
          ) {
            throw new Error(
              `Invalid received quantity for product ${item.productId}.`,
            );
          }

          if (
            item.unitCost < 0
          ) {
            throw new Error(
              `Invalid unit cost for product ${item.productId}.`,
            );
          }

          return {
            ...item,
            id:
              item.id ||
              crypto.randomUUID(),
          };

        },
      );


    const now =
      new Date().toISOString();


    const receipt: GoodsReceipt = {

      id:
        input.id ||
        crypto.randomUUID(),

      tenantId:
        input.tenantId,

      storeId:
        input.storeId,

      purchaseOrderId:
        input.purchaseOrderId,

      supplierId:
        input.supplierId,

      warehouseId:
        input.warehouseId,

      items,

      receivedDate:
        input.receivedDate ??
        now,

      receivedBy:
        input.receivedBy,

      notes:
        input.notes,

      createdAt:
        input.createdAt ??
        now,

    };


    this.receipts.push(
      receipt,
    );


    return receipt;

  }

}


export const goodsReceiptService =
  new GoodsReceiptService();
