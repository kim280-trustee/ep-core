import type { InventoryRecord } from "../types/inventory-record.types";

interface InventoryValuationSummaryProps {
  records: InventoryRecord[];
}

export function InventoryValuationSummary({
  records,
}: InventoryValuationSummaryProps) {
  const totalQuantity = records.reduce(
    (sum, record) =>
      sum + record.quantityOnHand,
    0,
  );

  const inventoryValue = records.reduce(
    (sum, record) =>
      sum +
      record.quantityOnHand *
        record.averageCost,
    0,
  );

  const warehouseCount = new Set(
    records.map(
      (record) => record.warehouseId,
    ),
  ).size;

  const productCount = new Set(
    records.map(
      (record) => record.productId,
    ),
  ).size;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="rounded border p-4">
        <p className="text-sm text-gray-500">
          Stock Quantity
        </p>
        <p className="mt-1 text-2xl font-semibold">
          {totalQuantity}
        </p>
      </div>

      <div className="rounded border p-4">
        <p className="text-sm text-gray-500">
          Inventory Value
        </p>
        <p className="mt-1 text-2xl font-semibold">
          {inventoryValue.toFixed(2)}
        </p>
      </div>

      <div className="rounded border p-4">
        <p className="text-sm text-gray-500">
          Products
        </p>
        <p className="mt-1 text-2xl font-semibold">
          {productCount}
        </p>
      </div>

      <div className="rounded border p-4">
        <p className="text-sm text-gray-500">
          Warehouses
        </p>
        <p className="mt-1 text-2xl font-semibold">
          {warehouseCount}
        </p>
      </div>
    </div>
  );
}
