import {
  useEffect,
  useState,
} from "react";

import {
  productRepositoryProvider,
} from "@/features/products/repositories";

import type {
  Product,
} from "@/features/products/types/product.types";

import {
  storeContext,
} from "@/core/store/store.context";

import {
  paymentService,
} from "@/features/payments/services/payment.service";

import type {
  PaymentMethod,
  Payment,
} from "@/features/payments/types/payment.types";

import {
  useSalesOrders,
} from "../hooks/useSalesOrders";

import type {
  SalesOrder,
} from "../types/sales-order.types";

import { receiptEngine } from "@/features/pos-sales/engine";
import { ReceiptView } from "@/features/pos-sales/components/ReceiptView";

import { useTranslation } from "@/core/i18n/useTranslation";

export default function SalesOrderList() {
  const { t } = useTranslation();

  const {
    orders,
    loading,
    error,
    confirmOrder,
    processOrder,
    completeOrder,
    cancelOrder,
    refundOrder,
  } = useSalesOrders();

  const [
    productNames,
    setProductNames,
  ] = useState<Record<string, string>>({});

  const [
    products,
    setProducts,
  ] = useState<Product[]>([]);

  const [
    payingOrderId,
    setPayingOrderId,
  ] = useState<string | null>(null);

  const [
    paymentError,
    setPaymentError,
  ] = useState<string | null>(null);

  const [
    receiptOrderId,
    setReceiptOrderId,
  ] = useState<string | null>(null);

  const [
    receiptLoading,
    setReceiptLoading,
  ] = useState(false);

  const [
    receiptError,
    setReceiptError,
  ] = useState<string | null>(null);

  const [
    receipt,
    setReceipt,
  ] = useState<ReturnType<typeof receiptEngine.generate> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProductNames() {
      const tenantId =
        storeContext.getStore()?.tenantId;

      if (!tenantId) return;

      const productIds = Array.from(
        new Set(
          orders.flatMap((order) =>
            (order.items ?? []).map(
              (item) => item.productId,
            ),
          ),
        ),
      );

      try {
        const loadedProducts = await Promise.all(
          productIds.map((productId) =>
            productRepositoryProvider.findById(
              tenantId,
              productId,
            ),
          ),
        );

        if (cancelled) return;

        const names: Record<string, string> = {};
        const resolvedProducts: Product[] = [];

        loadedProducts.forEach((product, index) => {
          if (product) {
            names[productIds[index]] = product.name;
            resolvedProducts.push(product);
          }
        });

        setProductNames(names);
        setProducts(resolvedProducts);
      } catch {
        // Keep the sales list usable if product lookup fails.
      }
    }

    void loadProductNames();

    return () => {
      cancelled = true;
    };
  }, [orders]);

  async function handleConfirm(orderId: string) {
    try {
      await confirmOrder(orderId);
    } catch {
      // Store already captures the error.
    }
  }

  async function handleProcess(orderId: string) {
    try {
      await processOrder(orderId);
    } catch {
      // Store already captures the error.
    }
  }

  async function handleCancel(orderId: string) {
    try {
      await cancelOrder(orderId);
    } catch {
      // Store already captures the error.
    }
  }

  async function handleRefund(orderId: string) {
    try {
      await refundOrder(orderId);
    } catch {
      // Store already captures the error.
    }
  }

  async function handlePayment(order: SalesOrder) {
    const tenantId =
      storeContext.getStore()?.tenantId;

    if (!tenantId) {
      setPaymentError(t("sales.storeContextUnavailable"));
      return;
    }

    try {
      setPayingOrderId(order.id);
      setPaymentError(null);

      const summary =
        await paymentService.getOrderPaymentSummary(
          tenantId,
          order.id,
          order.totalAmount,
        );

      if (summary.status === "PAID") {
        await completeOrder(order.id);
        return;
      }

      const payment =
        await paymentService.createPayment(
          tenantId,
          order.id,
          "CASH" as PaymentMethod,
          summary.outstandingAmount,
        );

      await paymentService.completePayment(
        tenantId,
        payment.id,
      );

      await completeOrder(order.id);
    } catch (err) {
      setPaymentError(
        err instanceof Error
          ? err.message
          : t("sales.paymentCouldNotBeCompleted"),
      );
    } finally {
      setPayingOrderId(null);
    }
  }

  async function handleViewReceipt(order: SalesOrder) {
    const tenantId =
      storeContext.getStore()?.tenantId;

    setReceiptOrderId(order.id);
    setReceiptLoading(true);
    setReceiptError(null);
    setReceipt(null);

    try {
      if (!tenantId) {
        throw new Error(
          t("sales.storeContextUnavailable"),
        );
      }

      const payments =
        await paymentService.getPaymentsForOrder(
          tenantId,
          order.id,
        );

      const payment: Payment | undefined =
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
          : "Unable to load the sale receipt.",
      );
    } finally {
      setReceiptLoading(false);
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="rounded border bg-white p-4">
        {t("sales.loadingSalesOrders")}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">
        {t("sales.salesOrders")}
      </h2>

      {error && (
        <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {paymentError && (
        <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {paymentError}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="mt-4 rounded border bg-gray-50 p-4 text-sm text-gray-600">
          {t("sales.noSalesOrders")}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((order) => {
            const showingReceipt =
              receiptOrderId === order.id;

            return (
              <div
                key={order.id}
                className="rounded-lg border bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold">
                      {order.orderNumber}
                    </div>

                    <div className="mt-1 text-sm text-gray-600">
                      {t("common.status")}:{" "}
                      <span className="font-medium">
                        {order.status}
                      </span>
                    </div>

                    <div className="mt-1 text-sm text-gray-600">
                      {t("sales.items")}:{" "}
                      {order.items?.length ?? 0}
                    </div>

                    <div className="mt-1 text-sm font-medium">
                      {t("common.total")}:{" "}
                      {order.totalAmount}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.status === "DRAFT" && (
                      <>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => void handleConfirm(order.id)}
                          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                        >
                          {t("common.confirm")}
                        </button>

                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => void handleCancel(order.id)}
                          className="rounded border px-4 py-2 text-sm disabled:opacity-50"
                        >
                          {t("common.cancel")}
                        </button>
                      </>
                    )}

                    {order.status === "CONFIRMED" && (
                      <>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => void handleProcess(order.id)}
                          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                        >
                          {t("sales.processSale")}
                        </button>

                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => void handleCancel(order.id)}
                          className="rounded border px-4 py-2 text-sm disabled:opacity-50"
                        >
                          {t("common.cancel")}
                        </button>
                      </>
                    )}

                    {order.status === "PROCESSING" && (
                      <>
                        <button
                          type="button"
                          disabled={
                            loading ||
                            payingOrderId === order.id
                          }
                          onClick={() => void handlePayment(order)}
                          className="rounded bg-green-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                        >
                          {payingOrderId === order.id
                            ? t("sales.processingPayment")
                            : t("sales.payAndCompleteSale")}
                        </button>

                        <button
                          type="button"
                          disabled={
                            loading ||
                            payingOrderId === order.id
                          }
                          onClick={() => void handleCancel(order.id)}
                          className="rounded border px-4 py-2 text-sm disabled:opacity-50"
                        >
                          {t("common.cancel")}
                        </button>
                      </>
                    )}

                    {(order.status === "COMPLETED" ||
                      order.status === "REFUNDED") && (
                      <button
                        type="button"
                        disabled={
                          receiptLoading && showingReceipt
                        }
                        onClick={() => void handleViewReceipt(order)}
                        className="rounded border bg-white px-4 py-2 text-sm font-medium disabled:opacity-50"
                      >
                        {receiptLoading && showingReceipt
                          ? "Loading Receipt..."
                          : "View Receipt"}
                      </button>
                    )}

                    {order.status === "COMPLETED" && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => void handleRefund(order.id)}
                        className="rounded border px-4 py-2 text-sm disabled:opacity-50"
                      >
                        {t("sales.refund")}
                      </button>
                    )}

                    {order.status === "CANCELLED" && (
                      <span className="rounded bg-gray-100 px-3 py-2 text-sm text-gray-600">
                        {t("status.cancelled")}
                      </span>
                    )}
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mt-4 border-t pt-3">
                    <div className="text-sm font-medium">
                      {t("sales.saleItems")}
                    </div>

                    <div className="mt-2 space-y-1">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between gap-4 text-sm text-gray-600"
                        >
                          <span>
                            {item.quantity} ×{" "}
                            {productNames[item.productId] ??
                              t("sales.product")}
                          </span>

                          <span>
                            {item.lineTotal}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showingReceipt && (
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
