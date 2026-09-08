import { useState } from "react";
import { ArrowRight, ClipboardList, MapPin, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import { useWarehouses } from "@/features/warehouses/hooks/useWarehouses";
import { storeContext } from "@/core/store/store.context";
import { useTranslation } from "@/core/i18n/useTranslation";

export default function CreatePurchaseOrderPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { createDraft } = usePurchaseOrders();
  const { suppliers } = useSuppliers();
  const { warehouses, loading: warehousesLoading } = useWarehouses();
  const [supplierId, setSupplierId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    const context = storeContext.getStore();
    if (!context) { setError(t("sales.storeContextNotInitialized")); return; }
    if (!supplierId) { setError(t("purchasing.supplierRequired")); return; }
    if (!warehouseId) { setError(t("purchasing.warehouseRequired")); return; }
    try {
      setSubmitting(true);
      const order = await createDraft({ tenantId: context.tenantId, storeId: context.storeId, supplierId, warehouseId, notes });
      navigate(`/purchasing/${order.id}`);
    } catch (caughtError) {
      console.error("Failed to create purchase order:", caughtError);
      setError(caughtError instanceof Error ? caughtError.message : t("purchasing.failedToCreatePurchaseOrder"));
    } finally { setSubmitting(false); }
  }

  return <div className="-mx-4 -my-6 min-h-full bg-slate-100 px-4 py-6 pb-10 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"><div className="mx-auto max-w-5xl space-y-6">
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl sm:px-8 sm:py-8"><div className="relative flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-blue-300"><ClipboardList size={22} /></div><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">{t("purchasing.title")}</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{t("purchasing.createPurchaseOrder")}</h1><p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">{t("purchasing.createPurchaseOrderDescription")}</p></div></div></section>
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="flex items-center gap-3 border-b border-slate-100 pb-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Truck size={19} /></div><div><h2 className="text-lg font-bold text-slate-950">{t("purchasing.orderSummary")}</h2><p className="mt-1 text-sm text-slate-500">{t("purchasing.orderSetupDescription")}</p></div></div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2"><div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><div className="mb-3 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm"><Truck size={17} /></div><div><label htmlFor="purchase-order-supplier" className="text-sm font-bold text-slate-900">{t("purchasing.supplier")}</label><p className="text-xs text-slate-500">{t("purchasing.supplierQuestion")}</p></div></div><select id="purchase-order-supplier" value={supplierId} onChange={(event) => setSupplierId(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"><option value="">{t("purchasing.selectSupplier")}</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><div className="mb-3 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm"><MapPin size={17} /></div><div><label htmlFor="purchase-order-warehouse" className="text-sm font-bold text-slate-900">{t("purchasing.warehouse")}</label><p className="text-xs text-slate-500">{t("purchasing.warehouseQuestion")}</p></div></div><select id="purchase-order-warehouse" value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} disabled={warehousesLoading} className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-wait disabled:bg-slate-50 disabled:text-slate-400"><option value="">{warehousesLoading ? t("purchasing.loadingWarehouses") : t("purchasing.selectWarehouse")}</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></div></div>
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><div className="mb-3"><label htmlFor="purchase-order-notes" className="text-sm font-bold text-slate-900">{t("common.description")}</label><p className="mt-1 text-xs text-slate-500">{t("purchasing.notesDescription")}</p></div><textarea id="purchase-order-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} placeholder={t("purchasing.notesPlaceholder")} className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50" /></div>
      {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</div>}
      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-slate-500">{t("purchasing.draftDescription")}</p><button type="button" onClick={handleSubmit} disabled={submitting || !supplierId || !warehouseId} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none">{submitting ? t("purchasing.creating") : t("purchasing.createDraft")}{!submitting && <ArrowRight size={17} />}</button></div>
    </section></div></div>;
}
