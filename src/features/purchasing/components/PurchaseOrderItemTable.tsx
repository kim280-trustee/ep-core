import { useEffect, useState } from "react";
import type { PurchaseOrderItem } from "../types/purchase-order-item.types";
import { productService } from "@/features/products/services/product.service";
import { useTranslation } from "@/core/i18n/useTranslation";

interface PurchaseOrderItemTableProps { items: PurchaseOrderItem[]; tenantId: string; }

export function PurchaseOrderItemTable({ items, tenantId }: PurchaseOrderItemTableProps) {
  const { t } = useTranslation();
  const [productNames, setProductNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    async function loadProductNames() {
      if (!tenantId || items.length === 0) { setProductNames({}); return; }
      const uniqueProductIds = [...new Set(items.map((item) => item.productId))];
      const results = await Promise.all(uniqueProductIds.map(async (productId) => {
        try {
          const product = await productService.getProductById(tenantId, productId);
          return [productId, product ? `${product.name} — ${t("products.sku")}: ${product.sku}` : t("common.unknown")] as const;
        } catch {
          return [productId, t("common.unknown")] as const;
        }
      }));
      if (!cancelled) setProductNames(Object.fromEntries(results));
    }
    void loadProductNames();
    return () => { cancelled = true; };
  }, [items, tenantId, t]);

  if (items.length === 0) return <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center"><p className="font-medium text-slate-700">{t("purchasing.noProductsInOrder")}</p><p className="mt-1 text-sm text-slate-500">{t("purchasing.addProductBeforeSubmit")}</p></div>;

  return <div className="overflow-x-auto rounded-lg border border-slate-200"><table className="min-w-full text-sm"><thead className="bg-slate-50"><tr className="border-b border-slate-200">
    <th className="px-4 py-3 text-left font-semibold text-slate-600">{t("products.productName")}</th>
    <th className="px-4 py-3 text-right font-semibold text-slate-600">{t("purchasing.ordered")}</th>
    <th className="px-4 py-3 text-right font-semibold text-slate-600">{t("receiving.received")}</th>
    <th className="px-4 py-3 text-right font-semibold text-slate-600">{t("purchasing.unitCost")}</th>
    <th className="px-4 py-3 text-right font-semibold text-slate-600">{t("purchasing.taxRateShort")}</th>
    <th className="px-4 py-3 text-right font-semibold text-slate-600">{t("purchasing.lineTotal")}</th>
  </tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b border-slate-100 last:border-b-0"><td className="px-4 py-4"><p className="font-medium text-slate-900">{productNames[item.productId] ?? t("common.loading")}</p></td><td className="px-4 py-4 text-right text-slate-700">{item.quantity}</td><td className="px-4 py-4 text-right text-slate-700">{item.receivedQuantity}</td><td className="px-4 py-4 text-right text-slate-700">{item.unitCost}</td><td className="px-4 py-4 text-right text-slate-700">{item.taxRate}</td><td className="px-4 py-4 text-right font-semibold text-slate-900">{item.lineTotal}</td></tr>)}</tbody></table></div>;
}
