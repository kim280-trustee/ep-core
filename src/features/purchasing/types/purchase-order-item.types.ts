export interface PurchaseOrderItem {


  id: string;


  purchaseOrderId: string;


  productId: string;


  quantityOrdered: number;


  quantityReceived: number;


  unitCost: number;


  taxRate: number;


  lineTotal: number;


}