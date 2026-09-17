import {
  useEffect,
  useState,
} from "react";

import {
  storeContext,
} from "@/core/store/store.context";

import {
  productRepositoryProvider,
} from "@/features/products/repositories";

import type {
  Product,
} from "@/features/products/types/product.types";

import {
  paymentService,
} from "@/features/payments/services/payment.service";

import {
  receiptEngine,
} from "@/features/pos-sales/engine";

import {
  ReceiptView,
} from "@/features/pos-sales/components/ReceiptView";

import {
  useSalesOrders,
} from "@/features/sales/hooks/useSalesOrders";

import type {
  SalesOrder,
} from "@/features/sales/types/sales-order.types";

export default function ReceiptsPage() {
  const {
    orders,
    loading,
    error,
  } = useSalesOrders();

  const [
    products,
    setProducts,
  ] = useState<Product[]>([]);

  const [
    selectedOrderId,
    setSelectedOrderId,
  ] = useState<string | null>(null);

  const [
    receipt,
    setReceipt,
  ] = useState<ReturnType<typeof receiptEngine.generate> | null>(null);

  const [
    receiptLoading,
    setReceiptLoading,
  ] = useState(false);

  const [
    receiptError,
    setReceiptError,
  ] = useState<string | null>(null);

  const salesWithReceipts = orders.filter(
    (order) =>
      order.status === "COMPLETED" ||
      order.status === "REFUNDED",
  );

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      const tenantId =
        storeContext.getStore()?.tenantId;

      if (!tenantId) return;

      const productIds = Array.from(
        new Set(
          orders
            .filter(
              (order) =>
                order.status === "COMPLETED" ||
                order.status === "REFUNDED",
            )
            .flatMap((order) =>
              (order.items ?? []).map(
                (item) => item.productId,
              ),
            ),
        ),
      );

      try {
        const loaded = await Promise.all(
          productIds.map((productId) =>
            productRepositoryProvider.findById(
              tenantId,
              productId,
            ),
          ),
        );

        if (cancelled) return;

        setProducts(
          loaded.filter(
            (product): product is Product =>
              product !== null,
          ),
        );
      } catch {
        if (!cancelled) setProducts([]);
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [orders]);

  async function handleViewReceipt(order: SalesOrder) {
    const tenantId =
      storeContext.getStore()?.tenantId;

    setSelectedOrderId(order.id);
    setReceiptLoading(true);
    setReceiptError(null);
    setReceipt(null);

    try {
      if (!tenantId) {
        throw new Error(
          "Store context is unavailable.",
        );
      }

      const payments =
        await paymentService.getPaymentsForOrder(
          tenantId,
          order.id,
        );

      const payment =
        payments.find(
          (item) =>
            item.status === "COMPLETED" ||
            item.status === "REFUNDED",
        ) ?? payments[0];

      setReceipt(
        receiptEngine.generate(
          order,
          payment,
        ),
      );
    } catch (failure) {
      setReceiptError(
        failure instanceof Error
          ? failure.message
          : "Unable to load the receipt.",
      );
    } finally {
      setReceiptLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Receipts
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          View and print receipts for completed sales.
        </p>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && salesWithReceipts.length === 0 && (
        <div className="rounded border bg-white p-4 text-sm text-slate-600">
          Loading receipts...
        </div>
      )}

      {!loading && salesWithReceipts.length === 0 && !error && (
        <div className="rounded border bg-gray-50 p-4 text-sm text-gray-600">
          No receipts found.
        </div>
      )}

      {salesWithReceipts.length > 0 && (
        <div className="space-y-3">
          {salesWithReceipts.map((order) => {
            const showing = selectedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="rounded-lg border bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Total: {Number(order.totalAmount).toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Status: {order.status}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleViewReceipt(order)}
                    disabled={receiptLoading && showing}
                    className="w-full rounded border px-4 py-2 text-sm font-medium disabled:opacity-50 sm:w-auto"
                  >
                    {receiptLoading && showing
                      ? "Loading Receipt..."
                      : "View Receipt"}
                  </button>
                </div>

                {showing && (
                  <div className="mt-4 border-t pt-4">
                    {receiptError && (
                      <div className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {receiptError}
                      </div>
                    )}

                    {receipt && (
                      <ReceiptView
                        receipt={receipt}
                        products={products}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
