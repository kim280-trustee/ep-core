import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { purchaseReturnService } from "../services/purchase-return.service";
import type { PurchaseReturn } from "../types";
import { purchaseOrderRepository } from "../../repositories";
import { supplierService } from "@/features/suppliers/services/supplier.service";
import { warehouseService } from "@/features/warehouses/services/warehouse.service";
import { productService } from "@/features/products/services/product.service";
import { storeContext } from "@/core/store/store.context";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function statusClasses(status: string) {
  switch (status) {
    case "COMPLETED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

export default function PurchaseReturnDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const context = storeContext.getStore();

  const [purchaseReturn, setPurchaseReturn] = useState<PurchaseReturn>();
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("Loading...");
  const [supplierName, setSupplierName] = useState("Loading...");
  const [warehouseName, setWarehouseName] = useState("Loading...");
  const [productNames, setProductNames] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!context?.tenantId || !id) return;

      try {
        setError("");
        const data = await purchaseReturnService.getReturnById(context.tenantId, id);

        if (cancelled) return;

        if (!data) {
          setPurchaseReturn(undefined);
          return;
        }

        setPurchaseReturn(data);

        const [order, supplier, warehouse] = await Promise.all([
          purchaseOrderRepository.findById(context.tenantId, data.purchaseOrderId),
          supplierService.getSupplierById(context.tenantId, data.supplierId),
          warehouseService.getWarehouseById(data.warehouseId),
        ]);

        if (cancelled) return;

        setPurchaseOrderNumber(order?.orderNumber ?? "Unknown Purchase Order");
        setSupplierName(supplier?.name ?? "Unknown Supplier");
        setWarehouseName(warehouse?.name ?? "Unknown Warehouse");

        const entries = await Promise.all(
          data.items.map(async (item) => {
            const product = await productService.getProductById(
              context.tenantId,
              item.productId,
            );

            return [
              item.productId,
              product ? `${product.name} — SKU: ${product.sku}` : "Unknown Product",
            ] as const;
          }),
        );

        if (!cancelled) setProductNames(Object.fromEntries(entries));
      } catch (loadError) {
        if (!cancelled) {
          console.error("Failed to load purchase return:", loadError);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load purchase return.",
          );
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [context?.tenantId, id]);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl space-y-5 pb-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-semibold text-red-800">Unable to load purchase return</p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/purchasing/returns")}
          className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Back to Purchase Returns
        </button>
      </div>
    );
  }

  if (!purchaseReturn) {
    return (
      <div className="mx-auto max-w-4xl space-y-5 pb-8">
        <div>
          <p className="text-sm font-medium text-slate-500">Purchasing</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            Purchase Return Details
          </h1>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="font-semibold text-slate-900">Purchase return not found</p>
          <p className="mt-1 text-sm text-slate-500">
            The return may have been removed or is no longer available.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/purchasing/returns")}
          className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Back to Purchase Returns
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">Purchasing</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Purchase Return Details
            </h1>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(
                purchaseReturn.status,
              )}`}
            >
              {formatStatus(purchaseReturn.status)}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Review the returned goods, supplier credit, and return information.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/purchasing/returns")}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Back to Returns
        </button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
          <h2 className="font-semibold text-slate-950">Return Information</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Reference details for this supplier return.
          </p>
        </div>

        <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Return Number</p>
            <p className="mt-1 font-semibold text-slate-950">{purchaseReturn.returnNumber}</p>
          </div>
          <div className="bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Purchase Order</p>
            <p className="mt-1 font-semibold text-slate-950">{purchaseOrderNumber}</p>
          </div>
          <div className="bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Supplier</p>
            <p className="mt-1 font-semibold text-slate-950">{supplierName}</p>
          </div>
          <div className="bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Warehouse</p>
            <p className="mt-1 font-semibold text-slate-950">{warehouseName}</p>
          </div>
          <div className="bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
            <p className="mt-1 font-semibold text-slate-950">{formatStatus(purchaseReturn.status)}</p>
          </div>
          <div className="bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Reason</p>
            <p className="mt-1 font-semibold text-slate-950">
              {purchaseReturn.reason ?? "No reason provided"}
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="font-semibold text-slate-950">Returned Items</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Products removed from inventory and included in the supplier credit.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 sm:px-6">Product</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-right">Unit Cost</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-5 py-3 sm:px-6">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchaseReturn.items.map((item) => (
                <tr key={item.id} className="align-top hover:bg-slate-50/70">
                  <td className="px-5 py-4 sm:px-6">
                    <p className="font-semibold text-slate-950">
                      {productNames[item.productId] ?? "Loading product..."}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-slate-900">{item.quantity}</td>
                  <td className="px-4 py-4 text-right text-slate-700">
                    {currencyFormatter.format(item.unitCost)}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-slate-950">
                    {currencyFormatter.format(item.lineTotal)}
                  </td>
                  <td className="px-5 py-4 text-slate-600 sm:px-6">
                    {item.reason ?? purchaseReturn.reason ?? "No reason provided"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Supplier Credit</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">Total Return Value</h2>
            <p className="mt-1 text-sm text-slate-500">
              This amount is recorded as a credit against the supplier balance.
            </p>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-950">
            {currencyFormatter.format(purchaseReturn.totalAmount)}
          </p>
        </div>
      </section>

      <div className="flex justify-start">
        <button
          type="button"
          onClick={() => navigate("/purchasing/returns")}
          className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Back to Purchase Returns
        </button>
      </div>
    </div>
  );
}
