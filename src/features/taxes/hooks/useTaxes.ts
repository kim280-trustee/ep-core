/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Taxes Module
 *
 * Taxes Hook
 * ============================================================
 */

import {
  useEffect,
} from "react";

import {
  useTaxStore,
} from "../store/tax.store";

import type {
  CreateTaxDto,
  UpdateTaxDto,
} from "../types/tax.types";

import {
  storeContext,
} from "@/core/store/store.context";

export function useTaxes() {

  const {
    taxes,
    loadTaxes,
    createTax:
      createTaxStore,
    updateTax:
      updateTaxStore,
    deleteTax:
      deleteTaxStore,
  } = useTaxStore();

  const context =
    storeContext.getStore();

  const tenantId =
    context?.tenantId ?? "";

  const storeId =
    context?.storeId ?? "";

  useEffect(() => {

    if (tenantId) {
     loadTaxes();
    }

  }, [
    tenantId,
    loadTaxes,
  ]);

  function createTax(
    input: CreateTaxDto,
  ) {

    if (!tenantId || !storeId) {
      throw new Error(
        "Store context is not initialized.",
      );
    }

    return createTaxStore(
      input,
      tenantId,
      storeId,
    );
  }

  function updateTaxById(
    id: string,
    updates: UpdateTaxDto,
  ) {

    return updateTaxStore(
  id,
  updates,
);
  }

  function deleteTax(
    id: string,
  ) {

    return deleteTaxStore(
  id,
);
  }

  return {

    taxes,

    createTax,

    updateTaxById,

    deleteTax,

  };
}
