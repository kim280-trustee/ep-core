/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Units Module
 *
 * Units Hook
 * ============================================================
 */

import {
  useEffect,
} from "react";

import {
  useUnitsStore,
} from "../store/units.store";

import {
  storeContext,
} from "@/core/store/store.context";

export function useUnits() {
  const {
    units,
    loadUnits,
    createUnit: createUnitStore,
    updateUnit: updateUnitStore,
    deleteUnit: deleteUnitStore,
  } = useUnitsStore();

  const context =
    storeContext.getStore();

  const tenantId =
    context?.tenantId ?? "";

  const storeId =
    context?.storeId ?? "";

  useEffect(() => {
    if (tenantId && storeId) {
      loadUnits();
    }
  }, [
    tenantId,
    storeId,
    loadUnits,
  ]);

  function createUnit(
    input: Parameters<
      typeof createUnitStore
    >[0],
  ) {
    if (!tenantId || !storeId) {
      throw new Error(
        "Store context is not initialized.",
      );
    }

    return createUnitStore(
      input,
      tenantId,
      storeId,
    );
  }

  function updateUnitById(
    id: string,
    updates: Parameters<
      typeof updateUnitStore
    >[1],
  ) {
    return updateUnitStore(
      id,
      updates,
    );
  }

  function deleteUnit(
    id: string,
  ) {
    return deleteUnitStore(
      id,
    );
  }

  return {
    units,

    createUnit,

    updateUnit:
      updateUnitById,

    updateUnitById,

    deleteUnit,
  };
}