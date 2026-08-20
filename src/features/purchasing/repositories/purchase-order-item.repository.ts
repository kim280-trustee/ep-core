import type {
  PurchaseOrderItem,
} from "../types/purchase-order-item.types";


export interface PurchaseOrderItemRepository {

  findAll(
    tenantId: string,
    purchaseOrderId: string,
  ): Promise<PurchaseOrderItem[]>;


  findById(
    tenantId: string,
    id: string,
  ): Promise<PurchaseOrderItem | undefined>;


  create(
    item: PurchaseOrderItem,
  ): Promise<PurchaseOrderItem>;


  update(
    tenantId: string,
    id: string,
    updates: Partial<PurchaseOrderItem>,
  ): Promise<PurchaseOrderItem | undefined>;


  delete(
    tenantId: string,
    id: string,
  ): Promise<void>;

}