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


  warehouseId: string;


  customerId?: string;


  cashierId?: string;


  saleNumber: string;


  status: SaleStatus;


  items: SaleItem[];


  subtotal: number;


  discountAmount: number;


  taxAmount: number;


  totalAmount: number;


  paymentStatus:
    | "PENDING"
    | "PAID"
    | "PARTIAL";


  paymentMethod?: string;


  notes?: string;


  completedAt?: string;


  createdAt: string;


  updatedAt: string;

}