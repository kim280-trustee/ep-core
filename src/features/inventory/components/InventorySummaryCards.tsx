import { useTranslation } from "@/core/i18n/useTranslation";
import type { InventoryRecord } from "../types/inventory-record.types";

interface InventorySummaryCardsProps { inventory: InventoryRecord[]; }

export function InventorySummaryCards({ inventory }: InventorySummaryCardsProps) {
  const { t } = useTranslation();
  const totalItems = inventory.reduce((total, record) => total + record.quantityOnHand, 0);
  const inventoryValue = inventory.reduce((total, record) => total + record.quantityOnHand * record.averageCost, 0);
  const lowStockItems = inventory.filter((record) => record.quantityOnHand > 0 && record.quantityOnHand <= record.minimumStockLevel).length;
  const outOfStockItems = inventory.filter((record) => record.quantityOnHand <= 0).length;
  const cards = [
    { title: t("inventory.totalQuantity"), value: totalItems },
    { title: t("inventory.inventoryValue"), value: inventoryValue.toFixed(2) },
    { title: t("inventory.lowStockItems"), value: lowStockItems, className: lowStockItems > 0 ? "border-yellow-300 bg-yellow-50" : "" },
    { title: t("inventory.outOfStockItems"), value: outOfStockItems, className: outOfStockItems > 0 ? "border-red-300 bg-red-50" : "" },
  ];
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map((card) => <div key={card.title} className={`rounded-lg border bg-white p-5 shadow-sm ${card.className ?? ""}`}><p className="text-sm text-gray-500">{card.title}</p><p className="mt-2 text-2xl font-bold">{card.value}</p></div>)}</div>;
}
