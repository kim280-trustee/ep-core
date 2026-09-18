import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { storeContext } from "@/core/store/store.context";
import { purchaseOrderRepository } from "@/features/purchasing/repositories";
import type { PurchaseOrder } from "@/features/purchasing/types/purchase-order.types";
import { supplierCreditLedgerService, type SupplierCreditBalance } from "../credit-ledger";
import { supplierService } from "../services/supplier.service";

export function ApplySupplierCreditPage() {
  const { id: supplierId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const context = storeContext.getStore();
  const [supplierName, setSupplierName] = useState("Supplier");
  const [balance, setBalance] = useState<SupplierCreditBalance | null>(null);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!context?.tenantId || !context.storeId || !supplierId) {
      setLoading(false);
      return;
    }

    void Promise.all([
      supplierService.getSupplierById(context.tenantId, supplierId),
      supplierCreditLedgerService.getBalance(context.tenantId, context.storeId, supplierId),
      purchaseOrderRepository.findBySupplier(context.tenantId, supplierId),
    ])
      .then(([supplier, nextBalance, nextOrders]) => {
        setSupplierName(supplier?.name ?? "Supplier");
        setBalance(nextBalance);
        setOrders(nextOrders.filter((order) => order.storeId === context.storeId && (order.status === "RECEIVED" || order.status === "PARTIALLY_RECEIVED")));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load supplier credit."))
      .finally(() => setLoading(false));
  }, [context?.tenantId, context?.storeId, supplierId]);

  const availableCredit = Math.max(0, -(balance?.balance ?? 0));
  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === purchaseOrderId),
    [orders, purchaseOrderId],
  );

  const suggestedAmount = selectedOrder
    ? Math.min(availableCredit, selectedOrder.totalAmount)
    : 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!context?.tenantId || !context.storeId || !supplierId) {
      setError("Store context is not initialized.");
      return;
    }
    if (!purchaseOrderId) {
      setError("Select a purchase order.");
      return;
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid credit amount.");
      return;
    }

    setSaving(true);
    try {
      await supplierCreditLedgerService.applyCreditToPurchaseOrder({
        tenantId: context.tenantId,
        storeId: context.storeId,
        supplierId,
        purchaseOrderId,
        amount: numericAmount,
      });
      navigate(`/suppliers/${supplierId}/ledger`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply supplier credit.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading supplier credit...</div>;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">Suppliers / Apply Credit</p>
          <h1 className="text-xl font-semibold text-gray-900">Apply Supplier Credit</h1>
          <p className="text-sm text-gray-500">Use available credit from {supplierName} against a received purchase.</p>
        </div>
        <Link to={`/suppliers/${supplierId}/ledger`} className="text-sm font-medium text-blue-600 hover:underline">Back to Ledger</Link>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm">
        <div className="text-sm font-medium text-green-700">Available Supplier Credit</div>
        <div className="mt-1 text-2xl font-semibold text-green-800">THB {availableCredit.toFixed(2)}</div>
        <div className="mt-1 text-xs text-green-700">This credit came from supplier returns or other supplier credits.</div>
      </div>

      {availableCredit <= 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600 shadow-sm">
          This supplier has no available credit to apply.
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600 shadow-sm">
          No received purchase orders are available for this supplier.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="font-semibold text-gray-900">Choose Purchase</h2>
            <p className="mt-1 text-sm text-gray-500">Apply credit to a received or partially received purchase order.</p>
          </div>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-gray-700">Purchase Order</span>
            <select value={purchaseOrderId} onChange={(event) => { setPurchaseOrderId(event.target.value); setAmount(""); }} className="w-full rounded-lg border border-gray-300 p-3">
              <option value="">Select purchase order</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.orderNumber} · THB {order.totalAmount.toFixed(2)} · {order.status.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>

          {selectedOrder && (
            <div className="rounded-lg bg-gray-50 p-4 text-sm">
              <div className="font-medium text-gray-900">{selectedOrder.orderNumber}</div>
              <div className="mt-1 text-gray-500">Purchase total: THB {selectedOrder.totalAmount.toFixed(2)}</div>
              <button type="button" onClick={() => setAmount(suggestedAmount.toFixed(2))} className="mt-2 text-sm font-medium text-blue-600 hover:underline">
                Use maximum available credit: THB {suggestedAmount.toFixed(2)}
              </button>
            </div>
          )}

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-gray-700">Credit Amount</span>
            <input type="number" min="0.01" step="0.01" max={suggestedAmount || availableCredit} value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" className="w-full rounded-lg border border-gray-300 p-3" />
            <span className="text-xs text-gray-500">Maximum: THB {suggestedAmount.toFixed(2)}</span>
          </label>

          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">
              {saving ? "Applying..." : "Apply Credit"}
            </button>
            <Link to={`/suppliers/${supplierId}/ledger`} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
          </div>
        </form>
      )}
    </div>
  );
}


