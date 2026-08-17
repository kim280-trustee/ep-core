import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  inventoryLedgerService,
} from "../services/inventory-ledger.service";

import type {
  InventoryLedgerEntry,
} from "../types/inventory-ledger.types";


export function useInventoryLedger() {

  const [
    ledger,
    setLedger,
  ] = useState<InventoryLedgerEntry[]>([]);

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

        setLoading(true);

        setError(null);

        try {

          const result =
            await inventoryLedgerService.getLedger();

          setLedger(result);

        } catch (error) {

          console.error(
            "Failed to load inventory ledger:",
            error,
          );

          setLedger([]);

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load inventory ledger.",
          );

        } finally {

          setLoading(false);

        }

      },
      [],
    );


  useEffect(() => {

    void refresh();

  }, [
    refresh,
  ]);


  return {

    ledger,

    loading,

    error,

    refresh,

  };

}
