import type { PurchaseReturn } from "../types";

export interface PurchaseReturnRepository {
  findAll(tenantId: string): Promise<PurchaseReturn[]>;
  findById(
    tenantId: string,
    id: string,
  ): Promise<PurchaseReturn | undefined>;
  findByPurchaseOrder(
    tenantId: string,
    purchaseOrderId: string,
  ): Promise<PurchaseReturn[]>;
  create(
    value: PurchaseReturn,
  ): Promise<PurchaseReturn>;
  update(
    tenantId: string,
    id: string,
    updates: Partial<PurchaseReturn>,
  ): Promise<PurchaseReturn | undefined>;
}
