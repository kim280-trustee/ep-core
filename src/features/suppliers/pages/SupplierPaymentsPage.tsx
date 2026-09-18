import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { storeContext } from "@/core/store/store.context";
import { useSuppliers } from "../hooks/useSuppliers";
import {
  supplierPaymentService,
  type SupplierPayment,
  type SupplierPaymentMethod,
} from "../supplier-payments";

const methods: SupplierPaymentMethod[] = [
  "CASH",
  "BANK_TRANSFER",
  "PROMPTPAY",
  "OTHER",
];

function formatMethod(method: SupplierPaymentMethod) {
  return method.replace("_", " ");
}

export function SupplierPaymentsPage() {
  const { suppliers } = useSuppliers();
  const [supplierId, setSupplierId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<SupplierPaymentMethod>("CASH");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const context = storeContext.getStore();

  useEffect(() => {
    if (!context?.tenantId || !context.storeId) {
      setPayments([]);
      setLoading(false);
      return;
    }

    void supplierPaymentService
      .getPayments(context.tenantId, context.storeId)
      .then(setPayments)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load payments."))
      .finally(() => setLoading(false));
  }, [context?.tenantId, context?.storeId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!context?.tenantId || !context.storeId) {
      setError("Store context is not initialized.");
      return;
    }

    if (!supplierId) {
      setError("Select a supplier.");
      return;
    }

    setSaving(true);
    try {
      const payment = await supplierPaymentService.createPayment({
        tenantId: context.tenantId,
        storeId: context.storeId,
        supplierId,
        amount: Number(amount),
        method,
        reference: reference || null,
        notes: notes || null,
      });

      setPayments((current) => [payment, ...current]);
      setAmount("");
      setReference("");
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment.");
    } finally {
      setSaving(false);
    }
  }

  const supplierName = (id: string) =>
    suppliers.find((supplier) => supplier.id === id)?.name ?? "Unknown supplier";

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Supplier Payments</h1>
          <p className="text-sm text-gray-500">Record payments made to suppliers.</p>
        </div>
        <Link to="/suppliers" className="text-sm font-medium text-blue-600 hover:underline">
          Back to Suppliers
        </Link>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-medium">Record Payment</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Supplier</span>
            <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)} className="w-full rounded-md border p-2">
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span>Amount</span>
            <input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full rounded-md border p-2" placeholder="0.00" />
          </label>

          <label className="space-y-1 text-sm">
            <span>Payment Method</span>
            <select value={method} onChange={(event) => setMethod(event.target.value as SupplierPaymentMethod)} className="w-full rounded-md border p-2">
              {methods.map((item) => <option key={item} value={item}>{formatMethod(item)}</option>)}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span>Reference</span>
            <input value={reference} onChange={(event) => setReference(event.target.value)} className="w-full rounded-md border p-2" placeholder="Transaction/reference number" />
          </label>

          <label className="space-y-1 text-sm md:col-span-2">
            <span>Notes</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="w-full rounded-md border p-2" rows={2} />
          </label>
        </div>

        <button type="submit" disabled={saving} className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {saving ? "Saving..." : "Record Payment"}
        </button>
      </form>

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b p-4 font-medium">Payment History</div>
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No supplier payments recorded yet.</div>
        ) : (
          <div className="divide-y">
            {payments.map((payment) => (
              <div key={payment.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium">{payment.paymentNumber}</div>
                  <div className="text-sm text-gray-500">{supplierName(payment.supplierId)} · {formatMethod(payment.method)}</div>
                  {payment.reference && <div className="text-xs text-gray-400">Ref: {payment.reference}</div>}
                </div>
                <div className="text-left sm:text-right">
                  <div className="font-semibold">{payment.amount.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">{new Date(payment.paidAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


