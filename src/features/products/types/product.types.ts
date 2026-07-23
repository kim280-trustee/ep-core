/**
 * Product domain model
 *
 * Core business entity for E&P Smart POS.
 *
 * Used by:
 * - Inventory
 * - Sales
 * - Purchasing
 * - Reports
 * - AI analytics
 */

export type ProductStatus = "active" | "inactive";

export type ProductType =
  | "simple"
  | "variable"
  | "service";

export interface ProductPricing {
  costPrice: number;

  sellingPrice: number;

  wholesalePrice?: number;

  currency: string;
}

export interface ProductInventory {
  trackInventory: boolean;

  stockQuantity: number;

  minimumStockLevel?: number;

  maximumStockLevel?: number;
}

export interface ProductIdentifiers {
  sku: string;

  barcode?: string;
}

export interface ProductTax {
  taxable: boolean;

  taxRate?: number;
}

export interface Product {
  id: string;

  tenantId: string;

  storeId: string;

  name: string;

  description?: string;

  productType: ProductType;

  identifiers: ProductIdentifiers;

  categoryId?: string;

  brandId?: string;

  unitId: string;

  pricing: ProductPricing;

  inventory: ProductInventory;

  tax: ProductTax;

  imageUrl?: string;

  status: ProductStatus;

  createdAt: string;

  updatedAt: string;
}