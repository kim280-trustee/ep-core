import { create } from "zustand";

import type {
  SaleItem,
} from "../types/sale-item.types";

interface PosSalesState {
  items: SaleItem[];

  sales: never[];

  tenantId: string;
  storeId: string;
  warehouseId: string;
  customerId?: string;

  addItem: (
    item: SaleItem,
  ) => void;

  updateItem: (
    itemId: string,
    updates: Partial<SaleItem>,
  ) => void;

  removeItem: (
    itemId: string,
  ) => void;

  clearCart: () => void;

  setItems: (
    items: SaleItem[],
  ) => void;

  setSales: (
    sales: never[],
  ) => void;

  setContext: (
    context: {
      tenantId?: string;
      storeId?: string;
      warehouseId?: string;
      customerId?: string;
    },
  ) => void;

  getSubtotal: () => number;

  getTaxAmount: () => number;

  getDiscountAmount: () => number;

  getTotal: () => number;
}

function roundMoney(
  value: number,
): number {
  return Math.round(
    (value + Number.EPSILON) * 100,
  ) / 100;
}

function calculateItem(
  item: SaleItem,
): SaleItem {
  const quantity = Math.max(
    0,
    Number(item.quantity),
  );

  const unitPrice = Math.max(
    0,
    Number(item.unitPrice),
  );

  const discountAmount = Math.max(
    0,
    Number(item.discountAmount ?? 0),
  );

  const taxRate = Math.max(
    0,
    Number(item.taxRate ?? 0),
  );

  const subtotal = roundMoney(
    quantity * unitPrice,
  );

  const discount = roundMoney(
    Math.min(
      discountAmount,
      subtotal,
    ),
  );

  const taxableAmount = roundMoney(
    subtotal - discount,
  );

  const taxAmount = roundMoney(
    taxableAmount *
      (taxRate / 100),
  );

  const lineTotal = roundMoney(
    taxableAmount + taxAmount,
  );

  return {
    ...item,
    quantity,
    unitPrice,
    discountAmount: discount,
    taxRate,
    taxAmount,
    lineTotal,
  };
}

export const usePosSalesStore =
  create<PosSalesState>((set, get) => ({
    items: [],

    sales: [],

    tenantId: "",
    storeId: "",
    warehouseId: "",
    customerId: undefined,

    addItem: (
      item,
    ) =>
      set((state) => {
        const calculated =
          calculateItem(item);

        if (
          calculated.quantity <= 0
        ) {
          return state;
        }

        const existingIndex =
          state.items.findIndex(
            (existing) =>
              existing.productId ===
              calculated.productId,
          );

        if (existingIndex < 0) {
          return {
            items: [
              ...state.items,
              calculated,
            ],
          };
        }

        const existing =
          state.items[existingIndex];

        const merged =
          calculateItem({
            ...existing,

            quantity:
              existing.quantity +
              calculated.quantity,

            discountAmount:
              existing.discountAmount +
              calculated.discountAmount,
          });

        const items =
          [...state.items];

        items[existingIndex] =
          merged;

        return {
          items,
        };
      }),

    updateItem: (
      itemId,
      updates,
    ) =>
      set((state) => ({
        items:
          state.items.map(
            (item) => {
              if (
                item.id !== itemId
              ) {
                return item;
              }

              const next =
                calculateItem({
                  ...item,
                  ...updates,
                  id: item.id,
                  saleId: item.saleId,
                });

              return next.quantity > 0
                ? next
                : item;
            },
          ),
      })),

    removeItem: (
      itemId,
    ) =>
      set((state) => ({
        items:
          state.items.filter(
            (item) =>
              item.id !== itemId,
          ),
      })),

    clearCart: () =>
      set({
        items: [],
      }),

    setItems: (
      items,
    ) =>
      set({
        items:
          items
            .map(calculateItem)
            .filter(
              (item) =>
                item.quantity > 0,
            ),
      }),

    setSales: (
      sales,
    ) =>
      set({
        sales,
      }),

    setContext: (
      context,
    ) =>
      set((state) => ({
        tenantId:
          context.tenantId ??
          state.tenantId,

        storeId:
          context.storeId ??
          state.storeId,

        warehouseId:
          context.warehouseId ??
          state.warehouseId,

        customerId:
          context.customerId !==
          undefined
            ? context.customerId
            : state.customerId,
      })),

    getSubtotal: () =>
      roundMoney(
        get().items.reduce(
          (sum, item) =>
            sum +
            roundMoney(
              item.quantity *
                item.unitPrice,
            ),
          0,
        ),
      ),

    getDiscountAmount: () =>
      roundMoney(
        get().items.reduce(
          (sum, item) =>
            sum +
            Number(
              item.discountAmount ?? 0,
            ),
          0,
        ),
      ),

    getTaxAmount: () =>
      roundMoney(
        get().items.reduce(
          (sum, item) =>
            sum +
            Number(
              item.taxAmount ?? 0,
            ),
          0,
        ),
      ),

    getTotal: () =>
      roundMoney(
        get().items.reduce(
          (sum, item) =>
            sum +
            Number(
              item.lineTotal ?? 0,
            ),
          0,
        ),
      ),
  }));
