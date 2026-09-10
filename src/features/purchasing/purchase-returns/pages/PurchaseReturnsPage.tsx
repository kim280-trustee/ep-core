import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { purchaseReturnService } from "../services/purchase-return.service";
import type { PurchaseReturn } from "../types";
import { storeContext } from "@/core/store/store.context";
import { purchaseOrderRepository } from "../../repositories";
import { supplierService } from "@/features/suppliers/services/supplier.service";
import { warehouseService } from "@/features/warehouses/services/warehouse.service";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function statusClasses(status: string) {
  switch (status.toUpperCase()) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
    case "CANCELLED":
      return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
    case "DRAFT":
      return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
    default:
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
  }
}

export default function PurchaseReturnsPage() {
  const navigate = useNavigate();
  const context = storeContext.getStore();

  const [returns, setReturns] = useState<PurchaseReturn[]>([]);
  const [orderNumbers, setOrderNumbers] = useState<Record<string, string>>({});
  const [supplierNames, setSupplierNames] = useState<Record<string, string>>({});
  const [warehouseNames, setWarehouseNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!context?.tenantId) {
        setLoading(false);
        return;
      }

      try {
        const data = await purchaseReturnService.getReturns(context.tenantId);
        if (cancelled) return;
        setReturns(data);

        const orders = await Promise.all(
          data.map((item) =>
            purchaseOrderRepository.findById(context.tenantId, item.purchaseOrderId),
          ),
        );

        const suppliers = await Promise.all(
          data.map((item) =>
            supplierService.getSupplierById(context.tenantId, item.supplierId),
          ),
        );

        const warehouses = await Promise.all(
          data.map((item) => warehouseService.getWarehouseById(item.warehouseId)),
        );

        if (cancelled) return;

        const orderMap: Record<string, string> = {};
        const supplierMap: Record<string, string> = {};
        const warehouseMap: Record<string, string> = {};

        data.forEach((item, index) => {
          orderMap[item.purchaseOrderId] =
            orders[index]?.orderNumber ?? "Unknown Purchase Order";
          supplierMap[item.supplierId] =
            suppliers[index]?.name ?? "Unknown Supplier";
          warehouseMap[item.warehouseId] =
            warehouses[index]?.name ?? "Unknown Warehouse";
        });

        setOrderNumbers(orderMap);
        setSupplierNames(supplierMap);
        setWarehouseNames(warehouseMap);
      } catch (error) {
        console.error("Failed to load purchase returns:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [context?.tenantId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Purchase Returns
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage supplier purchase returns.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/purchasing/returns/create")}
          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Create Purchase Return
        </button>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading purchase returns...
        </div>
      )}

      {!loading && returns.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-slate-900">No purchase returns found.</p>
          <p className="mt-1 text-sm text-slate-500">
            Create a purchase return to see it here.
          </p>
        </div>
      )}

      {!loading && returns.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Return Number</th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Purchase Order</th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Supplier</th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Warehouse</th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Total</th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {returns.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/purchasing/returns/${item.id}`)}
                    className="cursor-pointer transition hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-950">{item.returnNumber}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">{orderNumbers[item.purchaseOrderId] ?? "Unknown Purchase Order"}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">{supplierNames[item.supplierId] ?? "Unknown Supplier"}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">{warehouseNames[item.warehouseId] ?? "Unknown Warehouse"}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(item.status)}`}>
                        {formatStatus(item.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-slate-950">
                      {currencyFormatter.format(item.totalAmount)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">{formatDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
