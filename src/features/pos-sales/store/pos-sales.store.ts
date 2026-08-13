import {
  create,
} from "zustand";

import type {
  SaleItem,
} from "../types";

import {
  storeContext,
} from "@/core/store/store.context";

interface PosSalesState {

  tenantId: string;

  storeId: string;

  warehouseId?: string;

  customerId?: string;

  items: SaleItem[];

  paymentMethod?: string;

  amountPaid: number;

  setTenant(
    tenantId: string,
  ): void;

  setStore(
    storeId: string,
  ): void;

  setWarehouse(
    warehouseId: string,
  ): void;

  setCustomer(
    customerId?: string,
  ): void;

  addItem(
    item: SaleItem,
  ): void;

  removeItem(
    productId: string,
  ): void;

  clearCart(): void;

  setPayment(
    method: string,
    amount: number,
  ): void;

  getSubtotal(): number;

  getTaxAmount(): number;

  getTotal(): number;
}

function getInitialContext() {

  const context =
    storeContext.getStore();

  return {
    tenantId:
      context?.tenantId ?? "",

    storeId:
      context?.storeId ?? "",
  };
}

export const usePosSalesStore =
  create<PosSalesState>(
    (set, get) => {

      const context =
        getInitialContext();

      return {

        tenantId:
          context.tenantId,

        storeId:
          context.storeId,

        warehouseId:
          undefined,

        customerId:
          undefined,

        items: [],

        paymentMethod:
          undefined,

        amountPaid:
          0,

        setTenant(
          tenantId,
        ) {
          set({
            tenantId,
          });
        },

        setStore(
          storeId,
        ) {
          set({
            storeId,
          });
        },

        setWarehouse(
          warehouseId,
        ) {
          set({
            warehouseId,
          });
        },

        setCustomer(
          customerId,
        ) {
          set({
            customerId,
          });
        },

        addItem(
          item,
        ) {

          set((state) => {

            const existing =
              state.items.find(
                (x) =>
                  x.productId ===
                  item.productId,
              );

            if (existing) {

              return {
                items:
                  state.items.map(
                    (x) =>
                      x.productId ===
                      item.productId
                        ? {
                            ...x,

                            quantity:
                              x.quantity +
                              item.quantity,

                            lineTotal:
                              (
                                x.quantity +
                                item.quantity
                              ) *
                              x.unitPrice,
                          }
                        : x,
                  ),
              };

            }

            return {
              items: [
                ...state.items,
                item,
              ],
            };

          });
        },

        removeItem(
          productId,
        ) {

          set((state) => ({
            items:
              state.items.filter(
                (x) =>
                  x.productId !==
                  productId,
              ),
          }));

        },

        clearCart() {

          set({

            items: [],

            customerId:
              undefined,

            paymentMethod:
              undefined,

            amountPaid:
              0,

          });

        },

        setPayment(
          method,
          amount,
        ) {

          set({

            paymentMethod:
              method,

            amountPaid:
              amount,

          });

        },

        getSubtotal() {

          return get()
            .items
            .reduce(
              (
                sum,
                item,
              ) =>
                sum +
                item.lineTotal,
              0,
            );

        },

        getTaxAmount() {

          return get()
            .items
            .reduce(
              (
                sum,
                item,
              ) =>
                sum +
                (
                  item.lineTotal *
                  (
                    item.taxRate /
                    100
                  )
                ),
              0,
            );

        },

        getTotal() {

          return (
            get().getSubtotal() +
            get().getTaxAmount()
          );

        },

      };
    },
  );
