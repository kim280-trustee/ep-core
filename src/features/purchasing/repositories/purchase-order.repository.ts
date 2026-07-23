import type {
  PurchaseOrder,
} from "../types/purchase-order.types";


export interface PurchaseOrderRepository {


  findAll(): PurchaseOrder[];


  findById(
    id: string,
  ): PurchaseOrder | undefined;


  findBySupplier(
    supplierId: string,
  ): PurchaseOrder[];


  create(
    order: PurchaseOrder,
  ): PurchaseOrder;


  update(
    id: string,
    updates: Partial<PurchaseOrder>,
  ): PurchaseOrder | undefined;


}