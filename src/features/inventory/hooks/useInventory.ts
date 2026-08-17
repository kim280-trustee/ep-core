/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Inventory Hook
 * ============================================================
 */

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  inventoryService,
} from "../services/inventory.service";

import {
  storeContext,
} from "@/core/store/store.context";

import type {
  InventoryRecord,
} from "../types/inventory-record.types";


export function useInventory() {

  const [
    inventory,
    setInventory,
  ] = useState<InventoryRecord[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState<string | null>(null);


  const refresh =
    useCallback(
      async () => {

        const context =
          storeContext.getStore();


        if (!context?.tenantId) {

          setInventory([]);

          setError(
            "Store context is not initialized.",
          );

          return;

        }


        setLoading(true);

        setError(null);


        try {

          const records =
            await inventoryService.getInventory(
              context.tenantId,
            );


          setInventory(records);

        } catch (error) {

          console.error(
            "Failed to load inventory:",
            error,
          );


          setInventory([]);

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load inventory",
          );

        } finally {

          setLoading(false);

        }

      },
      [],
    );


  useEffect(() => {

    void refresh();

  }, [refresh]);


  return {

    inventory,

    loading,

    error,

    refresh,

  };

}