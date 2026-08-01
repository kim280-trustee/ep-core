import {
  inMemoryPurchaseOrderRepository,
} from "./in-memory.purchase-order.repository";


export const purchaseOrderContext = {

  repository:

    inMemoryPurchaseOrderRepository,

};