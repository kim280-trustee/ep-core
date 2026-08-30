import {
  useState,
} from "react";

import {
  usePosSalesStore,
} from "../store/pos-sales.store";

import {
  useSalesOrders,
} from "@/features/sales/hooks/useSalesOrders";


export function CheckoutPanel() {

  const [
    message,
    setMessage,
  ] = useState("");

  const items =
    usePosSalesStore(
      (state) =>
        state.items,
    );

  const tenantId =
    usePosSalesStore(
      (state) =>
        state.tenantId,
    );

  const storeId =
    usePosSalesStore(
      (state) =>
        state.storeId,
    );

  const warehouseId =
    usePosSalesStore(
      (state) =>
        state.warehouseId,
    );

  const clearCart =
    usePosSalesStore(
      (state) =>
        state.clearCart,
    );

  const subtotal =
    usePosSalesStore(
      (state) =>
        state.getSubtotal(),
    );

  const tax =
    usePosSalesStore(
      (state) =>
        state.getTaxAmount(),
    );

  const total =
    usePosSalesStore(
      (state) =>
        state.getTotal(),
    );

  const {
    createDraft,
    addItem,
    confirmOrder,
    processOrder,
    completeOrder,
  } = useSalesOrders();


  async function completeSale() {

    setMessage("");

    try {

      if (items.length === 0) {
        throw new Error(
          "Cart is empty.",
        );
      }

      if (!tenantId) {
        throw new Error(
          "Tenant is required.",
        );
      }

      if (!storeId) {
        throw new Error(
          "Store is required.",
        );
      }

      if (!warehouseId) {
        throw new Error(
          "Warehouse is required.",
        );
      }


      const draft =
        await createDraft({

          tenantId,

          storeId,

          warehouseId,

        });


      let order =
        draft;


      for (const item of items) {

        order =
          await addItem(
            order.id,
            {
              productId:
                item.productId,

              quantity:
                item.quantity,

              unitPrice:
                item.unitPrice,

              discountAmount:
                item.discountAmount,

              taxRate:
                item.taxRate,

            },
          );

      }


      order =
        await confirmOrder(
          order.id,
        );


      order =
        await processOrder(
          order.id,
        );


      order =
        await completeOrder(
          order.id,
        );


      clearCart();


      setMessage(
        `Sale completed: ${order.orderNumber}`,
      );

    } catch (error) {

      console.error(
        "POS sale failed:",
        error,
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Sale failed.",
      );

    }

  }


  return (

    <div className="rounded border p-4">

      <h2 className="font-medium">
        Checkout
      </h2>


      <div className="mt-4 space-y-2">

        <p>
          Subtotal: {subtotal}
        </p>

        <p>
          Tax: {tax}
        </p>

        <p className="font-semibold">
          Total: {total}
        </p>

      </div>


      <button
        type="button"
        disabled={
          items.length === 0
        }
        className="mt-4 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        onClick={() => {
          void completeSale();
        }}
      >
        Complete Sale
      </button>


      {message && (

        <p className="mt-4 text-sm">
          {message}
        </p>

      )}

    </div>

  );

}
