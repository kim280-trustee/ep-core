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

  useEffect(() => {

    if (
      products.length === 0
    ) {
      loadProducts();
    }

  }, [
    products.length,
    loadProducts,
  ]);

  function handleSubmit() {

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
        "Please select a product",
      );

      return;
    }

    if (quantity <= 0) {
      setMessage(
        "Quantity must be greater than zero",
      );

      return;
    }

    /*
     * The current inventory service expects
     * a warehouse ID. Until warehouse selection
     * is implemented in this form, use the
     * active store ID as the contextual scope.
     *
     * This removes the hardcoded default warehouse.
     */
    const warehouseId =
      context.storeId;

    const existing =
      inventoryService.getInventoryRecord(
        productId,
        warehouseId,
      );

    if (existing) {

      inventoryService.increaseStock(
        existing,
        quantity,
        cost,
      );

    } else {

      inventoryService.createInventoryRecord({

        id:
          crypto.randomUUID(),

        tenantId:
          context.tenantId,

        productId,

        warehouseId,

        quantityOnHand:
          quantity,

        reservedQuantity:
          0,

        availableQuantity:
          quantity,

        averageCost:
          cost,

        minimumStockLevel:
          0,

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),

      });

    }

    setRecords(
      inventoryService.getInventory(),
    );

    setMessage(
      "Stock received successfully",
    );

    setQuantity(0);
    setCost(0);
    setProductId("");
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
      />

      <button
        type="button"
        onClick={handleSubmit}
        className="
          bg-black
          text-white
          rounded
          p-2
        "
      >
        Receive Stock
      </button>

      {message && (
        <p>
          {message}
        </p>
      )}

    </div>
  );
}
