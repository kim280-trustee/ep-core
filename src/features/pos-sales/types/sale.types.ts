import type {
  SaleStatus,
} from "./sale-status.types";


import type {
  SaleItem,
} from "./sale-item.types";



export interface Sale {


  id: string;


  tenantId: string;


  storeId: string;


  customerId?: string;


  warehouseId: string;


  saleNumber: string;


  status: SaleStatus;


  items: SaleItem[];


  subtotal: number;


  taxAmount: number;


  totalAmount: number;


  paymentStatus:
    | "PENDING"
    | "PAID";


  createdAt: string;


  updatedAt: string;


}