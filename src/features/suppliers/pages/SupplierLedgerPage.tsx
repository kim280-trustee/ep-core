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

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">{supplierName}</h1>
          <p className="text-sm text-gray-500">Supplier credit ledger</p>
        </div>
        <div className="flex gap-2">
          <Link to="/suppliers/payments" className="rounded border px-3 py-2 text-sm">Record Payment</Link>
          <Link to="/suppliers" className="rounded border px-3 py-2 text-sm">Back</Link>
        </div>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4"><div className="text-sm text-gray-500">Purchases</div><div className="mt-1 text-xl font-semibold">{(balance?.debit ?? 0).toFixed(2)}</div></div>
        <div className="rounded-lg border bg-white p-4"><div className="text-sm text-gray-500">Credits / Payments</div><div className="mt-1 text-xl font-semibold">{(balance?.credit ?? 0).toFixed(2)}</div></div>
        <div className="rounded-lg border bg-white p-4"><div className="text-sm text-gray-500">Amount Owed</div><div className="mt-1 text-xl font-semibold">{(balance?.balance ?? 0).toFixed(2)}</div></div>
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b p-4 font-medium">Ledger</div>
        {entries.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No ledger entries yet.</div>
        ) : (
          <div className="divide-y">
            {entries.map((entry) => (
              <div key={entry.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium">{entry.referenceNumber ?? entry.entryType}</div>
                  <div className="text-sm text-gray-500">{entry.description || entry.entryType}</div>
                  <div className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-left sm:text-right">
                  {entry.debit > 0 && <div className="font-semibold">Debit {entry.debit.toFixed(2)}</div>}
                  {entry.credit > 0 && <div className="font-semibold text-green-700">Credit {entry.credit.toFixed(2)}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
