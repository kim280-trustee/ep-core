import {
  useState,
  type FormEvent,
} from "react";


import type {
  PurchaseOrderItem,
} from "../types/purchase-order-item.types";


interface PurchaseOrderItemFormProps {

  purchaseOrderId: string;

  tenantId?: string;

  productId?: string;

  onAddItem: (
    item: PurchaseOrderItem,
  ) => void;

  onCancel?: () => void;

}


export function PurchaseOrderItemForm({
  purchaseOrderId,
  tenantId = "",
  productId: initialProductId = "",
  onAddItem,
  onCancel,
}: PurchaseOrderItemFormProps) {


  const [
    productId,
    setProductId,
  ] = useState(
    initialProductId,
  );


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


  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {

    event.preventDefault();

    setError("");


    if (!productId.trim()) {

      setError(
        "Product is required.",
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

      tenantId,

      purchaseOrderId,

      productId:
        productId.trim(),

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


    onAddItem(item);


    setProductId(
      initialProductId,
    );

    setQuantity("");

    setUnitCost("");

    setTaxRate("0");

    setNotes("");

  }


  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >

      <div>

        <label
          htmlFor="purchase-product-id"
          className="block text-sm font-medium"
        >
          Product
        </label>


        <input
          id="purchase-product-id"
          type="text"
          value={productId}
          onChange={(event) =>
            setProductId(
              event.target.value,
            )
          }
          placeholder="Product ID"
          className="mt-1 w-full rounded border px-3 py-2"
        />

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
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Add Item
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