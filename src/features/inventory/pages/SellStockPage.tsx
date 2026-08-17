/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Inventory Module
 * ------------------------------------------------------------
 * Sell Stock Page
 * ============================================================
 */

import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  inventoryTransactionService,
} from "@/features/inventory-transactions/services/inventory-transaction.service";

import {
  supabase,
} from "@/core/infrastructure/supabase/client";

import {
  storeContext,
} from "@/core/store/store.context";


interface ProductOption {
  id: string;
  name: string;
}


export function SellStockPage() {

  const [products, setProducts] =
    useState<ProductOption[]>([]);

  const [productId, setProductId] =
    useState("");

  const [warehouseId, setWarehouseId] =
    useState(
      storeContext.getStore()?.storeId ?? "",
    );

  const [quantity, setQuantity] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {

    async function loadProducts() {

      setLoadingProducts(true);

      setError(null);

      const {
        data,
        error: productsError,
      } =
        await supabase
          .from("products")
          .select("id, name")
          .order(
            "name",
            {
              ascending: true,
            },
          );


      if (productsError) {

        console.error(
          "Failed to load products:",
          productsError,
        );

        setError(
          productsError.message,
        );

        setProducts([]);

      } else {

        setProducts(
          data ?? [],
        );

      }


      setLoadingProducts(false);

    }


    void loadProducts();

  }, []);


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {

    event.preventDefault();

    setMessage(null);

    setError(null);


    const context =
      storeContext.getStore();


    if (!context) {

      setError(
        "Store context is not initialized.",
      );

      return;

    }


    if (!productId) {

      setError(
        "Please select a product.",
      );

      return;

    }


    if (!warehouseId) {

      setError(
        "Warehouse ID is required.",
      );

      return;

    }


    const parsedQuantity =
      Number(quantity);


    if (
      !Number.isFinite(
        parsedQuantity,
      ) ||
      parsedQuantity <= 0
    ) {

      setError(
        "Quantity must be greater than zero.",
      );

      return;

    }


    setLoading(true);


    try {

      await inventoryTransactionService.sellStock(
        productId,
        warehouseId,
        parsedQuantity,
        undefined,
        "Stock sold",
      );


      setMessage(
        `Successfully sold ${parsedQuantity} unit(s).`,
      );


      setQuantity("");

    } catch (error) {

      console.error(
        "Failed to sell stock:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to sell stock.",
      );

    } finally {

      setLoading(false);

    }

  }


  return (

    <div className="p-6 space-y-6">

      <div>

        <h1 className="text-2xl font-semibold">
          Sell Stock
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Record a stock-out transaction.
        </p>

      </div>


      <form
        onSubmit={handleSubmit}
        className="border rounded-lg p-6 space-y-5 max-w-xl"
      >

        <div>

          <label
            htmlFor="product"
            className="block text-sm font-medium mb-2"
          >
            Product
          </label>


          <select
            id="product"
            value={productId}
            onChange={(event) => {
              setProductId(
                event.target.value,
              );
            }}
            disabled={
              loadingProducts ||
              loading
            }
            className="
              w-full
              border
              rounded
              px-3
              py-2
            "
          >

            <option value="">

              {loadingProducts
                ? "Loading products..."
                : "Select product"}

            </option>


            {products.map(
              (product) => (

                <option
                  key={product.id}
                  value={product.id}
                >

                  {product.name}

                </option>

              ),
            )}

          </select>

        </div>


        <div>

          <label
            htmlFor="warehouse"
            className="block text-sm font-medium mb-2"
          >
            Warehouse ID
          </label>


          <input
            id="warehouse"
            type="text"
            value={warehouseId}
            onChange={(event) => {
              setWarehouseId(
                event.target.value,
              );
            }}
            disabled={loading}
            className="
              w-full
              border
              rounded
              px-3
              py-2
            "
          />

        </div>


        <div>

          <label
            htmlFor="quantity"
            className="block text-sm font-medium mb-2"
          >
            Quantity
          </label>


          <input
            id="quantity"
            type="number"
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={(event) => {
              setQuantity(
                event.target.value,
              );
            }}
            disabled={loading}
            placeholder="Enter quantity"
            className="
              w-full
              border
              rounded
              px-3
              py-2
            "
          />

        </div>


        {message && (

          <div className="border rounded p-4">
            {message}
          </div>

        )}


        {error && (

          <div className="border rounded p-4 text-red-600">
            {error}
          </div>

        )}


        <button
          type="submit"
          disabled={
            loading ||
            loadingProducts
          }
          className="
            border
            rounded
            px-4
            py-2
            disabled:opacity-50
          "
        >

          {loading
            ? "Processing..."
            : "Sell Stock"}

        </button>

      </form>

    </div>

  );

}
