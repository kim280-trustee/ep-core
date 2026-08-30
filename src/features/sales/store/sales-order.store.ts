import { create } from "zustand";

import {
  salesOrderService,
} from "../services/sales-order.service";

import type {
  SalesOrder,
} from "../types/sales-order.types";

import {
  storeContext,
} from "@/core/store/store.context";

interface CreateDraftInput {
  tenantId: string;
  storeId: string;
  warehouseId: string;
  customerId?: string;
  notes?: string;
}

interface AddItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  taxRate?: number;
}

interface SalesOrderState {

  orders: SalesOrder[];

  loading: boolean;

  error: string | null;

  loadOrders: () => Promise<void>;

  createDraft: (
    input: CreateDraftInput,
  ) => Promise<SalesOrder>;

  addItem: (
    orderId: string,
    input: AddItemInput,
  ) => Promise<SalesOrder>;

  confirmOrder: (
    orderId: string,
  ) => Promise<SalesOrder>;

  processOrder: (
    orderId: string,
  ) => Promise<SalesOrder>;

  completeOrder: (
    orderId: string,
  ) => Promise<SalesOrder>;

  cancelOrder: (
    orderId: string,
  ) => Promise<SalesOrder>;

  refundOrder: (
    orderId: string,
  ) => Promise<SalesOrder>;

  clearError: () => void;
}

export const useSalesOrderStore =
  create<SalesOrderState>(
    (set) => ({

      orders: [],

      loading: false,

      error: null,

      loadOrders:
        async () => {

          const context =
            storeContext.getStore();

          if (
            !context?.tenantId ||
            !context.storeId
          ) {
            set({
              orders: [],
              error: null,
            });

            return;
          }

          set({
            loading: true,
            error: null,
          });

          try {

            const orders =
              await salesOrderService
                .getOrders(
                  context.tenantId,
                );

            const storeOrders =
              orders.filter(
                (order) =>
                  order.storeId ===
                  context.storeId,
              );

            set({
              orders:
                storeOrders,

              loading:
                false,

              error:
                null,
            });

          } catch (error) {

            const message =
              error instanceof Error
                ? error.message
                : "Failed to load sales orders.";

            set({
              loading:
                false,

              error:
                message,
            });

            throw error;
          }
        },

      createDraft:
        async (
          input,
        ) => {

          set({
            loading: true,
            error: null,
          });

          try {

            const order =
              await salesOrderService
                .createDraft(
                  input,
                );

            set(
              (state) => ({
                orders: [
                  order,
                  ...state.orders,
                ],

                loading:
                  false,

                error:
                  null,
              }),
            );

            return order;

          } catch (error) {

            const message =
              error instanceof Error
                ? error.message
                : "Failed to create sales order.";

            set({
              loading:
                false,

              error:
                message,
            });

            throw error;
          }
        },

      addItem:
        async (
          orderId,
          input,
        ) => {

          set({
            loading: true,
            error: null,
          });

          try {

            const updated =
              await salesOrderService
                .addItem(
                  orderId,
                  input,
                );

            set(
              (state) => ({
                orders:
                  state.orders.map(
                    (order) =>
                      order.id ===
                      updated.id
                        ? updated
                        : order,
                  ),

                loading:
                  false,

                error:
                  null,
              }),
            );

            return updated;

          } catch (error) {

            const message =
              error instanceof Error
                ? error.message
                : "Failed to add sales order item.";

            set({
              loading:
                false,

              error:
                message,
            });

            throw error;
          }
        },

      confirmOrder:
        async (
          orderId,
        ) => {

          set({
            loading: true,
            error: null,
          });

          try {

            const updated =
              await salesOrderService
                .confirmOrder(
                  orderId,
                );

            set(
              (state) => ({
                orders:
                  state.orders.map(
                    (order) =>
                      order.id ===
                      updated.id
                        ? updated
                        : order,
                  ),

                loading:
                  false,

                error:
                  null,
              }),
            );

            return updated;

          } catch (error) {

            const message =
              error instanceof Error
                ? error.message
                : "Failed to confirm sales order.";

            set({
              loading:
                false,

              error:
                message,
            });

            throw error;
          }
        },

      processOrder:
        async (
          orderId,
        ) => {

          set({
            loading: true,
            error: null,
          });

          try {

            const updated =
              await salesOrderService
                .processOrder(
                  orderId,
                );

            set(
              (state) => ({
                orders:
                  state.orders.map(
                    (order) =>
                      order.id ===
                      updated.id
                        ? updated
                        : order,
                  ),

                loading:
                  false,

                error:
                  null,
              }),
            );

            return updated;

          } catch (error) {

            const message =
              error instanceof Error
                ? error.message
                : "Failed to process sales order.";

            set({
              loading:
                false,

              error:
                message,
            });

            throw error;
          }
        },

      completeOrder:
        async (
          orderId,
        ) => {

          set({
            loading: true,
            error: null,
          });

          try {

            const updated =
              await salesOrderService
                .completeOrder(
                  orderId,
                );

            set(
              (state) => ({
                orders:
                  state.orders.map(
                    (order) =>
                      order.id ===
                      updated.id
                        ? updated
                        : order,
                  ),

                loading:
                  false,

                error:
                  null,
              }),
            );

            return updated;

          } catch (error) {

            const message =
              error instanceof Error
                ? error.message
                : "Failed to complete sales order.";

            set({
              loading:
                false,

              error:
                message,
            });

            throw error;
          }
        },

      cancelOrder:
        async (
          orderId,
        ) => {

          set({
            loading: true,
            error: null,
          });

          try {

            const updated =
              await salesOrderService
                .cancelOrder(
                  orderId,
                );

            set(
              (state) => ({
                orders:
                  state.orders.map(
                    (order) =>
                      order.id ===
                      updated.id
                        ? updated
                        : order,
                  ),

                loading:
                  false,

                error:
                  null,
              }),
            );

            return updated;

          } catch (error) {

            const message =
              error instanceof Error
                ? error.message
                : "Failed to cancel sales order.";

            set({
              loading:
                false,

              error:
                message,
            });

            throw error;
          }
        },

      refundOrder:
        async (
          orderId,
        ) => {

          set({
            loading: true,
            error: null,
          });

          try {

            const updated =
              await salesOrderService
                .refundOrder(
                  orderId,
                );

            set(
              (state) => ({
                orders:
                  state.orders.map(
                    (order) =>
                      order.id ===
                      updated.id
                        ? updated
                        : order,
                  ),

                loading:
                  false,

                error:
                  null,
              }),
            );

            return updated;

          } catch (error) {

            const message =
              error instanceof Error
                ? error.message
                : "Failed to refund sales order.";

            set({
              loading:
                false,

              error:
                message,
            });

            throw error;
          }
        },

      clearError:
        () =>
          set({
            error: null,
          }),
    }),
  );
