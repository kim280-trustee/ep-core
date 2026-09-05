import type { PurchaseReturn } from "../types";
import type { PurchaseReturnRepository } from "./purchase-return.repository";

class InMemoryPurchaseReturnRepository
  implements PurchaseReturnRepository {

  private returns: PurchaseReturn[] = [];

  async findAll(
    tenantId: string,
  ): Promise<PurchaseReturn[]> {
    return this.returns.filter(
      (value) => value.tenantId === tenantId,
    );
  }

  async findById(
    tenantId: string,
    id: string,
  ): Promise<PurchaseReturn | undefined> {
    return this.returns.find(
      (value) =>
        value.tenantId === tenantId &&
        value.id === id,
    );
  }

  async findByPurchaseOrder(
    tenantId: string,
    purchaseOrderId: string,
  ): Promise<PurchaseReturn[]> {
    return this.returns.filter(
      (value) =>
        value.tenantId === tenantId &&
        value.purchaseOrderId === purchaseOrderId,
    );
  }

  async create(
    value: PurchaseReturn,
  ): Promise<PurchaseReturn> {
    this.returns.push(value);
    return value;
  }

  async update(
    tenantId: string,
    id: string,
    updates: Partial<PurchaseReturn>,
  ): Promise<PurchaseReturn | undefined> {
    const index = this.returns.findIndex(
      (value) =>
        value.tenantId === tenantId &&
        value.id === id,
    );

    if (index === -1) {
      return undefined;
    }

    this.returns[index] = {
      ...this.returns[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return this.returns[index];
  }
}

export const inMemoryPurchaseReturnRepository =
  new InMemoryPurchaseReturnRepository();
