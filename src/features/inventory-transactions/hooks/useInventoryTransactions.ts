import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  inventoryTransactionService,
} from "../services/inventory-transaction.service";

import type {
  InventoryTransaction,
} from "../types/inventory-transaction.types";


export function useInventoryTransactions() {

  const [
    transactions,
    setTransactions,
  ] = useState<InventoryTransaction[]>([]);

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
            await inventoryTransactionService.getTransactions();

          setTransactions(result);

        } catch (error) {

          console.error(
            "Failed to load inventory transactions:",
            error,
          );

          setTransactions([]);

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load inventory transactions.",
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

    transactions,

    loading,

    error,

    refresh,

  };

}
