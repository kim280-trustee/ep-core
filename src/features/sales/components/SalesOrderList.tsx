import {
  useSalesOrders,
} from "../hooks/useSalesOrders";

export default function SalesOrderList() {
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

  async function handleComplete(orderId: string) {
    try {
      await completeOrder(orderId);
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

  if (loading && orders.length === 0) {
    return (
      <div className="rounded border bg-white p-4">
        Loading sales orders...
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">
        Sales Orders
      </h2>

      {error && (
        <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="mt-4 rounded border bg-gray-50 p-4 text-sm text-gray-600">
          No sales orders found.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
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
                    Status:{" "}
                    <span className="font-medium">
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-1 text-sm text-gray-600">
                    Items: {order.items?.length ?? 0}
                  </div>

                  <div className="mt-1 text-sm font-medium">
                    Total: {order.totalAmount}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {order.status === "DRAFT" && (
                    <>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          void handleConfirm(order.id);
                        }}
                        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                      >
                        Confirm
                      </button>

                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          void handleCancel(order.id);
                        }}
                        className="rounded border px-4 py-2 text-sm disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {order.status === "CONFIRMED" && (
                    <>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          void handleProcess(order.id);
                        }}
                        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                      >
                        Process Sale
                      </button>

                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          void handleCancel(order.id);
                        }}
                        className="rounded border px-4 py-2 text-sm disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {order.status === "PROCESSING" && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        void handleComplete(order.id);
                      }}
                      className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                      Complete Sale
                    </button>
                  )}

                  {order.status === "COMPLETED" && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        void handleRefund(order.id);
                      }}
                      className="rounded border px-4 py-2 text-sm disabled:opacity-50"
                    >
                      Refund
                    </button>
                  )}

                  {order.status === "CANCELLED" && (
                    <span className="rounded bg-gray-100 px-3 py-2 text-sm text-gray-600">
                      Cancelled
                    </span>
                  )}

                  {order.status === "REFUNDED" && (
                    <span className="rounded bg-gray-100 px-3 py-2 text-sm text-gray-600">
                      Refunded
                    </span>
                  )}

                  {order.status === "COMPLETED" && (
                    <span className="rounded bg-gray-100 px-3 py-2 text-sm text-gray-600">
                      Completed
                    </span>
                  )}
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <div className="text-sm font-medium">
                    Sale Items
                  </div>

                  <div className="mt-2 space-y-1">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm text-gray-600"
                      >
                        <span>
                          {item.quantity} × {item.unitPrice}
                        </span>

                        <span>
                          {item.lineTotal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
