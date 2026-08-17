/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Inventory Module
 *
 * Receive Stock Form
 * ============================================================
 */

import {
  useEffect,
  useState,
} from "react";

import {
  useProductsStore,
} from "@/features/products";

import {
  storeContext,
} from "@/core/store/store.context";

import {
  inventoryTransactionService,
} from "@/features/inventory-transactions";

import {
  inventoryService,
} from "../services/inventory.service";

import {
  useInventoryStore,
} from "../store/inventory.store";


export function ReceiveStockForm() {

  const products =
    useProductsStore(
      (state) =>
        state.products,
    );


  const loadProducts =
    useProductsStore(
      (state) =>
        state.loadProducts,
    );


  const setRecords =
    useInventoryStore(
      (state) =>
        state.setRecords,
    );


  const [
    productId,
    setProductId,
  ] = useState("");


  const [
    quantity,
    setQuantity,
  ] = useState(0);


  const [
    cost,
    setCost,
  ] = useState(0);


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  useEffect(() => {

    if (
      products.length === 0
    ) {

      void loadProducts();

    }

  }, [
    products.length,
    loadProducts,
  ]);


  async function handleSubmit() {

    setMessage("");


    const context =
      storeContext.getStore();


    if (!context) {

      setMessage(
        "Store context is not initialized.",
      );

      return;

    }


    if (!productId) {

      setMessage(
        "Please select a product.",
      );

      return;

    }


    if (quantity <= 0) {

      setMessage(
        "Quantity must be greater than zero.",
      );

      return;

    }


    if (cost < 0) {

      setMessage(
        "Cost cannot be negative.",
      );

      return;

    }


    setSubmitting(true);


    try {

      const warehouseId =
        context.storeId;


      await inventoryTransactionService.receiveStock(

        productId,

        warehouseId,

        quantity,

        cost,

        undefined,

        "Stock received",

      );


      const updatedInventory =
        await inventoryService.getInventory(
          context.tenantId,
        );


      setRecords(
        updatedInventory,
      );


      setMessage(
        "Stock received successfully.",
      );


      setQuantity(0);

      setCost(0);

      setProductId("");


    } catch (error) {

      console.error(
        "Failed to receive stock:",
        error,
      );


      setMessage(

        error instanceof Error

          ? error.message

          : "Unable to receive stock.",

      );

    } finally {

      setSubmitting(false);

    }

  }


  return (

    <div
      className="
        border
        rounded
        p-4
        flex
        flex-col
        gap-4
      "
    >

      <h2 className="font-semibold">
        Receive Stock
      </h2>


      <label>
        Product
      </label>


      <select
        value={productId}
        onChange={(event) =>
          setProductId(
            event.target.value,
          )
        }
        className="
          border
          rounded
          p-2
        "
        disabled={submitting}
      >

        <option value="">
          Select Product
        </option>


        {products.map(
          (product) => (

            <option
              key={product.id}
              value={product.id}
            >

              {product.name}

              {" ("}

              {product.identifiers.sku}

              {")"}

            </option>

          ),
        )}

      </select>


      <label>
        Quantity
      </label>


      <input
        type="number"
        min="0"
        value={quantity}
        onChange={(event) =>
          setQuantity(
            Number(
              event.target.value,
            ),
          )
        }
        className="
          border
          rounded
          p-2
        "
        disabled={submitting}
      />


      <label>
        Cost Per Unit
      </label>


      <input
        type="number"
        min="0"
        value={cost}
        onChange={(event) =>
          setCost(
            Number(
              event.target.value,
            ),
          )
        }
        className="
          border
          rounded
          p-2
        "
        disabled={submitting}
      />


      <button
        type="button"
        onClick={() => {
          void handleSubmit();
        }}
        disabled={submitting}
        className="
          bg-black
          text-white
          rounded
          p-2
          disabled:opacity-50
        "
      >

        {submitting
          ? "Receiving..."
          : "Receive Stock"}

      </button>


      {message && (

        <p>
          {message}
        </p>

      )}

    </div>

  );

}
