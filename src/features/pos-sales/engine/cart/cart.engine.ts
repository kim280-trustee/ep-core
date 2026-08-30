import type {
  SaleItem,
} from "../../types/sale-item.types";

export class CartEngine {
  addItem(
    cart: SaleItem[],
    item: SaleItem,
  ): SaleItem[] {
    const existingIndex =
      cart.findIndex(
        (existing) =>
          existing.productId ===
          item.productId,
      );

    if (existingIndex < 0) {
      return [
        ...cart,
        item,
      ];
    }

    const existing =
      cart[existingIndex];

    const merged: SaleItem = {
      ...existing,
      quantity:
        existing.quantity +
        item.quantity,
      discountAmount:
        existing.discountAmount +
        item.discountAmount,
      taxAmount:
        (existing.taxAmount ?? 0) + (item.taxAmount ?? 0),
      lineTotal:
        existing.lineTotal +
        item.lineTotal,
    };

    const result =
      [...cart];

    result[existingIndex] =
      merged;

    return result;
  }

  updateQuantity(
    cart: SaleItem[],
    productId: string,
    quantity: number,
  ): SaleItem[] {
    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      return cart.filter(
        (item) =>
          item.productId !==
          productId,
      );
    }

    return cart.map(
      (item) => {
        if (
          item.productId !==
          productId
        ) {
          return item;
        }

        const unitAmount =
          item.unitPrice;

        const discountPerUnit =
          item.quantity > 0
            ? item.discountAmount /
              item.quantity
            : 0;

        const taxRate =
          item.taxRate;

        const subtotal =
          quantity *
          unitAmount;

        const discountAmount =
          quantity *
          discountPerUnit;

        const taxable =
          Math.max(
            0,
            subtotal -
              discountAmount,
          );

        const taxAmount =
          taxable *
          (taxRate / 100);

        return {
          ...item,
          quantity,
          discountAmount,
          taxAmount,
          lineTotal:
            taxable +
            taxAmount,
        };
      },
    );
  }

  removeItem(
    cart: SaleItem[],
    productId: string,
  ): SaleItem[] {
    return cart.filter(
      (item) =>
        item.productId !==
        productId,
    );
  }

  clear(): SaleItem[] {
    return [];
  }
}

export const cartEngine =
  new CartEngine();
