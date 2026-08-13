/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Query Keys
 * ============================================================
 */

import type {
  ProductFilters,
} from "../types/product.types";

export const productKeys = {
  all: (
    tenantId: string,
  ) => [
    "products",
    tenantId,
  ] as const,

  list: (
    tenantId: string,
    filters?: ProductFilters,
  ) => [
    ...productKeys.all(
      tenantId,
    ),
    "list",
    filters ?? {},
  ] as const,

  detail: (
    tenantId: string,
    id: string,
  ) => [
    ...productKeys.all(
      tenantId,
    ),
    "detail",
    id,
  ] as const,

  search: (
    tenantId: string,
    keyword: string,
  ) => [
    ...productKeys.all(
      tenantId,
    ),
    "search",
    keyword,
  ] as const,
};