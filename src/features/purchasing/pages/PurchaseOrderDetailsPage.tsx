import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ClipboardList, Package, Truck, Warehouse } from "lucide-react";

import type { PurchaseOrder } from "../types/purchase-order.types";
import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import { PurchaseOrderSummary } from "../components/PurchaseOrderSummary";
import { PurchaseOrderItemTable } from "../components/PurchaseOrderItemTable";
import { PurchaseOrderItemForm } from "../components/PurchaseOrderItemForm";
import { PurchaseOrderActions } from "../components/PurchaseOrderActions";
import type { PurchaseOrderItem } from "../types/purchase-order-item.types";
import { storeContext } from "@/core/store/store.context";
import { supplierService } from "@/features/suppliers/services/supplier.service";
import { warehouseService } from "@/features/warehouses/services/warehouse.service";

function statusClasses(status: PurchaseOrder["status"]) {
  switch (status) {
    case "DRAFT": return "bg-slate-100 text-slate-700 ring-slate-200";
    case "SUBMITTED": return "bg-amber-100 text-amber-800 ring-amber-200";
    case "APPROVED": return "bg-blue-100 text-blue-800 ring-blue-200";
    case "PARTIALLY_RECEIVED": return "bg-purple-100 text-purple-800 ring-purple-200";
    case "RECEIVED": return "bg-emerald-100 text-emerald-800 ring-emerald-200";
    case "CANCELLED": return "bg-red-100 text-red-800 ring-red-200";
    default: return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

const workflow = [
  ["1", "Add Products", "Build the order"],
  ["2", "Submit", "Send for approval"],
  ["3", "Approve", "Authorize purchasing"],
  ["4", "Receive", "Update inventory"],
] as const;

function isWorkflowActive(number: string, order: PurchaseOrder) {
  return (
    (number === "1" && order.status === "DRAFT") ||
    (number === "2" && order.status === "DRAFT" && order.items.length > 0) ||
    (number === "3" && order.status === "SUBMITTED") ||
    (number === "4" && (order.status === "APPROVED" || order.status === "PARTIALLY_RECEIVED"))
  );
}

export default function PurchaseOrderDetailsPage() {
  const { id } = useParams();
  const { orders, loadOrders, addItem } = usePurchaseOrders();
  const [supplierName, setSupplierName] = useState("Loading...");
  const [warehouseName, setWarehouseName] = useState("Loading...");

  useEffect(() => {
    const context = storeContext.getStore();
    if (context?.tenantId) void loadOrders(context.tenantId);
  }, [loadOrders]);

  const order = id ? orders.find((item) => item.id === id) : undefined;

  useEffect(() => {
    let cancelled = false;
    async function loadRelatedNames() {
      if (!order) return;
      const context = storeContext.getStore();
      if (!context?.tenantId) return;
      setSupplierName("Loading...");
      setWarehouseName("Loading...");
      try {
        const supplier = await supplierService.getSupplierById(context.tenantId, order.supplierId);
        if (!cancelled) setSupplierName(supplier?.name ?? "Unknown Supplier");
        if (order.warehouseId) {
          const warehouse = await warehouseService.getWarehouseById(order.warehouseId);
          if (!cancelled) setWarehouseName(warehouse?.name ?? "Unknown Warehouse");
        } else if (!cancelled) setWarehouseName("Not assigned");
      } catch (error) {
        console.error("Failed to load purchase order related names:", error);
        if (!cancelled) {
          setSupplierName("Unknown Supplier");
          setWarehouseName(order.warehouseId ? "Unknown Warehouse" : "Not assigned");
        }
      }
    }
    void loadRelatedNames();
    return () => { cancelled = true; };
  }, [order?.id, order?.supplierId, order?.warehouseId]);

  if (!order) {
    return <div className="min-h-full bg-slate-100 p-6"><div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><p className="text-sm text-slate-500">Loading Purchase Order...</p></div></div>;
  }

  const currentOrder = order;

  async function handleAddItem(item: PurchaseOrderItem) {
    await addItem(currentOrder.id, item);
  }

  const canAddItems = currentOrder.status === "DRAFT";

  return (
    <div className="min-h-full bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-3xl bg-slate-950 shadow-xl">
          <div className="px-6 py-7 sm:px-8 sm:py-9">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-300">
                  <ClipboardList className="h-3.5 w-3.5" /> Purchasing
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Purchase Order</h1>
                <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">Review the order, manage products, and move it through the purchasing and receiving workflow.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Order Number</p>
                <p className="mt-1 text-lg font-bold text-white">{currentOrder.orderNumber}</p>
                <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusClasses(currentOrder.status)}`}>{currentOrder.status.replaceAll("_", " ")}</span>
              </div>
            </div>
          </div>
          <div className="grid border-t border-white/10 bg-white/5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3 px-6 py-4 sm:px-8"><Truck className="h-5 w-5 text-blue-400" /><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Supplier</p><p className="mt-1 font-semibold text-white">{supplierName}</p></div></div>
            <div className="flex items-center gap-3 px-6 py-4 sm:px-8"><Warehouse className="h-5 w-5 text-blue-400" /><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Warehouse</p><p className="mt-1 font-semibold text-white">{warehouseName}</p></div></div>
            <div className="flex items-center gap-3 px-6 py-4 sm:px-8"><Package className="h-5 w-5 text-blue-400" /><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Products</p><p className="mt-1 font-semibold text-white">{currentOrder.items.length} {currentOrder.items.length === 1 ? "item" : "items"}</p></div></div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Workflow</p><h2 className="mt-1 text-xl font-bold text-slate-900">Move this order forward</h2><p className="mt-1 text-sm text-slate-500">The highlighted step shows the next action available for this order.</p></div>
          <div className="grid gap-3 md:grid-cols-4">
            {workflow.map(([number, title, description]) => { const active = isWorkflowActive(number, currentOrder); return <div key={number} className={`rounded-2xl border p-4 transition ${active ? "border-blue-300 bg-blue-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}><div className="flex items-start gap-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${active ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>{number}</span><div><p className="font-semibold text-slate-900">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div></div></div>; })}
          </div>
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4"><PurchaseOrderActions order={currentOrder} /></div>
        </section>

        {canAddItems && <section className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-start gap-3"><div className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><Package className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">Step 1</p><h2 className="mt-1 text-xl font-bold text-slate-900">Add Products</h2><p className="mt-1 text-sm text-slate-500">Search for a product, enter the quantity and cost, then add it to this order.</p></div></div><PurchaseOrderItemForm purchaseOrderId={currentOrder.id} tenantId={currentOrder.tenantId} onAddItem={handleAddItem} /></section>}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-end justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900">Ordered Products</h2><p className="mt-1 text-sm text-slate-500">Products and quantities included in this purchase order.</p></div><span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">{currentOrder.items.length} {currentOrder.items.length === 1 ? "item" : "items"}</span></div><PurchaseOrderItemTable items={currentOrder.items} tenantId={currentOrder.tenantId} /></section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><PurchaseOrderSummary order={currentOrder} /></section>
      </div>
    </div>
  );
}
