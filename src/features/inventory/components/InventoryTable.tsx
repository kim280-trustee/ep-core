import { useMemo, useState } from "react";

import { useProductsStore } from "@/features/products";
import { storeContext } from "@/core/store/store.context";

import { inventoryService } from "../services/inventory.service";
import { stockAdjustmentEngine } from "../engine/stock-adjustment.engine";
import { stockTransferEngine } from "../engine/stock-transfer.engine";

import { StockAdjustmentDialog } from "./StockAdjustmentDialog";
import { StockTransferDialog } from "./StockTransferDialog";
import { StockLevelDialog } from "./StockLevelDialog";

import type { InventoryRecord } from "../types/inventory-record.types";

interface WarehouseOption {
  id: string;
  name: string;
}

interface InventoryTableProps {
  records: InventoryRecord[];
  warehouses?: WarehouseOption[];
  onChanged?: () => void | Promise<void>;
}

type SortKey =
  | "PRODUCT"
  | "WAREHOUSE"
  | "QUANTITY"
  | "AVAILABLE"
  | "COST"
  | "STATUS";

function getStockStatus(record: InventoryRecord) {
  if (record.quantityOnHand <= 0) {
    return "Out of Stock";
  }

  if (record.quantityOnHand <= record.minimumStockLevel) {
    return "Low Stock";
  }

  return "Healthy";
}

function statusRank(status: string) {
  if (status === "Out of Stock") return 0;
  if (status === "Low Stock") return 1;
  return 2;
}

export function InventoryTable({
  records,
  warehouses = [],
  onChanged,
}: InventoryTableProps) {
  const products = useProductsStore(
    (state) => state.products,
  );

  const [sortKey, setSortKey] =
    useState<SortKey>("PRODUCT");

  const [ascending, setAscending] =
    useState(true);

  const [adjustmentRecord, setAdjustmentRecord] =
    useState<InventoryRecord | null>(null);

  const [transferRecord, setTransferRecord] =
    useState<InventoryRecord | null>(null);

  const [levelRecord, setLevelRecord] =
    useState<InventoryRecord | null>(null);

  const context = storeContext.getStore();

  const warehouseMap = useMemo(
    () =>
      new Map(
        warehouses.map((warehouse) => [
          warehouse.id,
          warehouse.name,
        ]),
      ),
    [warehouses],
  );

  const sortedRecords = useMemo(() => {
    const result = [...records];

    result.sort((a, b) => {
      const productA =
        products.find(
          (product) => product.id === a.productId,
        );

      const productB =
        products.find(
          (product) => product.id === b.productId,
        );

      const nameA =
        productA?.name?.toLowerCase() ?? a.productId;

      const nameB =
        productB?.name?.toLowerCase() ?? b.productId;

      const warehouseA =
        warehouseMap.get(a.warehouseId) ??
        a.warehouseId;

      const warehouseB =
        warehouseMap.get(b.warehouseId) ??
        b.warehouseId;

      let comparison = 0;

      switch (sortKey) {
        case "PRODUCT":
          comparison = nameA.localeCompare(nameB);
          break;

        case "WAREHOUSE":
          comparison = warehouseA.localeCompare(warehouseB);
          break;

        case "QUANTITY":
          comparison =
            a.quantityOnHand -
            b.quantityOnHand;
          break;

        case "AVAILABLE":
          comparison =
            a.availableQuantity -
            b.availableQuantity;
          break;

        case "COST":
          comparison =
            a.averageCost -
            b.averageCost;
          break;

        case "STATUS":
          comparison =
            statusRank(getStockStatus(a)) -
            statusRank(getStockStatus(b));
          break;
      }

      return ascending
        ? comparison
        : -comparison;
    });

    return result;
  }, [
    records,
    products,
    warehouses,
    warehouseMap,
    sortKey,
    ascending,
  ]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setAscending((current) => !current);
      return;
    }

    setSortKey(key);
    setAscending(true);
  };

  const sortIndicator = (key: SortKey) =>
    sortKey === key
      ? ascending
        ? " ↑"
        : " ↓"
      : "";

  return (
    <>
      <div className="overflow-x-auto rounded border">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-left">
                <button
                  type="button"
                  onClick={() =>
                    handleSort("PRODUCT")
                  }
                  className="font-semibold"
                >
                  Product
                  {sortIndicator("PRODUCT")}
                </button>
              </th>

              <th className="border p-2 text-left">
                <button
                  type="button"
                  onClick={() =>
                    handleSort("WAREHOUSE")
                  }
                  className="font-semibold"
                >
                  Warehouse
                  {sortIndicator("WAREHOUSE")}
                </button>
              </th>

              <th className="border p-2 text-right">
                <button
                  type="button"
                  onClick={() =>
                    handleSort("QUANTITY")
                  }
                  className="font-semibold"
                >
                  On Hand
                  {sortIndicator("QUANTITY")}
                </button>
              </th>

              <th className="border p-2 text-right">
                <button
                  type="button"
                  onClick={() =>
                    handleSort("AVAILABLE")
                  }
                  className="font-semibold"
                >
                  Available
                  {sortIndicator("AVAILABLE")}
                </button>
              </th>

              <th className="border p-2 text-right">
                <button
                  type="button"
                  onClick={() =>
                    handleSort("COST")
                  }
                  className="font-semibold"
                >
                  Average Cost
                  {sortIndicator("COST")}
                </button>
              </th>

              <th className="border p-2 text-left">
                <button
                  type="button"
                  onClick={() =>
                    handleSort("STATUS")
                  }
                  className="font-semibold"
                >
                  Status
                  {sortIndicator("STATUS")}
                </button>
              </th>

              <th className="border p-2 text-left">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedRecords.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="border p-8 text-center text-gray-500"
                >
                  No inventory records match your filters.
                </td>
              </tr>
            ) : (
              sortedRecords.map((record) => {
                const product =
                  products.find(
                    (item) =>
                      item.id === record.productId,
                  );

                const status =
                  getStockStatus(record);

                const warehouseName =
                  warehouseMap.get(
                    record.warehouseId,
                  ) ?? record.warehouseId;

                return (
                  <tr key={record.id}>
                    <td className="border p-2">
                      {product
                        ? `${product.name} (${product.identifiers.sku})`
                        : record.productId}
                    </td>

                    <td className="border p-2">
                      {warehouseName}
                    </td>

                    <td className="border p-2 text-right">
                      {record.quantityOnHand}
                    </td>

                    <td className="border p-2 text-right">
                      {record.availableQuantity}
                    </td>

                    <td className="border p-2 text-right">
                      {record.averageCost.toFixed(2)}
                    </td>

                    <td className="border p-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          status === "Healthy"
                            ? "bg-green-100 text-green-700"
                            : status === "Low Stock"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="border p-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setAdjustmentRecord(record)
                          }
                          className="rounded border px-3 py-1 text-sm"
                        >
                          Adjust
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setTransferRecord(record)
                          }
                          className="rounded border px-3 py-1 text-sm"
                        >
                          Transfer
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setLevelRecord(record)
                          }
                          className="rounded border px-3 py-1 text-sm"
                        >
                          Set Level
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {adjustmentRecord && context && (
        <StockAdjustmentDialog
          productId={adjustmentRecord.productId}
          tenantId={context.tenantId}
          storeId={context.storeId}
          warehouseId={adjustmentRecord.warehouseId}
          adjustedBy="current-user"
          onSubmit={async (adjustment) => {
            const signedQuantity =
              adjustment.adjustmentType === "DECREASE"
                ? -adjustment.quantity
                : adjustment.quantity;

            await stockAdjustmentEngine.adjust(
              adjustmentRecord,
              Math.abs(signedQuantity),
              signedQuantity > 0
                ? "ADJUSTMENT_IN"
                : "ADJUSTMENT_OUT",
              adjustment.reason,
            );

            await onChanged?.();
            setAdjustmentRecord(null);
          }}
          onClose={() =>
            setAdjustmentRecord(null)
          }
        />
      )}

      {transferRecord && context && (
        <StockTransferDialog
          productId={transferRecord.productId}
          tenantId={context.tenantId}
          fromStoreId={context.storeId}
          sourceWarehouseId={
            transferRecord.warehouseId
          }
          transferredBy="current-user"
          onSubmit={async (transfer) => {
            await stockTransferEngine.transferToWarehouse(
              transferRecord,
              transfer.destinationWarehouseId,
              transfer.quantity,
              transfer.reason,
            );

            await onChanged?.();
            setTransferRecord(null);
          }}
          onClose={() =>
            setTransferRecord(null)
          }
        />
      )}

      {levelRecord && (
        <StockLevelDialog
          currentMinimum={
            levelRecord.minimumStockLevel
          }
          currentMaximum={
            levelRecord.maximumStockLevel
          }
          onSubmit={async (
            minimumStockLevel,
            maximumStockLevel,
          ) => {
            await inventoryService.updateInventory(
              levelRecord.tenantId,
              levelRecord.id,
              {
                minimumStockLevel,
                maximumStockLevel,
              },
            );

            await onChanged?.();
            setLevelRecord(null);
          }}
          onClose={() =>
            setLevelRecord(null)
          }
        />
      )}
    </>
  );
}
