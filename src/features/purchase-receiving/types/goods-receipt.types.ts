export interface GoodsReceiptItem {
  id: string;
  goodsReceiptId: string;
  purchaseOrderItemId: string;
  productId: string;
  quantityReceived: number;
  unitCost: number;
  lineTotal: number;
}

export interface GoodsReceipt {
  id: string;
  tenantId: string;
  storeId: string;
  purchaseOrderId: string;
  supplierId: string;
  warehouseId: string;
  receiptNumber: string;
  items: GoodsReceiptItem[];
  receivedDate: string;
  receivedBy?: string;
  notes?: string;
  createdAt: string;
}
