import {
  usePurchaseOrderStore,
} from "../store/purchase-order.store";

export function usePurchaseOrders() {

  return usePurchaseOrderStore();

}