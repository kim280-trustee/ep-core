export interface PurchaseReturnItem {
  id: string;
  purchaseReturnId: string;
  purchaseOrderItemId: string;
  productId: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
  reason: string | null;
}
