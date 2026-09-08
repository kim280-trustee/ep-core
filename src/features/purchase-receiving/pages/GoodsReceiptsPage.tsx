import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ClipboardCheck, FileText, MapPin, PackageCheck, Plus, Truck } from "lucide-react";
import { useGoodsReceipts } from "../hooks/useGoodsReceipts";
import { supplierService } from "@/features/suppliers/services/supplier.service";
import { warehouseService } from "@/features/warehouses/services/warehouse.service";
import { purchaseOrderRepository } from "@/features/purchasing/repositories";
import { storeContext } from "@/core/store/store.context";
import { useTranslation } from "@/core/i18n/useTranslation";

export default function GoodsReceiptsPage() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const context = storeContext.getStore();
  const { receipts, loadReceipts, loading, error } = useGoodsReceipts();
  const [supplierNames, setSupplierNames] = useState<Record<string, string>>({});
  const [warehouseNames, setWarehouseNames] = useState<Record<string, string>>({});
  const [purchaseOrderNumbers, setPurchaseOrderNumbers] = useState<Record<string, string>>({});

  useEffect(() => { if (context?.tenantId) void loadReceipts(context.tenantId); }, [context?.tenantId, loadReceipts]);
  useEffect(() => {
    let cancelled = false;
    async function loadNames() {
      if (!receipts.length || !context?.tenantId) { setSupplierNames({}); setWarehouseNames({}); setPurchaseOrderNumbers({}); return; }
      try {
        const [suppliers, warehouses, orders] = await Promise.all([
          supplierService.getSuppliers(context.tenantId),
          warehouseService.getWarehouses(),
          Promise.all(receipts.map((receipt) => purchaseOrderRepository.findById(context.tenantId, receipt.purchaseOrderId))),
        ]);
        if (cancelled) return;
        setSupplierNames(Object.fromEntries(suppliers.map((supplier) => [supplier.id, supplier.name])));
        setWarehouseNames(Object.fromEntries(warehouses.map((warehouse) => [warehouse.id, warehouse.name])));
        setPurchaseOrderNumbers(Object.fromEntries(orders.filter(Boolean).map((order) => [order!.id, order!.orderNumber])));
      } catch (err) { console.error("Failed to load goods receipt names:", err); }
    }
    void loadNames();
    return () => { cancelled = true; };
  }, [receipts, context?.tenantId]);

  const formatReceivedDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const locale = language === "th" ? "th-TH" : language === "sw" ? "sw-KE" : "en-US";
    return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
  };

  return <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl space-y-6">
    <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl"><div className="relative px-6 py-8 sm:px-8 sm:py-10"><div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-2xl"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600"><PackageCheck className="h-5 w-5" /></div><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">{t("receiving.title")}</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("receiving.goodsReceipts")}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">{t("receiving.receivedProducts")}</p></div><button type="button" onClick={() => navigate("/purchase-receiving/create")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"><Plus className="h-4 w-4" />{t("receiving.createGoodsReceipt")}<ArrowRight className="h-4 w-4" /></button></div></div></section>
    <section className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5 text-blue-600" /><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("receiving.goodsReceipts")}</p><p className="mt-1 text-2xl font-bold text-slate-950">{receipts.length}</p></div></div></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><FileText className="h-5 w-5 text-slate-700" /><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("purchasing.purchaseOrders")}</p><p className="mt-1 text-2xl font-bold text-slate-950">{new Set(receipts.map((receipt) => receipt.purchaseOrderId)).size}</p></div></div></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><Truck className="h-5 w-5 text-slate-700" /><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("suppliers.title")}</p><p className="mt-1 text-2xl font-bold text-slate-950">{new Set(receipts.map((receipt) => receipt.supplierId)).size}</p></div></div></div></section>
    {loading && <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" /><p className="text-sm font-medium text-slate-600">{t("common.loading")}</p></section>}
    {error && <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">{error}</section>}
    {!loading && receipts.length === 0 && <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm"><PackageCheck className="mx-auto h-12 w-12 text-slate-400" /><h2 className="mt-4 text-lg font-semibold text-slate-950">{t("receiving.noGoodsReceipts")}</h2><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{t("receiving.inventoryUpdated")}</p><button type="button" onClick={() => navigate("/purchase-receiving/create")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" />{t("receiving.createGoodsReceipt")}</button></section>}
    {receipts.length > 0 && <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-5 sm:px-6"><h2 className="text-lg font-bold text-slate-950">{t("receiving.goodsReceipts")}</h2><p className="mt-1 text-sm text-slate-500">{t("receiving.receivedProducts")}</p></div><div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t("receiving.receiptNumber")}</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t("receiving.purchaseOrder")}</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t("receiving.supplier")}</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t("receiving.warehouse")}</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t("receiving.received")}</th><th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">{t("common.actions")}</th></tr></thead><tbody className="divide-y divide-slate-100">{receipts.map((receipt) => <tr key={receipt.id} onClick={() => navigate(`/purchase-receiving/${receipt.id}`)} className="cursor-pointer bg-white transition hover:bg-blue-50/50"><td className="px-5 py-4"><div className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5 text-blue-600" /><div><p className="font-semibold text-slate-950">{receipt.receiptNumber}</p><p className="text-xs text-slate-500">{t("receiving.goodsReceipt")}</p></div></div></td><td className="px-5 py-4 font-medium text-slate-800">{purchaseOrderNumbers[receipt.purchaseOrderId] ?? t("common.unknown")}</td><td className="px-5 py-4"><div className="flex items-center gap-2 text-sm text-slate-700"><Truck className="h-4 w-4 text-slate-400" />{supplierNames[receipt.supplierId] ?? t("common.unknown")}</div></td><td className="px-5 py-4"><div className="flex items-center gap-2 text-sm text-slate-700"><MapPin className="h-4 w-4 text-slate-400" />{warehouseNames[receipt.warehouseId] ?? t("common.unknown")}</div></td><td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{formatReceivedDate(receipt.receivedDate)}</td><td className="px-5 py-4 text-right"><span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600">{t("common.view")}<ArrowRight className="h-4 w-4" /></span></td></tr>)}</tbody></table></div></section>}
  </div></div>;
}
