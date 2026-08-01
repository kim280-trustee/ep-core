/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Products Module
 * ------------------------------------------------------------
 * Product Type Definitions
 * ============================================================
 */

export enum ProductStatus {

  ACTIVE = "active",

  INACTIVE = "inactive",

}

export enum ProductType {

  PRODUCT = "product",

  SERVICE = "service",

}

export interface ProductIdentifiers {

  sku: string;

  barcode: string | null;

}

export interface ProductPricing {

  costPrice: number;

  sellingPrice: number;

  currency: string;

}

export interface ProductTax {

  taxId: string | null;

  taxRate: number;

}

export interface ProductInventory {

  trackInventory: boolean;

  stockQuantity: number;

}

export interface Product {

  id: string;

  tenantId: string;

  storeId: string;

  name: string;

  description: string | null;

  type: ProductType;

  identifiers: ProductIdentifiers;

  pricing: ProductPricing;

  tax: ProductTax;

  inventory: ProductInventory;

  categoryId: string | null;

  brandId: string | null;

  unitId: string | null;

  imageUrl: string | null;

  status: ProductStatus;

  createdAt: string;

  updatedAt: string;

}

export interface CreateProductDto {

  name: string;

  description?: string | null;

  type?: ProductType;

  identifiers: ProductIdentifiers;

  pricing: ProductPricing;

  tax?: ProductTax;

  inventory?: ProductInventory;

  categoryId?: string | null;

  brandId?: string | null;

  unitId?: string | null;

  imageUrl?: string | null;

}

export interface UpdateProductDto {

  name?: string;

  description?: string | null;

  identifiers?: Partial<ProductIdentifiers>;

  pricing?: Partial<ProductPricing>;

  tax?: Partial<ProductTax>;

  inventory?: Partial<ProductInventory>;

  categoryId?: string | null;

  brandId?: string | null;

  unitId?: string | null;

  imageUrl?: string | null;

  status?: ProductStatus;

}

export interface ProductFilters {

  search?: string;

  categoryId?: string;

  brandId?: string;

  status?: ProductStatus;

}

export interface ProductListResponse {

  data: Product[];

  total: number;

}