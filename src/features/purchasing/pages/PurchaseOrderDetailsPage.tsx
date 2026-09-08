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
import { useTranslation } from "@/core/i18n/useTranslation";

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

export default function PurchaseOrderDetailsPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { orders, loadOrders, addItem } = usePurchaseOrders();
  const [supplierName, setSupplierName] = useState(t("common.loading"));
  const [warehouseName, setWarehouseName] = useState(t("common.loading"));

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
      setSupplierName(t("common.loading"));
      setWarehouseName(t("common.loading"));
      try {
        const supplier = await supplierService.getSupplierById(context.tenantId, order.supplierId);
        if (!cancelled) setSupplierName(supplier?.name ?? t("common.unknown"));
        if (order.warehouseId) {
          const warehouse = await warehouseService.getWarehouseById(order.warehouseId);
          if (!cancelled) setWarehouseName(warehouse?.name ?? t("common.unknown"));
        } else if (!cancelled) setWarehouseName(t("common.noData"));
      } catch (error) {
        console.error("Failed to load purchase order related names:", error);
        if (!cancelled) { setSupplierName(t("common.unknown")); setWarehouseName(order.warehouseId ? t("common.unknown") : t("common.noData")); }
      }
    }
    void loadRelatedNames();
    return () => { cancelled = true; };
  }, [order?.id, order?.supplierId, order?.warehouseId, t]);

  if (!order) return <div className="min-h-full bg-slate-100 p-6"><div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><p className="text-sm text-slate-500">{t("purchasing.purchaseOrder")}</p></div></div>;

  const currentOrder = order;
  async function handleAddItem(item: PurchaseOrderItem) { await addItem(currentOrder.id, item); }
  const canAddItems = currentOrder.status === "DRAFT";
  const statusLabel: Record<PurchaseOrder["status"], string> = {
    DRAFT: t("purchasing.draft"), SUBMITTED: t("purchasing.submitted"), APPROVED: t("purchasing.approved"),
    PARTIALLY_RECEIVED: t("purchasing.partiallyReceived"), RECEIVED: t("purchasing.received"), CANCELLED: t("purchasing.cancelled"),
  };
  const workflow = [["1", t("purchasing.addProducts"), t("purchasing.orderedProducts")], ["2", t("purchasing.submitOrder"), t("common.submit")], ["3", t("purchasing.approveOrder"), t("common.approve")], ["4", t("purchasing.received"), t("receiving.inventoryUpdated")]] as const;
  const isWorkflowActive = (number: string) => (number === "1" && currentOrder.status === "DRAFT") || (number === "2" && currentOrder.status === "DRAFT" && currentOrder.items.length > 0) || (number === "3" && currentOrder.status === "SUBMITTED") || (number === "4" && (currentOrder.status === "APPROVED" || currentOrder.status === "PARTIALLY_RECEIVED"));

  return <div className="min-h-full bg-slate-100 p-4 sm:p-6"><div className="mx-auto max-w-6xl space-y-6">
    <section className="overflow-hidden rounded-3xl bg-slate-950 shadow-xl"><div className="px-6 py-7 sm:px-8 sm:py-9"><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-3xl"><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-300"><ClipboardList className="h-3.5 w-3.5" />{t("purchasing.title")}</div><h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t("purchasing.purchaseOrder")}</h1><p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">{t("purchasing.orderedProducts")}</p></div><div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("purchasing.orderNumber")}</p><p className="mt-1 text-lg font-bold text-white">{currentOrder.orderNumber}</p><span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusClasses(currentOrder.status)}`}>{statusLabel[currentOrder.status]}</span></div></div></div><div className="grid border-t border-white/10 bg-white/5 sm:grid-cols-2 lg:grid-cols-3"><div className="flex items-center gap-3 px-6 py-4 sm:px-8"><Truck className="h-5 w-5 text-blue-400" /><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t("purchasing.supplier")}</p><p className="mt-1 font-semibold text-white">{supplierName}</p></div></div><div className="flex items-center gap-3 px-6 py-4 sm:px-8"><Warehouse className="h-5 w-5 text-blue-400" /><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t("purchasing.warehouse")}</p><p className="mt-1 font-semibold text-white">{warehouseName}</p></div></div><div className="flex items-center gap-3 px-6 py-4 sm:px-8"><Package className="h-5 w-5 text-blue-400" /><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t("products.title")}</p><p className="mt-1 font-semibold text-white">{currentOrder.items.length} {t("purchasing.addProduct")}</p></div></div></div></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-blue-600">{t("purchasing.purchaseOrders")}</p><h2 className="mt-1 text-xl font-bold text-slate-900">{t("common.actions")}</h2><p className="mt-1 text-sm text-slate-500">{t("purchasing.orderSummary")}</p></div><div className="grid gap-3 md:grid-cols-4">{workflow.map(([number,title,description]) => { const active=isWorkflowActive(number); return <div key={number} className={`rounded-2xl border p-4 transition ${active ? "border-blue-300 bg-blue-50 shadow-sm" : "border-slate-200 bg-slate-50"}`}><div className="flex items-start gap-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${active ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>{number}</span><div><p className="font-semibold text-slate-900">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div></div></div>; })}</div><div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4"><PurchaseOrderActions order={currentOrder} /></div></section>
    {canAddItems && <section className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-start gap-3"><div className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><Package className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">{t("purchasing.addProduct")}</p><h2 className="mt-1 text-xl font-bold text-slate-900">{t("purchasing.addProducts")}</h2><p className="mt-1 text-sm text-slate-500">{t("purchasing.orderedProducts")}</p></div></div><PurchaseOrderItemForm purchaseOrderId={currentOrder.id} tenantId={currentOrder.tenantId} onAddItem={handleAddItem} /></section>}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-end justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900">{t("purchasing.orderedProducts")}</h2><p className="mt-1 text-sm text-slate-500">{t("purchasing.orderSummary")}</p></div><span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">{currentOrder.items.length} {t("purchasing.addProduct")}</span></div><PurchaseOrderItemTable items={currentOrder.items} tenantId={currentOrder.tenantId} /></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><PurchaseOrderSummary order={currentOrder} /></section>
  </div></div>;
}
