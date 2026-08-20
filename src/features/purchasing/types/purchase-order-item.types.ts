export interface PurchaseOrderItem {

  id: string;

  tenantId: string;

  purchaseOrderId: string;

  productId: string;

  quantity: number;

  receivedQuantity: number;

  unitCost: number;

  taxRate: number;

  taxAmount: number;

  lineTotal: number;

  notes: string | null;

  createdAt: string;

  updatedAt: string;

}