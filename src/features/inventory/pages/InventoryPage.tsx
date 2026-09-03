import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ReceiveStockForm } from "../components/ReceiveStockForm";
import { InventorySummaryCards } from "../components/InventorySummaryCards";
import { InventoryStockAlerts } from "../components/InventoryStockAlerts";
import { InventoryReplenishmentSuggestions } from "../components/InventoryReplenishmentSuggestions";
import { InventoryToolbar } from "../components/InventoryToolbar";
import { InventoryFilters } from "../components/InventoryFilters";
import { InventoryTable } from "../components/InventoryTable";
import { InventoryValuationSummary } from "../components/InventoryValuationSummary";

import { useInventory } from "../hooks/useInventory";
import { useInventoryStore } from "../store/inventory.store";

import { useProductsStore } from "@/features/products";
import { warehouseService } from "@/features/warehouses";

import type { InventoryRecord } from "../types/inventory-record.types";

interface RestockRequest {
  productId: string;
  warehouseId: string;
  quantity: number;
}

export function InventoryPage() {
  const {
    inventory,
    loading,
    error,
    refresh,
  } = useInventory();

  const {
    records,
    setRecords,
  } = useInventoryStore();

  const products = useProductsStore(
    (state) => state.products,
  );

  const loadProducts = useProductsStore(
    (state) => state.loadProducts,
  );

  const [warehouses, setWarehouses] =
    useState<
      Array<{
        id: string;
        name: string;
      }>
    >([]);

  const [search, setSearch] =
    useState("");

  const [warehouseId, setWarehouseId] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [
    restockRequest,
    setRestockRequest,
  ] = useState<RestockRequest | null>(null);

  const receiveStockRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setRecords(inventory);
  }, [
    inventory,
    setRecords,
  ]);

  useEffect(() => {
    if (products.length === 0) {
      void loadProducts();
    }
  }, [
    products.length,
    loadProducts,
  ]);

  useEffect(() => {
    async function loadWarehouses() {
      try {
        const result =
          await warehouseService.getWarehouses();

        setWarehouses(
          result
            .filter(
              (warehouse) =>
                warehouse.status === "ACTIVE",
            )
            .map((warehouse) => ({
              id: warehouse.id,
              name: warehouse.name,
            })),
        );
      } catch (error) {
        console.error(
          "Failed to load warehouses:",
          error,
        );
      }
    }

    void loadWarehouses();
  }, []);

  const filteredRecords = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return records.filter((record) => {
      if (
        warehouseId &&
        record.warehouseId !== warehouseId
      ) {
        return false;
      }

      const stockStatus =
        record.quantityOnHand <= 0
          ? "Out of Stock"
          : record.quantityOnHand <=
              record.minimumStockLevel
            ? "Low Stock"
            : "Healthy";

      if (
        status &&
        stockStatus !== status
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const product =
        products.find(
          (item) =>
            item.id === record.productId,
        );

      const productName =
        product?.name?.toLowerCase() ?? "";

      const sku =
        product?.identifiers?.sku?.toLowerCase() ?? "";

      return (
        productName.includes(
          normalizedSearch,
        ) ||
        sku.includes(
          normalizedSearch,
        )
      );
    });
  }, [
    records,
    products,
    search,
    warehouseId,
    status,
  ]);

  const handleRestock = (
    record: InventoryRecord,
    quantity: number,
  ) => {
    setRestockRequest({
      productId: record.productId,
      warehouseId: record.warehouseId,
      quantity,
    });

    window.setTimeout(() => {
      receiveStockRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  return (
    <div className="space-y-6 p-6">
      <InventoryToolbar
        onRefresh={() => {
          void refresh();
        }}
      />

      {!loading && !error && (
        <>
          <InventorySummaryCards
            inventory={records}
          />

          <InventoryValuationSummary
            records={records}
          />

          <InventoryStockAlerts
            records={records}
          />

          <InventoryReplenishmentSuggestions
            records={records}
            onRestock={handleRestock}
          />

          <InventoryFilters
            search={search}
            warehouseId={warehouseId}
            status={status}
            warehouses={warehouses}
            onSearchChange={setSearch}
            onWarehouseChange={
              setWarehouseId
            }
            onStatusChange={setStatus}
          />
        </>
      )}

      <div ref={receiveStockRef}>
        <ReceiveStockForm
          initialProductId={
            restockRequest?.productId
          }
          initialWarehouseId={
            restockRequest?.warehouseId
          }
          initialQuantity={
            restockRequest?.quantity
          }
          onRestockRequestHandled={() =>
            setRestockRequest(null)
          }
        />
      </div>

      {loading && (
        <div className="rounded border p-4">
          Loading inventory...
        </div>
      )}

      {error && (
        <div className="rounded border p-4 text-red-600">
          <p className="font-semibold">
            Unable to load inventory
          </p>

          <p className="mt-1">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              void refresh();
            }}
            className="mt-3 rounded border px-4 py-2"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="text-sm text-gray-500">
            Showing{" "}
            {filteredRecords.length}{" "}
            of {records.length}{" "}
            inventory records.
          </div>

          <InventoryTable
            records={filteredRecords}
            warehouses={warehouses}
            onChanged={refresh}
          />
        </>
      )}
    </div>
  );
}
