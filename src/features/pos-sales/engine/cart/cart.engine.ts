import type {
  SaleItem,
} from "../../types";

export class CartEngine {

  addItem(
    cart: SaleItem[],
    item: SaleItem,
  ): SaleItem[] {

    const existing =
      cart.find(
        (cartItem) =>
          cartItem.productId ===
          item.productId,
      );

    if (existing) {

      return cart.map(
        (cartItem) =>

          cartItem.productId ===
          item.productId
            ? {

                ...cartItem,

                quantity:
                  cartItem.quantity +
                  item.quantity,

                lineTotal:
                  (cartItem.quantity +
                    item.quantity) *
                  cartItem.unitPrice,

              }
            : cartItem,
      );

    }

    return [

      ...cart,

      item,

    ];

  }



  removeItem(
    cart: SaleItem[],
    itemId: string,
  ): SaleItem[] {

    return cart.filter(
      (item) =>
        item.id !== itemId,
    );

  }



  updateQuantity(
    cart: SaleItem[],
    itemId: string,
    quantity: number,
  ): SaleItem[] {

    return cart.map(
      (item) =>

        item.id === itemId

          ? {

              ...item,

              quantity,

              lineTotal:
                quantity *
                item.unitPrice,

            }

          : item,
    );

  }



  clear(): SaleItem[] {

    return [];

  }

}


export const cartEngine =
  new CartEngine();