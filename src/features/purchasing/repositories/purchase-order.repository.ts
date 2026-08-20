import type {
  PurchaseOrder,
} from "../types/purchase-order.types";


export interface PurchaseOrderRepository {


  findAll(
    tenantId: string,
  ): Promise<PurchaseOrder[]>;


  findById(
    tenantId: string,
    id: string,
  ): Promise<PurchaseOrder | undefined>;


  findBySupplier(
    tenantId: string,
    supplierId: string,
  ): Promise<PurchaseOrder[]>;


  create(
    order: PurchaseOrder,
  ): Promise<PurchaseOrder>;


  update(
    tenantId: string,
    id: string,
    updates: Partial<PurchaseOrder>,
  ): Promise<PurchaseOrder | undefined>;

}