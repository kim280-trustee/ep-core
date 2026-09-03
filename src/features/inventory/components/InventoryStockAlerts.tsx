import { useProductsStore } from "@/features/products";
import { warehouseService } from "@/features/warehouses";
import { useEffect, useState } from "react";

import type {
  InventoryRecord,
} from "../types/inventory-record.types";

interface InventoryStockAlertsProps {
  records: InventoryRecord[];
}

interface WarehouseNameMap {
  [warehouseId: string]: string;
}

export function InventoryStockAlerts({
  records,
}: InventoryStockAlertsProps) {

  const products = useProductsStore(
    (state) => state.products,
  );

  const [warehouseNames, setWarehouseNames] =
    useState<WarehouseNameMap>({});

  useEffect(() => {
    const warehouseIds = [
      ...new Set(
        records.map(
          (record) => record.warehouseId,
        ),
      ),
    ];

    if (warehouseIds.length === 0) {
      setWarehouseNames({});
      return;
    }

    let cancelled = false;

    const loadWarehouses = async () => {
      const entries = await Promise.all(
        warehouseIds.map(
          async (warehouseId) => {
            const warehouse =
              await warehouseService.getWarehouseById(
                warehouseId,
              );

            return [
              warehouseId,
              warehouse?.name ?? warehouseId,
            ] as const;
          },
        ),
      );

      if (!cancelled) {
        setWarehouseNames(
          Object.fromEntries(entries),
        );
      }
    };

    void loadWarehouses();

    return () => {
      cancelled = true;
    };
  }, [records]);

  const alerts = records
    .filter(
      (record) =>
        record.quantityOnHand <=
        record.minimumStockLevel,
    )
    .sort(
      (a, b) =>
        a.quantityOnHand -
        b.quantityOnHand,
    );

  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold">
          Stock Alerts
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          No low-stock or out-of-stock items.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm">

      <div className="border-b p-5">
        <h3 className="text-lg font-semibold">
          Stock Alerts
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Products that have reached or fallen below
          their minimum stock level.
        </p>
      </div>

      <div className="overflow-x-auto">

        <table className="w-full border-collapse">

          <thead>
            <tr className="bg-gray-50">

              <th className="border-b p-3 text-left text-sm font-medium">
                Product
              </th>

              <th className="border-b p-3 text-left text-sm font-medium">
                Warehouse
              </th>

              <th className="border-b p-3 text-right text-sm font-medium">
                On Hand
              </th>

              <th className="border-b p-3 text-right text-sm font-medium">
                Minimum
              </th>

              <th className="border-b p-3 text-right text-sm font-medium">
                Shortage
              </th>

              <th className="border-b p-3 text-left text-sm font-medium">
                Status
              </th>

            </tr>
          </thead>

          <tbody>

            {alerts.map((record) => {

              const product =
                products.find(
                  (item) =>
                    item.id ===
                    record.productId,
                );

              const outOfStock =
                record.quantityOnHand <= 0;

              const shortage =
                Math.max(
                  0,
                  record.minimumStockLevel -
                  record.quantityOnHand,
                );

              const productLabel =
                product
                  ? `${product.name} (${product.identifiers.sku})`
                  : record.productId;

              const warehouseLabel =
                warehouseNames[
                  record.warehouseId
                ] ??
                record.warehouseId;

              return (
                <tr key={record.id}>

                  <td className="border-b p-3">
                    {productLabel}
                  </td>

                  <td className="border-b p-3">
                    {warehouseLabel}
                  </td>

                  <td className="border-b p-3 text-right font-medium">
                    {record.quantityOnHand}
                  </td>

                  <td className="border-b p-3 text-right">
                    {record.minimumStockLevel}
                  </td>

                  <td className="border-b p-3 text-right">
                    {shortage}
                  </td>

                  <td className="border-b p-3">

                    <span
                      className={
                        outOfStock
                          ? "rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
                          : "rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700"
                      }
                    >
                      {outOfStock
                        ? "Out of Stock"
                        : "Low Stock"}
                    </span>

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

    </div>
  );
}
