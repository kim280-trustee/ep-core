import {
  useState,
  type FormEvent,
} from "react";

import ProductSelector
  from "./ProductSelector";

import {
  useSalesOrders,
} from "../hooks/useSalesOrders";

import { useTranslation } from "@/core/i18n/useTranslation";

interface AddSalesOrderItemFormProps {
  salesOrderId: string;
}

export default function AddSalesOrderItemForm({
  salesOrderId,
}: AddSalesOrderItemFormProps) {
  const { t } = useTranslation();

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
      setError(t("sales.salesOrderRequired"));
      return;
    }

    if (!productId.trim()) {
      setError(t("sales.selectProduct"));
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
      setError(t("sales.quantityGreaterThanZero"));
      return;
    }

    if (
      !Number.isFinite(parsedUnitPrice) ||
      parsedUnitPrice < 0
    ) {
      setError(t("sales.unitPriceZeroOrGreater"));
      return;
    }

    if (
      !Number.isFinite(parsedDiscount) ||
      parsedDiscount < 0
    ) {
      setError(t("sales.discountZeroOrGreater"));
      return;
    }

    if (
      !Number.isFinite(parsedTaxRate) ||
      parsedTaxRate < 0 ||
      parsedTaxRate > 100
    ) {
      setError(t("sales.taxRateBetweenZeroAnd100"));
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
        t("sales.itemAdded"),
      );

      setProductId("");
      setQuantity("1");
      setUnitPrice("");
      setDiscountAmount("0");
      setTaxRate("7");

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t("sales.failedToAddItem"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">
        {t("sales.addSaleItem")}
      </h2>

      {activeOrder && (
        <div className="mt-3 rounded border bg-gray-50 p-3 text-sm">
          <div className="font-medium">
            {t("sales.activeSalesOrder")}
          </div>

          <div className="mt-1">
            {activeOrder.orderNumber}
          </div>

          <div className="mt-1 text-gray-600">
            {t("sales.items")}:{" "}
            {activeOrder.items?.length ?? 0}
          </div>
        </div>
      )}

      {!activeOrder && (
        <div className="mt-3 rounded border bg-gray-50 p-3 text-sm text-gray-600">
          {t("sales.createOrderFirst")}
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
            {t("sales.quantity")}
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
            {t("sales.unitPrice")}
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
            {t("sales.discount")}
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
            {t("sales.taxRate")}
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
            ? t("sales.adding")
            : t("sales.addItem")}
        </button>
      </form>
    </div>
  );
}
