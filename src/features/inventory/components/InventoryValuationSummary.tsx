import { useTranslation } from "@/core/i18n/useTranslation";
import type { InventoryRecord } from "../types/inventory-record.types";

interface InventoryValuationSummaryProps { records: InventoryRecord[]; }

export function InventoryValuationSummary({ records }: InventoryValuationSummaryProps) {
  const { t } = useTranslation();
  const totalQuantity = records.reduce((sum, record) => sum + record.quantityOnHand, 0);
  const inventoryValue = records.reduce((sum, record) => sum + record.quantityOnHand * record.averageCost, 0);
  const warehouseCount = new Set(records.map((record) => record.warehouseId)).size;
  const productCount = new Set(records.map((record) => record.productId)).size;
  const cards = [
    [t("inventory.stock"), totalQuantity],
    [t("inventory.inventoryValue"), inventoryValue.toFixed(2)],
    [t("inventory.productCount"), productCount],
    [t("inventory.warehouseCount"), warehouseCount],
  ];
  return <div className="grid gap-4 md:grid-cols-4">{cards.map(([title, value]) => <div key={title} className="rounded border p-4"><p className="text-sm text-gray-500">{title}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>)}</div>;
}
