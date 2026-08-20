import {
  create,
} from "zustand";


import {
  salesOrderService,
} from "../services/sales-order.service";


import {
  salesProcessingEngine,
} from "../engine";


import type {
  SalesOrder,
} from "../types/sales-order.types";


import type {
  SalesOrderItem,
} from "../types/sales-order-item.types";


interface CreateSalesOrderInput {

  tenantId: string;

  storeId: string;

  warehouseId: string;

  customerId?: string;

  notes?: string;

}


interface SalesOrderState {

  orders: SalesOrder[];

  tenantId: string | null;


  loadOrders(
    tenantId?: string,
  ): Promise<void>;


  getOrderById(
    id: string,
  ): SalesOrder | undefined;


  createDraft(
    input: CreateSalesOrderInput,
  ): Promise<SalesOrder>;


  addItem(
    orderId: string,
    item: SalesOrderItem,
  ): Promise<void>;


  confirmOrder(
    id: string,
  ): Promise<void>;


  processOrder(
    id: string,
  ): Promise<void>;


  cancelOrder(
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


export const useSalesOrderStore =
  create<SalesOrderState>(
    (set, get) => ({

      orders: [],

      tenantId: null,


      loadOrders: async (
        tenantId,
      ) => {

        const resolvedTenantId =
          tenantId ??
          get().tenantId;


        const resolved =
          requireTenantId(
            resolvedTenantId,
          );


        const orders =
          await salesOrderService.getOrders(
            resolved,
          );


        set({

          tenantId:
            resolved,

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
          await salesOrderService.createDraft(
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
            "Sales order not found.",
          );

        }


        const updated =
          await salesOrderService.addItem(
            order.tenantId,
            orderId,
            item,
          );


        if (!updated) {

          throw new Error(
            "Failed to update sales order.",
          );

        }


        set((state) => ({

          orders:
            state.orders.map(
              (existing) =>
                existing.id === orderId
                  ? updated
                  : existing,
            ),

        }));

      },


      confirmOrder: async (
        id,
      ) => {

        const order =
          get()
            .orders
            .find(
              (existing) =>
                existing.id === id,
            );


        if (!order) {

          throw new Error(
            "Sales order not found.",
          );

        }


        const updated =
          await salesOrderService.confirm(
            order.tenantId,
            id,
          );


        if (!updated) {

          return;

        }


        set((state) => ({

          orders:
            state.orders.map(
              (existing) =>
                existing.id === id
                  ? updated
                  : existing,
            ),

        }));

      },


      processOrder: async (
        id,
      ) => {

        const order =
          get()
            .orders
            .find(
              (existing) =>
                existing.id === id,
            );


        if (!order) {

          throw new Error(
            "Sales order not found.",
          );

        }


        const completedOrder =
          salesProcessingEngine.process(
            order,
          );


        const updated =
          await salesOrderService.update(
            order.tenantId,
            id,
            completedOrder,
          );


        if (!updated) {

          throw new Error(
            "Failed to process sales order.",
          );

        }


        set((state) => ({

          orders:
            state.orders.map(
              (existing) =>
                existing.id === id
                  ? updated
                  : existing,
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
              (existing) =>
                existing.id === id,
            );


        if (!order) {

          throw new Error(
            "Sales order not found.",
          );

        }


        const updated =
          await salesOrderService.cancel(
            order.tenantId,
            id,
          );


        if (!updated) {

          return;

        }


        set((state) => ({

          orders:
            state.orders.map(
              (existing) =>
                existing.id === id
                  ? updated
                  : existing,
            ),

        }));

      },

    }),
  );
