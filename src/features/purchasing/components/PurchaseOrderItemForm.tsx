import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import type {
  PurchaseOrderItem,
} from "../types/purchase-order-item.types";

import {
  useProductSearch,
} from "@/features/products/hooks/useProductSearch";

import {
  storeContext,
} from "@/core/store/store.context";


interface PurchaseOrderItemFormProps {

  purchaseOrderId: string;

  tenantId?: string;

  productId?: string;

  onAddItem: (
    item: PurchaseOrderItem,
  ) => void | Promise<void>;

  onCancel?: () => void;

}


export function PurchaseOrderItemForm({
  purchaseOrderId,
  tenantId = "",
  productId: initialProductId = "",
  onAddItem,
  onCancel,
}: PurchaseOrderItemFormProps) {

  const context =
    storeContext.getStore();

  const effectiveTenantId =
    tenantId ||
    context?.tenantId ||
    "";

  const [
    productSearch,
    setProductSearch,
  ] = useState("");

  const [
    selectedProductId,
    setSelectedProductId,
  ] = useState(
    initialProductId,
  );

  const [
    selectedProductName,
    setSelectedProductName,
  ] = useState("");

  const [
    quantity,
    setQuantity,
  ] = useState("");

  const [
    unitCost,
    setUnitCost,
  ] = useState("");

  const [
    taxRate,
    setTaxRate,
  ] = useState("0");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    adding,
    setAdding,
  ] = useState(false);


  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError,
  } =
    useProductSearch(
      effectiveTenantId,
      productSearch,
    );


  useEffect(() => {

    if (!selectedProductId) {
      return;
    }

    const selected =
      products.find(
        product =>
          product.id ===
          selectedProductId,
      );

    if (!selected) {
      return;
    }

    setSelectedProductName(
      selected.name,
    );

  }, [
    products,
    selectedProductId,
  ]);


  function handleProductSearchChange(
    value: string,
  ) {

    setProductSearch(value);

    setSelectedProductId("");

    setSelectedProductName("");

    setError("");

  }


  function handleSelectProduct(
    product: typeof products[number],
  ) {

    setSelectedProductId(
      product.id,
    );

    setSelectedProductName(
      product.name,
    );

    setProductSearch(
      product.name,
    );

    setUnitCost(
      String(
        product.costPrice ?? 0,
      ),
    );

    setTaxRate(
      String(
        product.tax?.taxRate ?? 0,
      ),
    );

    setError("");

  }


  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {

    event.preventDefault();

    setError("");


    if (!selectedProductId) {

      setError(
        "Please select a product from the search results.",
      );

      return;

    }


    const parsedQuantity =
      Number(quantity);


    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0
    ) {

      setError(
        "Quantity must be greater than zero.",
      );

      return;

    }


    const parsedUnitCost =
      Number(unitCost);


    if (
      !Number.isFinite(parsedUnitCost) ||
      parsedUnitCost < 0
    ) {

      setError(
        "Unit cost must be zero or greater.",
      );

      return;

    }


    const parsedTaxRate =
      Number(taxRate || 0);


    if (
      !Number.isFinite(parsedTaxRate) ||
      parsedTaxRate < 0
    ) {

      setError(
        "Tax rate must be zero or greater.",
      );

      return;

    }


    const lineSubtotal =
      parsedQuantity *
      parsedUnitCost;


    const taxAmount =
      lineSubtotal *
      (parsedTaxRate / 100);


    const lineTotal =
      lineSubtotal +
      taxAmount;


    const now =
      new Date().toISOString();


    const item: PurchaseOrderItem = {

      id:
        crypto.randomUUID(),

      tenantId:
        tenantId,

      purchaseOrderId,

      productId:
        selectedProductId,

      quantity:
        parsedQuantity,

      receivedQuantity:
        0,

      unitCost:
        parsedUnitCost,

      taxRate:
        parsedTaxRate,

      taxAmount,

      lineTotal,

      notes:
        notes.trim() || null,

      createdAt:
        now,

      updatedAt:
        now,

    };


    setAdding(true);


    Promise.resolve(
      onAddItem(item),
    )
      .then(() => {

        setProductSearch("");

        setSelectedProductId("");

        setSelectedProductName("");

        setQuantity("");

        setUnitCost("");

        setTaxRate("0");

        setNotes("");

      })
      .catch((caughtError) => {

        console.error(
          "Failed to add purchase order item:",
          caughtError,
        );

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to add purchase order item.",
        );

      })
      .finally(() => {

        setAdding(false);

      });

  }


  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >

      <div>

        <label
          htmlFor="purchase-product-search"
          className="block text-sm font-medium"
        >
          Product
        </label>


        <input
          id="purchase-product-search"
          type="text"
          value={productSearch}
          onChange={(event) =>
            handleProductSearchChange(
              event.target.value,
            )
          }
          placeholder="Search product name, SKU, or barcode"
          autoComplete="off"
          className="mt-1 w-full rounded border px-3 py-2"
        />


        {productsLoading && (
          <p className="mt-1 text-sm text-gray-500">
            Searching products...
          </p>
        )}


        {productsError && (
          <p className="mt-1 text-sm text-red-600">
            Unable to search products.
          </p>
        )}


        {!selectedProductId &&
          productSearch.trim().length > 0 &&
          !productsLoading &&
          products.length === 0 &&
          !productsError && (

            <p className="mt-1 text-sm text-gray-500">
              No matching products found.
            </p>

          )}


        {!selectedProductId &&
          products.length > 0 && (

            <div className="mt-1 max-h-48 overflow-y-auto rounded border bg-white">

              {products.map(
                (product) => (

                  <button
                    key={product.id}
                    type="button"
                    onClick={() =>
                      handleSelectProduct(
                        product,
                      )
                    }
                    className="block w-full border-b px-3 py-2 text-left last:border-b-0 hover:bg-gray-100"
                  >

                    <div className="font-medium">
                      {product.name}
                    </div>

                    <div className="text-xs text-gray-500">

                      SKU:
                      {" "}
                      {product.sku}

                      {" • "}

                      Cost:
                      {" "}
                      {product.costPrice}

                    </div>

                  </button>

                ),
              )}

            </div>

          )}


        {selectedProductId && (
          <p className="mt-1 text-sm text-green-700">

            Selected:
            {" "}
            {selectedProductName}

          </p>
        )}

      </div>


      <div>

        <label
          htmlFor="purchase-quantity"
          className="block text-sm font-medium"
        >
          Quantity
        </label>


        <input
          id="purchase-quantity"
          type="number"
          min="0.01"
          step="0.01"
          value={quantity}
          onChange={(event) =>
            setQuantity(
              event.target.value,
            )
          }
          className="mt-1 w-full rounded border px-3 py-2"
        />

      </div>


      <div>

        <label
          htmlFor="purchase-unit-cost"
          className="block text-sm font-medium"
        >
          Unit Cost
        </label>


        <input
          id="purchase-unit-cost"
          type="number"
          min="0"
          step="0.01"
          value={unitCost}
          onChange={(event) =>
            setUnitCost(
              event.target.value,
            )
          }
          className="mt-1 w-full rounded border px-3 py-2"
        />

      </div>


      <div>

        <label
          htmlFor="purchase-tax-rate"
          className="block text-sm font-medium"
        >
          Tax Rate (%)
        </label>


        <input
          id="purchase-tax-rate"
          type="number"
          min="0"
          step="0.01"
          value={taxRate}
          onChange={(event) =>
            setTaxRate(
              event.target.value,
            )
          }
          className="mt-1 w-full rounded border px-3 py-2"
        />

      </div>


      <div>

        <label
          htmlFor="purchase-notes"
          className="block text-sm font-medium"
        >
          Notes
        </label>


        <textarea
          id="purchase-notes"
          value={notes}
          onChange={(event) =>
            setNotes(
              event.target.value,
            )
          }
          rows={3}
          className="mt-1 w-full rounded border px-3 py-2"
        />

      </div>


      {error && (

        <p className="text-sm text-red-600">
          {error}
        </p>

      )}


      <div className="flex gap-2">

        <button
          type="submit"
          disabled={
            adding ||
            !selectedProductId
          }
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {adding
            ? "Adding..."
            : "Add Item"}
        </button>


        {onCancel && (

          <button
            type="button"
            onClick={onCancel}
            className="rounded border px-4 py-2"
          >
            Cancel
          </button>

        )}

      </div>

    </form>

  );

}
