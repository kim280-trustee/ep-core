import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { storeContext } from "@/core/store/store.context";
import { supplierService } from "../services/supplier.service";
import { supplierCreditLedgerService, type SupplierCreditBalance, type SupplierCreditLedgerEntry } from "../credit-ledger";

export function SupplierLedgerPage() {
  const { id } = useParams<{ id: string }>();
  const context = storeContext.getStore();
  const [supplierName, setSupplierName] = useState("Supplier");
  const [balance, setBalance] = useState<SupplierCreditBalance | null>(null);
  const [entries, setEntries] = useState<SupplierCreditLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!context?.tenantId || !context.storeId || !id) {
      setLoading(false);
      return;
    }

    void Promise.all([
      supplierService.getSupplierById(context.tenantId, id),
      supplierCreditLedgerService.getBalance(context.tenantId, context.storeId, id),
      supplierCreditLedgerService.getEntries(context.tenantId, context.storeId, id),
    ])
      .then(([supplier, nextBalance, nextEntries]) => {
        setSupplierName(supplier?.name ?? "Supplier");
        setBalance(nextBalance);
        setEntries(nextEntries);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load supplier ledger."))
      .finally(() => setLoading(false));
  }, [context?.tenantId, context?.storeId, id]);

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading supplier ledger...</div>;

  const currentBalance = balance?.balance ?? 0;
  const hasSupplierCredit = currentBalance < 0;
  const hasAmountOwed = currentBalance > 0;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{supplierName}</h1>
          <p className="text-sm text-gray-500">Supplier credit ledger</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasSupplierCredit && <Link to={`/suppliers/${id}/apply-credit`} className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700">Apply Credit</Link>}
          <Link to="/suppliers/payments" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Record Payment</Link>
          <Link to="/suppliers" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Back</Link>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Purchases</div>
          <div className="mt-1 text-xl font-semibold text-gray-900">THB {(balance?.debit ?? 0).toFixed(2)}</div>
          <div className="mt-1 text-xs text-gray-400">Total goods received</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Credits / Payments</div>
          <div className="mt-1 text-xl font-semibold text-gray-900">THB {(balance?.credit ?? 0).toFixed(2)}</div>
          <div className="mt-1 text-xs text-gray-400">Payments and supplier credits</div>
        </div>
        <div className={`rounded-xl border p-4 shadow-sm ${hasSupplierCredit ? "border-green-200 bg-green-50" : hasAmountOwed ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-white"}`}>
          <div className={`text-sm font-medium ${hasSupplierCredit ? "text-green-700" : hasAmountOwed ? "text-amber-700" : "text-gray-500"}`}>
            {hasSupplierCredit ? "Supplier Credit" : "Amount Owed"}
          </div>
          <div className={`mt-1 text-xl font-semibold ${hasSupplierCredit ? "text-green-800" : hasAmountOwed ? "text-amber-800" : "text-gray-900"}`}>
            THB {Math.abs(currentBalance).toFixed(2)}
          </div>
          <div className={`mt-1 text-xs ${hasSupplierCredit ? "text-green-700" : hasAmountOwed ? "text-amber-700" : "text-gray-400"}`}>
            {hasSupplierCredit ? "Available to apply to a future purchase" : hasAmountOwed ? "Outstanding supplier balance" : "Account is settled"}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900">Ledger</h2>
          <p className="mt-1 text-sm text-gray-500">Supplier purchases, payments, credits, and credit applications</p>
        </div>
        {entries.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No ledger entries yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <div key={entry.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900">{entry.referenceNumber ?? entry.entryType}</div>
                  <div className="text-sm text-gray-500">{entry.description || entry.entryType}</div>
                  <div className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-left sm:text-right">
                  {entry.debit > 0 && <div className="font-semibold text-gray-900">Debit THB {entry.debit.toFixed(2)}</div>}
                  {entry.credit > 0 && <div className="font-semibold text-green-700">Credit THB {entry.credit.toFixed(2)}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
