import {
  create,
} from "zustand";

import {
  purchaseOrderService,
} from "../services/purchase-order.service";

import type {
  PurchaseOrder,
} from "../types/purchase-order.types";

import type {
  PurchaseOrderItem,
} from "../types/purchase-order-item.types";


interface CreatePurchaseOrderInput {
  tenantId: string;
  storeId: string | null;
  supplierId: string;
  warehouseId?: string | null;
  currency?: string;
  notes?: string | null;
}


interface PurchaseOrderState {

  orders: PurchaseOrder[];

  tenantId: string | null;

  loadOrders(
    tenantId?: string,
  ): Promise<void>;

  getOrderById(
    id: string,
  ): PurchaseOrder | undefined;

  createDraft(
    input: CreatePurchaseOrderInput,
  ): Promise<PurchaseOrder>;

  updateOrder(
    id: string,
    updates: Partial<PurchaseOrder>,
  ): Promise<void>;

  addItem(
    orderId: string,
    item: PurchaseOrderItem,
  ): Promise<void>;

  submitOrder(
    id: string,
  ): Promise<void>;

  approveOrder(
    id: string,
  ): Promise<void>;

  cancelOrder(
    id: string,
  ): Promise<void>;

  receiveOrder(
    id: string,
  ): Promise<void>;
}


function requireTenantId(
  tenantId: string | null,
): string {

  if (!tenantId) {
    throw new Error(
      "Tenant ID is required.",
    );
  }

  return tenantId;
}


export const usePurchaseOrderStore =
  create<PurchaseOrderState>(
    (set, get) => ({

      orders: [],

      tenantId: null,


      loadOrders: async (
        tenantId,
      ) => {

        const resolvedTenantId =
          requireTenantId(
            tenantId ??
            get().tenantId,
          );

        const orders =
          await purchaseOrderService.getOrders(
            resolvedTenantId,
          );

        set({
          tenantId:
            resolvedTenantId,

          orders,
        });
      },


      getOrderById: (
        id,
      ) => {

        return get()
          .orders
          .find(
            (order) =>
              order.id === id,
          );
      },


      createDraft: async (
        input,
      ) => {

        const order =
          await purchaseOrderService.createDraft(
            input,
          );

        set((state) => ({
          tenantId:
            input.tenantId,

          orders: [
            ...state.orders,
            order,
          ],
        }));

        return order;
      },


      updateOrder: async (
        id,
        updates,
      ) => {

        const order =
          get()
            .orders
            .find(
              (item) =>
                item.id === id,
            );

        if (!order) {
          throw new Error(
            "Purchase order not found.",
          );
        }

        const updated =
          await purchaseOrderService.update(
            order.tenantId,
            id,
            updates,
          );

        if (!updated) {
          return;
        }

        set((state) => ({
          orders:
            state.orders.map(
              (item) =>
                item.id === id
                  ? updated
                  : item,
            ),
        }));
      },


      addItem: async (
        orderId,
        item,
      ) => {

        const order =
          get()
            .orders
            .find(
              (existing) =>
                existing.id === orderId,
            );

        if (!order) {
          throw new Error(
            "Purchase order not found.",
          );
        }

        const saved =
          await purchaseOrderService.addItem(
            order.tenantId,
            orderId,
            item,
          );

        if (!saved) {
          throw new Error(
            "Failed to add purchase order item.",
          );
        }

        const refreshed =
          await purchaseOrderService.getOrderById(
            order.tenantId,
            orderId,
          );

        if (!refreshed) {
          throw new Error(
            "Purchase order could not be reloaded.",
          );
        }

        set((state) => ({
          orders:
            state.orders.map(
              (existing) =>
                existing.id === orderId
                  ? refreshed
                  : existing,
            ),
        }));
      },


      submitOrder: async (
        id,
      ) => {

        const order =
          get()
            .orders
            .find(
              (item) =>
                item.id === id,
            );

        if (!order) {
          throw new Error(
            "Purchase order not found.",
          );
        }

        const updated =
          await purchaseOrderService.submit(
            order.tenantId,
            id,
          );

        if (!updated) {
          return;
        }

        set((state) => ({
          orders:
            state.orders.map(
              (item) =>
                item.id === id
                  ? updated
                  : item,
            ),
        }));
      },


      approveOrder: async (
        id,
      ) => {

        const order =
          get()
            .orders
            .find(
              (item) =>
                item.id === id,
            );

        if (!order) {
          throw new Error(
            "Purchase order not found.",
          );
        }

        const updated =
          await purchaseOrderService.approve(
            order.tenantId,
            id,
          );

        if (!updated) {
          return;
        }

        set((state) => ({
          orders:
            state.orders.map(
              (item) =>
                item.id === id
                  ? updated
                  : item,
            ),
        }));
      },


      cancelOrder: async (
        id,
      ) => {

        const order =
          get()
            .orders
            .find(
              (item) =>
                item.id === id,
            );

        if (!order) {
          throw new Error(
            "Purchase order not found.",
          );
        }

        const updated =
          await purchaseOrderService.cancel(
            order.tenantId,
            id,
          );

        if (!updated) {
          return;
        }

        set((state) => ({
          orders:
            state.orders.map(
              (item) =>
                item.id === id
                  ? updated
                  : item,
            ),
        }));
      },


      receiveOrder: async (
        id,
      ) => {

        const order =
          get()
            .orders
            .find(
              (item) =>
                item.id === id,
            );

        if (!order) {
          throw new Error(
            "Purchase order not found.",
          );
        }

        const updated =
          await purchaseOrderService.receive(
            order.tenantId,
            id,
          );

        if (!updated) {
          return;
        }

        set((state) => ({
          orders:
            state.orders.map(
              (item) =>
                item.id === id
                  ? updated
                  : item,
            ),
        }));
      },

    }),
  );
