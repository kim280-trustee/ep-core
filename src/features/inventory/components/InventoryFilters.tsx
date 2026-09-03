import type { ChangeEvent } from "react";

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
          Search
        </label>

        <input
          id="inventory-search"
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Product name or SKU"
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="inventory-warehouse"
          className="mb-1 block text-sm font-medium"
        >
          Warehouse
        </label>

        <select
          id="inventory-warehouse"
          value={warehouseId}
          onChange={(event) =>
            onWarehouseChange(event.target.value)
          }
          className="w-full rounded border px-3 py-2"
        >
          <option value="">All Warehouses</option>

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
          Stock Status
        </label>

        <select
          id="inventory-status"
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value)
          }
          className="w-full rounded border px-3 py-2"
        >
          <option value="">All Statuses</option>
          <option value="Healthy">Healthy</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">
            Out of Stock
          </option>
        </select>
      </div>
    </div>
  );
}
