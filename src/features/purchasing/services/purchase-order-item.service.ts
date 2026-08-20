import {
  purchaseOrderItemRepository,
} from "../repositories";

import type {
  PurchaseOrderItem,
} from "../types/purchase-order-item.types";


class PurchaseOrderItemService {


  async getItems(
    tenantId: string,
    purchaseOrderId: string,
  ): Promise<PurchaseOrderItem[]> {

    return purchaseOrderItemRepository.findAll(
      tenantId,
      purchaseOrderId,
    );

  }


  async getItemById(
    tenantId: string,
    id: string,
  ): Promise<PurchaseOrderItem | undefined> {

    return purchaseOrderItemRepository.findById(
      tenantId,
      id,
    );

  }


  async create(
    item: PurchaseOrderItem,
  ): Promise<PurchaseOrderItem> {

    return purchaseOrderItemRepository.create(
      item,
    );

  }


  async update(
    tenantId: string,
    id: string,
    updates: Partial<PurchaseOrderItem>,
  ): Promise<PurchaseOrderItem | undefined> {

    return purchaseOrderItemRepository.update(
      tenantId,
      id,
      updates,
    );

  }


  async delete(
    tenantId: string,
    id: string,
  ): Promise<void> {

    return purchaseOrderItemRepository.delete(
      tenantId,
      id,
    );

  }

}


export const purchaseOrderItemService =
  new PurchaseOrderItemService();