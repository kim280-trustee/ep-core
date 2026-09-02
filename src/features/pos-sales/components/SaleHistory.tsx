import {
  useState,
} from "react";

import {
  useSalesOrderStore,
} from "@/features/sales/store/sales-order.store";

import type {
  SalesOrder,
} from "@/features/sales/types/sales-order.types";

function formatMoney(
  value: number,
): string {
  return Number(value ?? 0).toFixed(2);
}

function formatDate(
  value: string,
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString();
}

function getStatusClass(
  status: SalesOrder["status"],
): string {

  if (status === "COMPLETED") {
    return "bg-green-100 text-green-800";
  }

  if (status === "REFUNDED") {
    return "bg-purple-100 text-purple-800";
  }

  if (status === "CANCELLED") {
    return "bg-red-100 text-red-800";
  }

  return "bg-gray-100 text-gray-800";
}

export function SaleHistory() {

  const orders =
    useSalesOrderStore(
      (state) =>
        state.orders,
    );

  const loading =
    useSalesOrderStore(
      (state) =>
        state.loading,
    );

  const error =
    useSalesOrderStore(
      (state) =>
        state.error,
    );

  const loadOrders =
    useSalesOrderStore(
      (state) =>
        state.loadOrders,
    );

  const refundOrder =
    useSalesOrderStore(
      (state) =>
        state.refundOrder,
    );

  const [
    expandedOrderId,
    setExpandedOrderId,
  ] = useState<string | null>(
    null,
  );

  const [
    refundingOrderId,
    setRefundingOrderId,
  ] = useState<string | null>(
    null,
  );

  const [
    refundError,
    setRefundError,
  ] = useState<string | null>(
    null,
  );

  const sales =
    orders.filter(
      (order) =>
        order.status === "COMPLETED" ||
        order.status === "REFUNDED" ||
        order.status === "CANCELLED",
    );

  function toggleOrder(
    orderId: string,
  ) {

    setExpandedOrderId(
      (current) =>
        current === orderId
          ? null
          : orderId,
    );
  }

  async function refresh() {

    try {
      await loadOrders();
    } catch {
      // Store already contains the user-facing error.
    }
  }

  async function handleRefund(
    order: SalesOrder,
  ) {

    if (order.status !== "COMPLETED") {
      return;
    }

    const confirmed =
      window.confirm(
        `Refund sale ${order.orderNumber} for ${formatMoney(order.totalAmount)}? This will return the items to stock and refund the completed payment.`,
      );

    if (!confirmed) {
      return;
    }

    setRefundError(null);
    setRefundingOrderId(order.id);

    try {

      await refundOrder(
        order.id,
      );

      setExpandedOrderId(null);

      await loadOrders();

    } catch (refundFailure) {

      setRefundError(
        refundFailure instanceof Error
          ? refundFailure.message
          : "The sale could not be refunded.",
      );

    } finally {

      setRefundingOrderId(null);
    }
  }

  return (
    <div className="rounded border p-4">

      <div className="flex items-center justify-between gap-4">

        <div>
          <h2 className="font-medium">
            Recent Sales
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Completed sales and sale history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void refresh();
          }}
          disabled={loading || refundingOrderId !== null}
          className="rounded border px-3 py-2 text-sm disabled:opacity-50"
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>

      {error && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {refundError && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Refund failed: {refundError}
        </div>
      )}

      {loading && sales.length === 0 && (
        <p className="mt-4 text-sm text-gray-600">
          Loading sales...
        </p>
      )}

      {!loading && sales.length === 0 && !error && (
        <p className="mt-4 text-sm text-gray-600">
          No completed sales yet.
        </p>
      )}

      {sales.length > 0 && (
        <div className="mt-4 space-y-3">

          {sales.map(
            (order) => {

              const expanded =
                expandedOrderId ===
                order.id;

              const refunding =
                refundingOrderId ===
                order.id;

              return (
                <div
                  key={order.id}
                  className="rounded border"
                >

                  <button
                    type="button"
                    onClick={() =>
                      toggleOrder(
                        order.id,
                      )
                    }
                    className="w-full p-4 text-left"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <p className="font-medium">
                          {order.orderNumber}
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                          {formatDate(
                            order.createdAt,
                          )}
                        </p>
                      </div>

                      <div className="text-right">

                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-medium ${getStatusClass(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>

                        <p className="mt-2 font-semibold">
                          {formatMoney(
                            order.totalAmount,
                          )}
                        </p>

                      </div>

                    </div>

                    <div className="mt-3 flex gap-4 text-sm text-gray-600">

                      <span>
                        {order.items.length}{" "}
                        {order.items.length === 1
                          ? "item"
                          : "items"}
                      </span>

                      <span>
                        Total:{" "}
                        {formatMoney(
                          order.totalAmount,
                        )}
                      </span>

                    </div>

                  </button>

                  {expanded && (
                    <div className="border-t bg-gray-50 p-4">

                      <div className="space-y-3">

                        {order.items.map(
                          (item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-4 text-sm"
                            >

                              <div>
                                <p className="font-medium">
                                  Product{" "}
                                  {item.productId}
                                </p>

                                <p className="text-gray-600">
                                  {item.quantity} ×{" "}
                                  {formatMoney(
                                    item.unitPrice,
                                  )}
                                </p>
                              </div>

                              <div className="text-right">

                                {item.discountAmount > 0 && (
                                  <p className="text-gray-600">
                                    Discount:{" "}
                                    {formatMoney(
                                      item.discountAmount,
                                    )}
                                  </p>
                                )}

                                <p className="font-medium">
                                  {formatMoney(
                                    item.lineTotal,
                                  )}
                                </p>

                              </div>

                            </div>
                          ),
                        )}

                      </div>

                      <div className="mt-4 border-t pt-3 text-sm">

                        <div className="flex justify-between">
                          <span>
                            Subtotal
                          </span>

                          <span>
                            {formatMoney(
                              order.subtotal,
                            )}
                          </span>
                        </div>

                        {order.discountAmount > 0 && (
                          <div className="mt-1 flex justify-between">
                            <span>
                              Discount
                            </span>

                            <span>
                              -{formatMoney(
                                order.discountAmount,
                              )}
                            </span>
                          </div>
                        )}

                        <div className="mt-1 flex justify-between">
                          <span>
                            Tax
                          </span>

                          <span>
                            {formatMoney(
                              order.taxAmount,
                            )}
                          </span>
                        </div>

                        <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
                          <span>
                            Total
                          </span>

                          <span>
                            {formatMoney(
                              order.totalAmount,
                            )}
                          </span>
                        </div>

                      </div>

                      {order.status === "COMPLETED" && (
                        <div className="mt-4 border-t pt-4">

                          <button
                            type="button"
                            onClick={() => {
                              void handleRefund(
                                order,
                              );
                            }}
                            disabled={
                              refunding ||
                              refundingOrderId !== null
                            }
                            className="w-full rounded bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {refunding
                              ? "Processing Refund..."
                              : "Refund Sale"}
                          </button>

                          <p className="mt-2 text-center text-xs text-gray-500">
                            The payment will be refunded and the sold stock will be returned.
                          </p>

                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            },
          )}

        </div>
      )}

    </div>
  );
}
