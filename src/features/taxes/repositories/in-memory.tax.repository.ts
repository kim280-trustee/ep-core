/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Taxes Module
 *
 * In Memory Tax Repository
 * ============================================================
 */

import {

} from "../types/tax.types";

import type {
  Tax,
} from "../types/tax.types";

import type {
  TaxRepository,
} from "./tax.repository";

import {
  storeContext,
} from "@/core/store/store.context";

let taxes: Tax[] = [];

function getContext() {
  return storeContext.getStore();
}

export const inMemoryTaxRepository: TaxRepository = {

  findAll(
    tenantId?: string,
  ) {
    const context =
      getContext();

    const effectiveTenantId =
      tenantId ??
      context?.tenantId;

    if (!effectiveTenantId) {
      return [];
    }

    return taxes.filter(
      (tax) =>
        tax.tenantId ===
        effectiveTenantId,
    );
  },

  findById(
    id: string,
  ) {
    return taxes.find(
      (tax) =>
        tax.id === id,
    );
  },

  create(
    tax: Tax,
  ) {
    taxes.push(
      tax,
    );

    return tax;
  },

  update(
    id: string,
    updates: Partial<Tax>,
  ) {
    const index =
      taxes.findIndex(
        (tax) =>
          tax.id === id,
      );

    if (index === -1) {
      return undefined;
    }

    taxes[index] = {
      ...taxes[index],
      ...updates,
      updatedAt:
        new Date().toISOString(),
    };

    return taxes[index];
  },

  delete(
    id: string,
  ) {
    const before =
      taxes.length;

    taxes =
      taxes.filter(
        (tax) =>
          tax.id !== id,
      );

    return (
      taxes.length <
      before
    );
  },

};
