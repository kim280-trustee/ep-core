import type {
  ProductStatus,
  ProductType,
} from "../types/product.types";


export const PRODUCT_TYPES: readonly ProductType[] = [
  "simple",
  "variable",
  "service",
];


export const PRODUCT_STATUSES: readonly ProductStatus[] = [
  "active",
  "inactive",
];


export const DEFAULT_PRODUCT_CURRENCY = "THB";


export const DEFAULT_TAX_RATE = 7;