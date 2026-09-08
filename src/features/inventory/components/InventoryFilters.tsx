import type { ChangeEvent } from "react";
import { useTranslation } from "@/core/i18n/useTranslation";

interface InventoryFiltersProps {
  search: string;
  warehouseId: string;
  status: string;
  warehouses: Array<{
    id: string;
    name: string;
  }>;
  onSearchChange: (value: string) => void;
  onWarehouseChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function InventoryFilters({
  search,
  warehouseId,
  status,
  warehouses,
  onSearchChange,
  onWarehouseChange,
  onStatusChange,
}: InventoryFiltersProps) {
  const { t } = useTranslation();

  const handleSearch = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    onSearchChange(event.target.value);
  };

  return (
    <div className="grid gap-3 rounded border p-4 md:grid-cols-3">
      <div>
        <label
          htmlFor="inventory-search"
          className="mb-1 block text-sm font-medium"
        >
          {t("common.search")}
        </label>

        <input
          id="inventory-search"
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder={t("inventory.searchProductSku")}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="inventory-warehouse"
          className="mb-1 block text-sm font-medium"
        >
          {t("inventory.warehouse")}
        </label>

        <select
          id="inventory-warehouse"
          value={warehouseId}
          onChange={(event) =>
            onWarehouseChange(event.target.value)
          }
          className="w-full rounded border px-3 py-2"
        >
          <option value="">{t("inventory.allWarehouses")}</option>

          {warehouses.map((warehouse) => (
            <option
              key={warehouse.id}
              value={warehouse.id}
            >
              {warehouse.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="inventory-status"
          className="mb-1 block text-sm font-medium"
        >
          {t("inventory.stockStatus")}
        </label>

        <select
          id="inventory-status"
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value)
          }
          className="w-full rounded border px-3 py-2"
        >
          <option value="">{t("inventory.allStatuses")}</option>
          <option value="Healthy">{t("inventory.healthy")}</option>
          <option value="Low Stock">{t("inventory.lowStock")}</option>
          <option value="Out of Stock">
            {t("inventory.outOfStock")}
          </option>
        </select>
      </div>
    </div>
  );
}
