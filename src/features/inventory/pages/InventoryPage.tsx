/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Inventory Module
 * ------------------------------------------------------------
 * Inventory Page
 * ============================================================
 */

import {
  ReceiveStockForm,
} from "../components/ReceiveStockForm";

import {
  useInventory,
} from "../hooks/useInventory";

import {
  useInventoryStore,
} from "../store/inventory.store";

import {
  InventoryToolbar,
} from "../components/InventoryToolbar";

import {
  InventoryTable,
} from "../components/InventoryTable";

import {
  useEffect,
} from "react";

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

  useEffect(() => {

    setRecords(
      inventory,
    );

  }, [
    inventory,
    setRecords,
  ]);

  return (

    <div className="p-6 space-y-6">

      <InventoryToolbar
        onRefresh={() => {
          void refresh();
        }}
      />

      <ReceiveStockForm />

      {loading && (
        <div className="border rounded p-4">
          Loading inventory...
        </div>
      )}

      {error && (
        <div className="border rounded p-4 text-red-600">
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
            className="
              mt-3
              border
              rounded
              px-4
              py-2
            "
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <InventoryTable
          records={records}
        />
      )}

    </div>

  );

}