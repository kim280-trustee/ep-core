import { useProductsStore } from "@/features/products";
import { warehouseService } from "@/features/warehouses";
import { useTranslation } from "@/core/i18n/useTranslation";
import { useEffect, useState } from "react";
import type { InventoryRecord } from "../types/inventory-record.types";

interface InventoryStockAlertsProps { records: InventoryRecord[]; }
interface WarehouseNameMap { [warehouseId: string]: string; }

export function InventoryStockAlerts({ records }: InventoryStockAlertsProps) {
  const { t } = useTranslation();
  const products = useProductsStore((state) => state.products);
  const [warehouseNames, setWarehouseNames] = useState<WarehouseNameMap>({});

  useEffect(() => {
    const warehouseIds = [...new Set(records.map((record) => record.warehouseId))];
    if (warehouseIds.length === 0) { setWarehouseNames({}); return; }
    let cancelled = false;
    const loadWarehouses = async () => {
      const entries = await Promise.all(warehouseIds.map(async (warehouseId) => {
        const warehouse = await warehouseService.getWarehouseById(warehouseId);
        return [warehouseId, warehouse?.name ?? t("common.unknown")] as const;
      }));
      if (!cancelled) setWarehouseNames(Object.fromEntries(entries));
    };
    void loadWarehouses();
    return () => { cancelled = true; };
  }, [records, t]);

  const alerts = records.filter((record) => record.quantityOnHand <= record.minimumStockLevel).sort((a, b) => a.quantityOnHand - b.quantityOnHand);

  if (alerts.length === 0) return <div className="rounded-lg border bg-white p-5 shadow-sm"><h3 className="text-lg font-semibold">{t("inventory.stockAlerts")}</h3><p className="mt-2 text-sm text-gray-500">{t("inventory.noStockAlerts")}</p></div>;

  return <div className="rounded-lg border bg-white shadow-sm">
    <div className="border-b p-5"><h3 className="text-lg font-semibold">{t("inventory.stockAlerts")}</h3><p className="mt-1 text-sm text-gray-500">{t("inventory.stockAlertsDescription")}</p></div>
    <div className="overflow-x-auto"><table className="w-full border-collapse"><thead><tr className="bg-gray-50">
      <th className="border-b p-3 text-left text-sm font-medium">{t("inventory.product")}</th><th className="border-b p-3 text-left text-sm font-medium">{t("inventory.warehouse")}</th><th className="border-b p-3 text-right text-sm font-medium">{t("inventory.onHand")}</th><th className="border-b p-3 text-right text-sm font-medium">{t("inventory.minimum")}</th><th className="border-b p-3 text-right text-sm font-medium">{t("inventory.shortage")}</th><th className="border-b p-3 text-left text-sm font-medium">{t("common.status")}</th>
    </tr></thead><tbody>{alerts.map((record) => {
      const product = products.find((item) => item.id === record.productId);
      const outOfStock = record.quantityOnHand <= 0;
      const shortage = Math.max(0, record.minimumStockLevel - record.quantityOnHand);
      const productLabel = product ? `${product.name} (${product.identifiers.sku})` : t("common.unknown");
      const warehouseLabel = warehouseNames[record.warehouseId] ?? t("common.unknown");
      return <tr key={record.id}><td className="border-b p-3">{productLabel}</td><td className="border-b p-3">{warehouseLabel}</td><td className="border-b p-3 text-right font-medium">{record.quantityOnHand}</td><td className="border-b p-3 text-right">{record.minimumStockLevel}</td><td className="border-b p-3 text-right">{shortage}</td><td className="border-b p-3"><span className={outOfStock ? "rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700" : "rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700"}>{outOfStock ? t("inventory.outOfStock") : t("inventory.lowStock")}</span></td></tr>;
    })}</tbody></table></div>
  </div>;
}
