import {
  useState,
  type FormEvent,
} from "react";

import ProductSelector
  from "./ProductSelector";

import {
  useSalesOrders,
} from "../hooks/useSalesOrders";

interface AddSalesOrderItemFormProps {
  salesOrderId: string;
}

export default function AddSalesOrderItemForm({
  salesOrderId,
}: AddSalesOrderItemFormProps) {

  const {
    orders,
    addItem,
    loading,
  } = useSalesOrders();

  const activeOrder =
    orders.find(
      (order) =>
        order.id === salesOrderId &&
        order.status === "DRAFT",
    );

  const [
    productId,
    setProductId,
  ] = useState("");

  const [
    quantity,
    setQuantity,
  ] = useState("1");

  const [
    unitPrice,
    setUnitPrice,
  ] = useState("");

  const [
    discountAmount,
    setDiscountAmount,
  ] = useState("0");

  const [
    taxRate,
    setTaxRate,
  ] = useState("7");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    success,
    setSuccess,
  ] = useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    if (!activeOrder) {
      setError(
        "Sales order is required.",
      );
      return;
    }

    if (!productId.trim()) {
      setError(
        "Please select a product.",
      );
      return;
    }

    const parsedQuantity =
      Number(quantity);

    const parsedUnitPrice =
      Number(unitPrice);

    const parsedDiscount =
      Number(discountAmount || 0);

    const parsedTaxRate =
      Number(taxRate || 0);

    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      setError(
        "Quantity must be greater than zero.",
      );
      return;
    }

    if (
      !Number.isFinite(parsedUnitPrice) ||
      parsedUnitPrice < 0
    ) {
      setError(
        "Unit price must be zero or greater.",
      );
      return;
    }

    if (
      !Number.isFinite(parsedDiscount) ||
      parsedDiscount < 0
    ) {
      setError(
        "Discount must be zero or greater.",
      );
      return;
    }

    if (
      !Number.isFinite(parsedTaxRate) ||
      parsedTaxRate < 0 ||
      parsedTaxRate > 100
    ) {
      setError(
        "Tax rate must be between 0 and 100.",
      );
      return;
    }

    setSubmitting(true);

    try {
      await addItem(
        salesOrderId,
        {
          productId:
            productId.trim(),

          quantity:
            parsedQuantity,

          unitPrice:
            parsedUnitPrice,

          discountAmount:
            parsedDiscount,

          taxRate:
            parsedTaxRate,
        },
      );

      setSuccess(
        "Item added to the sales order.",
      );

      /*
       * Reset the form after a successful
       * add so another product can be added
       * to the SAME sales order.
       */
      setProductId("");
      setQuantity("1");
      setUnitPrice("");
      setDiscountAmount("0");
      setTaxRate("7");

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to add item.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">
        Add Sale Item
      </h2>

      {activeOrder && (
        <div className="mt-3 rounded border bg-gray-50 p-3 text-sm">
          <div className="font-medium">
            Active Sales Order
          </div>

          <div className="mt-1">
            {activeOrder.orderNumber}
          </div>

          <div className="mt-1 text-gray-600">
            Items:{" "}
            {activeOrder.items?.length ?? 0}
          </div>
        </div>
      )}

      {!activeOrder && (
        <div className="mt-3 rounded border bg-gray-50 p-3 text-sm text-gray-600">
          Create a sales order first.
        </div>
      )}

      {error && (
        <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-3 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-4 space-y-4"
      >
        <ProductSelector
          value={productId}
          onChange={setProductId}
          onPriceChange={setUnitPrice}
        />

        <div>
          <label className="mb-1 block text-sm font-medium">
            Quantity
          </label>

          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(event) =>
              setQuantity(
                event.target.value,
              )
            }
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Unit Price
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={unitPrice}
            onChange={(event) =>
              setUnitPrice(
                event.target.value,
              )
            }
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Discount
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={discountAmount}
            onChange={(event) =>
              setDiscountAmount(
                event.target.value,
              )
            }
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Tax Rate (%)
          </label>

          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={taxRate}
            onChange={(event) =>
              setTaxRate(
                event.target.value,
              )
            }
            className="w-full rounded border p-2"
          />
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            submitting ||
            !activeOrder ||
            !productId
          }
          className="rounded bg-black px-5 py-2 text-white disabled:opacity-50"
        >
          {submitting
            ? "Adding..."
            : "Add Item"}
        </button>
      </form>
    </div>
  );
}
