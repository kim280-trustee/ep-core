import type {
  GoodsReceiptItem,
} from "./goods-receipt-item.types";



export interface GoodsReceipt {


  id: string;


  tenantId: string;


  storeId: string;


  purchaseOrderId: string;


  supplierId: string;


  warehouseId: string;


  items: GoodsReceiptItem[];


  receivedDate: string;


  receivedBy?: string;


  notes?: string;


  createdAt: string;


}