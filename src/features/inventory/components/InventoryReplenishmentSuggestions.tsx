import { useEffect, useState } from "react";

import { useProductsStore } from "@/features/products";
import { warehouseService } from "@/features/warehouses";

import type {
  InventoryRecord,
} from "../types/inventory-record.types";

interface InventoryReplenishmentSuggestionsProps {
  records: InventoryRecord[];
  onRestock?: (
    record: InventoryRecord,
    quantity: number,
  ) => void;
}

interface WarehouseNameMap {
  [warehouseId: string]: string;
}

export function InventoryReplenishmentSuggestions({
  records,
  onRestock,
}: InventoryReplenishmentSuggestionsProps) {

  const products =
    useProductsStore(
      (state) => state.products,
    );

  const [
    warehouseNames,
    setWarehouseNames,
  ] = useState<WarehouseNameMap>({});

  useEffect(() => {

    const warehouseIds = [
      ...new Set(
        records.map(
          (record) =>
            record.warehouseId,
        ),
      ),
    ];

    if (warehouseIds.length === 0) {
      setWarehouseNames({});
      return;
    }

    let cancelled = false;

    const loadWarehouses = async () => {

      const entries =
        await Promise.all(
          warehouseIds.map(
            async (warehouseId) => {

              const warehouse =
                await warehouseService
                  .getWarehouseById(
                    warehouseId,
                  );

              return [
                warehouseId,
                warehouse?.name ??
                  warehouseId,
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

  const suggestions =
    records
      .filter(
        (record) =>
          record.quantityOnHand <
          record.minimumStockLevel,
      )
      .map((record) => ({
        ...record,
        restockQuantity:
          record.minimumStockLevel -
          record.quantityOnHand,
      }))
      .sort(
        (a, b) =>
          b.restockQuantity -
          a.restockQuantity,
      );

  if (suggestions.length === 0) {

    return (
      <div className="rounded-lg border bg-white p-5 shadow-sm">

        <h3 className="text-lg font-semibold">
          Restock Suggestions
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          No products currently need more stock.
        </p>

      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm">

      <div className="border-b p-5">

        <h3 className="text-lg font-semibold">
          Restock Suggestions
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Products that need more stock.
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
                Restock Qty
              </th>

              <th className="border-b p-3 text-left text-sm font-medium">
                Reason
              </th>

              <th className="border-b p-3 text-left text-sm font-medium">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {suggestions.map((record) => {

              const product =
                products.find(
                  (item) =>
                    item.id ===
                    record.productId,
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

                  <td className="border-b p-3 text-right">
                    {record.quantityOnHand}
                  </td>

                  <td className="border-b p-3 text-right">
                    {record.minimumStockLevel}
                  </td>

                  <td className="border-b p-3 text-right font-semibold">
                    {record.restockQuantity}
                  </td>

                  <td className="border-b p-3">

                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                      Below minimum
                    </span>

                  </td>

                  <td className="border-b p-3">

                    <button
                      type="button"
                      onClick={() =>
                        onRestock?.(
                          record,
                          record.restockQuantity,
                        )
                      }
                      className="rounded bg-black px-3 py-1 text-sm text-white"
                    >
                      Restock
                    </button>

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
