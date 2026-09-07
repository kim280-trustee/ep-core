import { useEffect, useState } from "react";
import { paymentService } from "@/features/payments/services/payment.service";
import type { PaymentMethod } from "@/features/payments/types/payment.types";
import { storeContext } from "@/core/store/store.context";
import { productRepositoryProvider } from "@/features/products/repositories/repository.provider";
import type { Product } from "@/features/products/types/product.types";
import type { SalesOrder } from "../types/sales-order.types";
import { useSalesOrders } from "../hooks/use-sales-orders";

export function SalesOrderList() {
  const { orders, loading, error, confirmOrder, processOrder, completeOrder, cancelOrder, refundOrder } = useSalesOrders();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      const context = storeContext.getStore();
      if (!context || orders.length === 0) return;

      const ids = [...new Set(orders.flatMap((order) => order.items.map((item) => item.productId)))];
      const result: Record<string, Product> = {};

      await Promise.all(
        ids.map(async (id) => {
          try {
            const product = await productRepositoryProvider.findById(context.tenantId, id);
            if (product) result[id] = product;
          } catch {
            // Keep the product ID as a fallback if lookup fails.
          }
        }),
      );

      if (active) setProducts(result);
    };

    void loadProducts();
    return () => {
      active = false;
    };
  }, [orders]);

  const handlePayment = async (order: SalesOrder) => {
    const context = storeContext.getStore();
    if (!context) {
      setPaymentError("Store context is not available.");
      return;
    }

    try {
      setPayingOrderId(order.id);
      setPaymentError(null);

      const summary = await paymentService.getOrderPaymentSummary(
        context.tenantId,
        order.id,
        order.totalAmount,
      );

      if (summary.status === "PAID") return;

      const payment = await paymentService.createPayment(
        context.tenantId,
        order.id,
        "CASH" as PaymentMethod,
        summary.outstandingAmount,
      );

      await paymentService.completePayment(
        context.tenantId,
        payment.id,
      );

      await completeOrder(order.id);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Payment could not be completed.");
    } finally {
      setPayingOrderId(null);
    }
  };

  if (loading) return <div className="p-4">Loading sales orders...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      {paymentError && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{paymentError}</div>}

      {orders.map((order) => (
        <div key={order.id} className="rounded-lg border p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-semibold">{order.orderNumber}</div>
              <div className="text-sm text-gray-600">Status: {order.status}</div>
              <div className="text-sm text-gray-600">Items: {order.items.length}</div>
              <div className="text-sm text-gray-600">Total: {order.totalAmount}</div>
            </div>

            <div className="flex flex-wrap gap-2">
              {order.status === "DRAFT" && (
                <>
                  <button type="button" onClick={() => void confirmOrder(order.id)} className="rounded bg-blue-600 px-3 py-2 text-sm text-white">Confirm</button>
                  <button type="button" onClick={() => void cancelOrder(order.id)} className="rounded border px-3 py-2 text-sm">Cancel</button>
                </>
              )}
              {order.status === "CONFIRMED" && (
                <>
                  <button type="button" onClick={() => void processOrder(order.id)} className="rounded bg-blue-600 px-3 py-2 text-sm text-white">Process Sale</button>
                  <button type="button" onClick={() => void cancelOrder(order.id)} className="rounded border px-3 py-2 text-sm">Cancel</button>
                </>
              )}
              {order.status === "PROCESSING" && (
                <>
                  <button type="button" onClick={() => void handlePayment(order)} disabled={payingOrderId === order.id} className="rounded bg-green-600 px-3 py-2 text-sm text-white disabled:opacity-50">
                    {payingOrderId === order.id ? "Processing Payment..." : "Pay & Complete Sale"}
                  </button>
                  <button type="button" onClick={() => void cancelOrder(order.id)} className="rounded border px-3 py-2 text-sm">Cancel</button>
                </>
              )}
              {order.status === "COMPLETED" && (
                <button type="button" onClick={() => void refundOrder(order.id)} className="rounded bg-amber-600 px-3 py-2 text-sm text-white">Refund</button>
              )}
            </div>
          </div>

          <div>
            <div className="font-medium">Sale Items</div>
            <div className="space-y-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 text-sm text-gray-600">
                  <span>{item.quantity} × {products[item.productId]?.name ?? item.productId}</span>
                  <span>{item.lineTotal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
