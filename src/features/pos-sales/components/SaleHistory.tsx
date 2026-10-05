import { useRef, useState } from "react";
import { useSalesOrderStore } from "@/features/sales/store/sales-order.store";
import type { SalesOrder } from "@/features/sales/types/sales-order.types";
import type { SalesOrderRefundItem } from "@/features/sales/services/sales-order.service";
import type { Product } from "@/features/products/types/product.types";
import { paymentService } from "@/features/payments/services/payment.service";
import { receiptEngine } from "../engine";
import { ReceiptView } from "./ReceiptView";

function formatMoney(value: number): string { return Number(value ?? 0).toFixed(2); }
function formatDate(value: string): string { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString(); }
function getStatusClass(status: SalesOrder["status"]): string {
  if (status === "COMPLETED") return "bg-green-100 text-green-800";
  if (status === "REFUNDED") return "bg-purple-100 text-purple-800";
  if (status === "CANCELLED") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
}

interface SaleHistoryProps { products: Product[]; }

export function SaleHistory({ products }: SaleHistoryProps) {
  const orders = useSalesOrderStore((state) => state.orders);
  const loading = useSalesOrderStore((state) => state.loading);
  const error = useSalesOrderStore((state) => state.error);
  const loadOrders = useSalesOrderStore((state) => state.loadOrders);
  const refundOrder = useSalesOrderStore((state) => state.refundOrder);
  const getRefundableItems = useSalesOrderStore((state) => state.getRefundableItems);
  const refundOrderItems = useSalesOrderStore((state) => state.refundOrderItems);

  const refundInFlightRef = useRef<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [refundingOrderId, setRefundingOrderId] = useState<string | null>(null);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [refundableItems, setRefundableItems] = useState<Record<string, SalesOrderRefundItem[]>>({});
  const [selectedRefundQuantities, setSelectedRefundQuantities] = useState<Record<string, Record<string, number>>>({});
  const [receiptOrderId, setReceiptOrderId] = useState<string | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReturnType<typeof receiptEngine.generate> | null>(null);

  const sales = orders.filter((order) =>
    order.status === "COMPLETED" ||
    order.status === "REFUNDED" ||
    order.status === "CANCELLED"
  );

  function getProductName(productId: string): string {
    const product = products.find((item) => item.id === productId);
    return product?.name ?? "Product " + productId;
  }

  function getRefundItem(orderId: string, itemId: string): SalesOrderRefundItem | undefined {
    return refundableItems[orderId]?.find((item) => item.itemId === itemId);
  }

  async function toggleOrder(orderId: string) {
    const willExpand = expandedOrderId !== orderId;
    setExpandedOrderId(willExpand ? orderId : null);
    if (!willExpand) return;
    try {
      const items = await getRefundableItems(orderId);
      setRefundableItems((current) => ({ ...current, [orderId]: items }));
    } catch (failure) {
      setRefundError(failure instanceof Error ? failure.message : "Unable to load refundable items.");
    }
  }

  function setRefundQuantity(orderId: string, itemId: string, quantity: number) {
    setSelectedRefundQuantities((current) => ({
      ...current,
      [orderId]: { ...(current[orderId] ?? {}), [itemId]: quantity },
    }));
  }

  function getSelectedRefundTotal(order: SalesOrder): number {
    const total = order.items.reduce((sum, item) => {
      const refundable = getRefundItem(order.id, item.id);
      const quantity = selectedRefundQuantities[order.id]?.[item.id] ?? 0;
      return sum + (refundable?.unitRefundAmount ?? 0) * quantity;
    }, 0);
    return Math.round((total + Number.EPSILON) * 100) / 100;
  }

  async function handlePartialRefund(order: SalesOrder) {
    if (refundInFlightRef.current !== null) return;

    const selections = Object.entries(selectedRefundQuantities[order.id] ?? {})
      .filter(([, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => ({ itemId, quantity }));

    if (selections.length === 0) {
      setRefundError("Select at least one item quantity to refund.");
      return;
    }

    const amount = getSelectedRefundTotal(order);
    if (!window.confirm(
      "Refund " + formatMoney(amount) + " from " + order.orderNumber +
      "? The selected quantities will be returned to stock."
    )) return;

    refundInFlightRef.current = order.id;
    setRefundError(null);
    setRefundingOrderId(order.id);

    try {
      await refundOrderItems(order.id, selections);
      setSelectedRefundQuantities((current) => ({ ...current, [order.id]: {} }));
      const items = await getRefundableItems(order.id);
      setRefundableItems((current) => ({ ...current, [order.id]: items }));
      await loadOrders();
    } catch (failure) {
      setRefundError(failure instanceof Error ? failure.message : "The selected items could not be refunded.");
    } finally {
      refundInFlightRef.current = null;
      setRefundingOrderId(null);
    }
  }

  async function handleRefund(order: SalesOrder) {
    if (order.status !== "COMPLETED" || refundInFlightRef.current !== null) return;
    if (!window.confirm(
      "Refund sale " + order.orderNumber + " for " + formatMoney(order.totalAmount) +
      "? This will return all remaining items to stock and refund the remaining payment."
    )) return;

    refundInFlightRef.current = order.id;
    setRefundError(null);
    setRefundingOrderId(order.id);

    try {
      await refundOrder(order.id);
      setSelectedRefundQuantities((current) => ({ ...current, [order.id]: {} }));
      await loadOrders();
    } catch (failure) {
      setRefundError(failure instanceof Error ? failure.message : "The sale could not be refunded.");
    } finally {
      refundInFlightRef.current = null;
      setRefundingOrderId(null);
    }
  }

  async function handleViewReceipt(order: SalesOrder) {
    setReceiptError(null);
    setReceiptOrderId(order.id);
    setReceiptLoading(true);
    try {
      const payments = await paymentService.getPaymentsForOrder(order.tenantId, order.id);
      const payment = payments.find((item) => item.status === "COMPLETED" || item.status === "REFUNDED") ?? payments[0];
      setReceipt(receiptEngine.generate(order, payment));
    } catch (failure) {
      setReceipt(null);
      setReceiptError(failure instanceof Error ? failure.message : "Unable to load the sale receipt.");
    } finally {
      setReceiptLoading(false);
    }
  }

  return (
    <div className="w-full min-w-0 rounded border p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-medium">Recent Sales</h2>
          <p className="mt-1 text-sm text-gray-600">Completed sales and sale history.</p>
        </div>
        <button type="button" onClick={() => void loadOrders()} disabled={loading || refundingOrderId !== null} className="w-full shrink-0 rounded border px-3 py-2 text-sm disabled:opacity-50 sm:w-auto">
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {refundError && <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">Refund failed: {refundError}</div>}
      {loading && sales.length === 0 && <p className="mt-4 text-sm text-gray-600">Loading sales...</p>}
      {!loading && sales.length === 0 && !error && <p className="mt-4 text-sm text-gray-600">No completed sales yet.</p>}

      {sales.length > 0 && (
        <div className="mt-4 space-y-3">
          {sales.map((order) => {
            const expanded = expandedOrderId === order.id;
            const refunding = refundingOrderId === order.id;
            const showingReceipt = receiptOrderId === order.id;
            const selectedTotal = getSelectedRefundTotal(order);

            return (
              <div key={order.id} className="w-full min-w-0 rounded border">
                <button type="button" onClick={() => void toggleOrder(order.id)} className="w-full min-w-0 p-3 text-left sm:p-4">
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{order.orderNumber}</p>
                      <p className="mt-1 truncate text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end text-right">
                      <span className={"rounded px-2 py-1 text-xs font-medium " + getStatusClass(order.status)}>{order.status}</span>
                      <p className="mt-2 whitespace-nowrap font-semibold">{formatMoney(order.totalAmount)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span>{order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
                    <span className="whitespace-nowrap">Total: {formatMoney(order.totalAmount)}</span>
                  </div>
                </button>

                {expanded && (
                  <div className="border-t bg-gray-50 p-3 sm:p-4">
                    <div className="space-y-3">
                      {order.items.map((item) => {
                        const refundable = getRefundItem(order.id, item.id);
                        return (
                          <div key={item.id} className="flex min-w-0 items-start justify-between gap-3 text-sm">
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{getProductName(item.productId)}</p>
                              <p className="text-gray-600">{item.quantity} × {formatMoney(item.unitPrice)}</p>

                              {order.status === "COMPLETED" && refundable && refundable.remainingQuantity > 0 && (
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <label className="text-xs text-gray-600" htmlFor={"refund-" + order.id + "-" + item.id}>Refund qty</label>
                                  <input
                                    id={"refund-" + order.id + "-" + item.id}
                                    type="number"
                                    min={0}
                                    max={refundable.remainingQuantity}
                                    step={1}
                                    value={selectedRefundQuantities[order.id]?.[item.id] ?? 0}
                                    onChange={(event) => {
                                      const value = Math.min(
                                        refundable.remainingQuantity,
                                        Math.max(0, Number(event.target.value) || 0),
                                      );
                                      setRefundQuantity(order.id, item.id, value);
                                    }}
                                    className="w-20 rounded border bg-white px-2 py-1 text-sm"
                                  />
                                  <span className="text-xs text-gray-500">max {refundable.remainingQuantity}</span>
                                </div>
                              )}

                              {order.status === "COMPLETED" && refundable && refundable.remainingQuantity === 0 && (
                                <p className="text-xs text-purple-700">Fully refunded</p>
                              )}
                            </div>
                            <div className="shrink-0 text-right">
                              {item.discountAmount > 0 && <p className="text-gray-600">Discount: {formatMoney(item.discountAmount)}</p>}
                              <p className="whitespace-nowrap font-medium">{formatMoney(item.lineTotal)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 border-t pt-3 text-sm">
                      <div className="flex justify-between gap-4"><span>Subtotal</span><span className="whitespace-nowrap">{formatMoney(order.subtotal)}</span></div>
                      {order.discountAmount > 0 && <div className="mt-1 flex justify-between gap-4"><span>Discount</span><span className="whitespace-nowrap">-{formatMoney(order.discountAmount)}</span></div>}
                      <div className="mt-1 flex justify-between gap-4"><span>Tax</span><span className="whitespace-nowrap">{formatMoney(order.taxAmount)}</span></div>
                      <div className="mt-2 flex justify-between gap-4 border-t pt-2 font-semibold"><span>Total</span><span className="whitespace-nowrap">{formatMoney(order.totalAmount)}</span></div>
                    </div>

                    <div className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2">
                      <button type="button" onClick={() => void handleViewReceipt(order)} disabled={receiptLoading && showingReceipt} className="min-h-11 w-full rounded border bg-white px-4 py-2 text-sm font-medium text-gray-800 disabled:opacity-50">
                        {receiptLoading && showingReceipt ? "Loading Receipt..." : "View Receipt"}
                      </button>

                      {order.status === "COMPLETED" && (
                        <>
                          <button type="button" onClick={() => void handlePartialRefund(order)} disabled={refunding || refundingOrderId !== null || selectedTotal <= 0} className="min-h-11 w-full rounded bg-orange-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">
                            {refunding ? "Processing Refund..." : "Refund Selected (" + formatMoney(selectedTotal) + ")"}
                          </button>
                          <button type="button" onClick={() => void handleRefund(order)} disabled={refunding || refundingOrderId !== null} className="min-h-11 w-full rounded bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2">
                            {refunding ? "Processing Refund..." : "Refund Entire Sale"}
                          </button>
                        </>
                      )}
                    </div>

                    {order.status === "COMPLETED" && <p className="mt-2 text-center text-xs text-gray-500">Enter quantities for a partial refund, or refund the entire sale.</p>}

                    {showingReceipt && (
                      <div className="mt-4 border-t pt-4">
                        {receiptError && <div className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{receiptError}</div>}
                        {receipt && <ReceiptView receipt={receipt} products={products} />}
                      </div>
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
