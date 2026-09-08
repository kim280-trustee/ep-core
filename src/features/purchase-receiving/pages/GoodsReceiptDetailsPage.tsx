import { useEffect, useState } from "react";
import { ArrowLeft, ClipboardCheck, Package, Warehouse as WarehouseIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useGoodsReceipts } from "../hooks/useGoodsReceipts";
import { supplierService } from "@/features/suppliers/services/supplier.service";
import { warehouseService } from "@/features/warehouses/services/warehouse.service";
import { productService } from "@/features/products/services/product.service";
import { purchaseOrderRepository } from "@/features/purchasing/repositories";
import { storeContext } from "@/core/store/store.context";
import { useTranslation } from "@/core/i18n/useTranslation";
import type { GoodsReceipt } from "../types/goods-receipt.types";

export default function GoodsReceiptDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getById } = useGoodsReceipts();
  const context = storeContext.getStore();
  const { t, language } = useTranslation();

  const [receipt, setReceipt] = useState<GoodsReceipt>();
  const [supplierName, setSupplierName] = useState(t("common.loading"));
  const [warehouseName, setWarehouseName] = useState(t("common.loading"));
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState(t("common.loading"));
  const [productNames, setProductNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    async function loadReceipt() {
      if (!id || !context?.tenantId) return;
      const data = await getById(context.tenantId, id);
      if (!cancelled) setReceipt(data);
    }
    void loadReceipt();
    return () => { cancelled = true; };
  }, [id, context?.tenantId, getById]);

  useEffect(() => {
    let cancelled = false;
    async function loadNames() {
      if (!receipt) return;
      try {
        const [supplier, warehouse, order] = await Promise.all([
          supplierService.getSupplierById(receipt.tenantId, receipt.supplierId),
          warehouseService.getWarehouseById(receipt.warehouseId),
          purchaseOrderRepository.findById(receipt.tenantId, receipt.purchaseOrderId),
        ]);
        if (!cancelled) {
          setSupplierName(supplier?.name ?? t("common.unknown"));
          setWarehouseName(warehouse?.name ?? t("common.unknown"));
          setPurchaseOrderNumber(order?.orderNumber ?? t("common.unknown"));
        }
        const names: Record<string, string> = {};
        await Promise.all(receipt.items.map(async (item) => {
          try {
            const product = await productService.getProductById(receipt.tenantId, item.productId);
            names[item.productId] = product?.name ?? t("common.unknown");
          } catch {
            names[item.productId] = t("common.unknown");
          }
        }));
        if (!cancelled) setProductNames(names);
      } catch {
        if (!cancelled) {
          setSupplierName(t("common.unknown"));
          setWarehouseName(t("common.unknown"));
          setPurchaseOrderNumber(t("common.unknown"));
        }
      }
    }
    void loadNames();
    return () => { cancelled = true; };
  }, [receipt?.id, t]);

  if (!receipt) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">{t("navigation.purchasing")}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{t("receiving.goodsReceipt")}</h1>
            <p className="mt-2 text-sm text-slate-300">{t("receiving.noGoodsReceipts")}</p>
          </div>
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-600">{t("receiving.noGoodsReceipts")}</p>
            <button type="button" onClick={() => navigate("/purchase-receiving")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <ArrowLeft className="h-4 w-4" /> {t("common.back")} {t("receiving.goodsReceipts")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalReceivedQuantity = receipt.items.reduce((sum, item) => sum + Number(item.quantityReceived), 0);
  const totalValue = receipt.items.reduce((sum, item) => sum + Number(item.lineTotal), 0);
  const dateLocale = language === "th" ? "th-TH" : "en-US";
  const formattedDate = new Intl.DateTimeFormat(dateLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(receipt.receivedDate));

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">{t("navigation.purchasing")}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{receipt.receiptNumber}</h1>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/20">{t("receiving.received")}</span>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{t("receiving.inventoryUpdated")}: {purchaseOrderNumber}.</p>
              </div>
              <button type="button" onClick={() => navigate("/purchase-receiving")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <ArrowLeft className="h-4 w-4" /> {t("receiving.goodsReceipts")}
              </button>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [t("receiving.purchaseOrder"), purchaseOrderNumber],
                [t("receiving.supplier"), supplierName],
                [t("receiving.warehouse"), warehouseName],
                [t("receiving.received"), formattedDate],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-2 truncate font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><ClipboardCheck className="h-5 w-5" /></div>
                <div>
                  <h2 className="text-lg font-bold text-slate-950">{t("receiving.receivedProducts")}</h2>
                  <p className="text-sm text-slate-500">{t("receiving.receivedProducts")}</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold sm:px-6">{t("inventory.product")}</th>
                    <th className="px-5 py-3.5 text-right font-semibold">{t("common.quantity")}</th>
                    <th className="px-5 py-3.5 text-right font-semibold">{t("receiving.unitCost")}</th>
                    <th className="px-5 py-3.5 text-right font-semibold sm:px-6">{t("common.total")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receipt.items.map((item) => (
                    <tr key={item.id} className="transition hover:bg-slate-50/80">
                      <td className="px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><div className="rounded-lg bg-slate-100 p-2 text-slate-500"><Package className="h-4 w-4" /></div><span className="font-semibold text-slate-900">{productNames[item.productId] ?? t("common.loading")}</span></div></td>
                      <td className="px-5 py-4 text-right font-medium text-slate-700">{item.quantityReceived}</td>
                      <td className="px-5 py-4 text-right text-slate-600">{item.unitCost}</td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-900 sm:px-6">{item.lineTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("receiving.goodsReceipt")}</p>
              <div className="mt-4 space-y-4">
                <div><p className="text-sm text-slate-500">{t("receiving.receivedProducts")}</p><p className="mt-1 text-2xl font-bold text-slate-950">{receipt.items.length}</p></div>
                <div className="border-t border-slate-100 pt-4"><p className="text-sm text-slate-500">{t("receiving.receivedQuantity")}</p><p className="mt-1 text-xl font-bold text-slate-950">{totalReceivedQuantity}</p></div>
                <div className="border-t border-slate-100 pt-4"><p className="text-sm text-slate-500">{t("common.total")}</p><p className="mt-1 text-xl font-bold text-blue-600">{totalValue.toFixed(2)}</p></div>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-950 p-5 text-white shadow-sm">
              <div className="flex items-start gap-3"><div className="rounded-xl bg-blue-500/15 p-2.5 text-blue-300"><WarehouseIcon className="h-5 w-5" /></div><div><p className="font-semibold">{t("receiving.inventoryUpdated")}</p><p className="mt-1 text-sm leading-5 text-slate-400">{t("receiving.inventoryUpdated")} — {warehouseName}.</p></div></div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
