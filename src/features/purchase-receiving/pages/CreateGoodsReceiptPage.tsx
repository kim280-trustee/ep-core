import { useEffect, useState } from "react";

import {
  useProductsStore,
} from "@/features/products";

import {
  usePurchaseOrderStore,
} from "@/features/purchasing/store/purchase-order.store";

import {
  storeContext,
} from "@/core/store/store.context";

import {
  goodsReceiptService,
} from "../services/goods-receipt.service";


export default function CreateGoodsReceiptPage() {

  const products =
    useProductsStore(
      (state) => state.products,
    );

  const loadProducts =
    useProductsStore(
      (state) => state.loadProducts,
    );

  const purchaseOrders =
    usePurchaseOrderStore(
      (state) => state.orders,
    );

  const loadPurchaseOrders =
    usePurchaseOrderStore(
      (state) => state.loadOrders,
    );

  const context =
    storeContext.getStore();

  const [purchaseOrderId, setPurchaseOrderId] =
    useState("");

  const [productId, setProductId] =
    useState("");

  const [quantity, setQuantity] =
    useState(0);

  const [cost, setCost] =
    useState(0);

  const [message, setMessage] =
    useState("");


  useEffect(() => {

    void loadProducts();

  }, [loadProducts]);


  useEffect(() => {

    if (!context?.tenantId) {
      return;
    }

    void loadPurchaseOrders(
      context.tenantId,
    );

  }, [
    context?.tenantId,
    loadPurchaseOrders,
  ]);


  async function handleSubmit() {

    setMessage("");

    if (!context?.tenantId) {
      setMessage(
        "Tenant context is not initialized.",
      );
      return;
    }

    if (!context.storeId) {
      setMessage(
        "Store context is not initialized.",
      );
      return;
    }

    if (!purchaseOrderId) {
      setMessage(
        "Please select a purchase order.",
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

    try {

      await goodsReceiptService.createReceipt({

        tenantId:
          context.tenantId,

        storeId:
          context.storeId,

        purchaseOrderId,

        supplierId:
          purchaseOrders.find(
            (order) =>
              order.id === purchaseOrderId,
          )?.supplierId ?? "",

        warehouseId:
          context.storeId,

        items: [
          {
            id:
              crypto.randomUUID(),

            goodsReceiptId:
              "",

            purchaseOrderItemId:
              "",

            productId,

            quantityReceived:
              quantity,

            unitCost:
              cost,

            lineTotal:
              quantity * cost,
          },
        ],

      });

      setMessage(
        "Stock received successfully.",
      );

      setPurchaseOrderId("");
      setProductId("");
      setQuantity(0);
      setCost(0);

    } catch (error) {

      console.error(
        "Failed to create goods receipt:",
        error,
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to receive stock.",
      );

    }

  }


  return (

    <div>

      <h1>
        Create Goods Receipt
      </h1>

      <p>
        Receive stock against a purchase order.
      </p>


      <div>

        <label>
          Purchase Order
        </label>

        <select
          value={purchaseOrderId}
          onChange={(event) =>
            setPurchaseOrderId(
              event.target.value,
            )
          }
        >

          <option value="">
            Select Purchase Order
          </option>

          {purchaseOrders.map(
            (order) => (

              <option
                key={order.id}
                value={order.id}
              >
                {order.orderNumber}
                {" — "}
                {order.status}
              </option>

            ),
          )}

        </select>

      </div>


      <div>

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

      </div>


      <div>

        <label>
          Quantity to Receive
        </label>

        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(event) =>
            setQuantity(
              Number(event.target.value),
            )
          }
        />

      </div>


      <div>

        <label>
          Cost Per Unit
        </label>

        <input
          type="number"
          min="0"
          value={cost}
          onChange={(event) =>
            setCost(
              Number(event.target.value),
            )
          }
        />

      </div>


      <button
        type="button"
        onClick={handleSubmit}
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
