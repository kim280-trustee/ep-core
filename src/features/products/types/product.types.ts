export type EntityId = string;
export type TenantId = string;
export type StoreId = string;
export type UserId = string;

export enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum ProductType {
  PRODUCT = "PRODUCT",
  STANDARD = "STANDARD",
  SERVICE = "SERVICE",
}

export interface ProductIdentifiers {
  sku: string;
  barcode?: string | null;
}

export interface ProductPricing {
  costPrice: number;
  sellingPrice: number;
  currency: string;
}

export interface ProductTax {
  taxRate?: number;
}

export interface ProductInventory {
  stockQuantity: number;
}

export interface Product {
  id: EntityId;

  tenantId: TenantId;

  storeId?: StoreId;

  name: string;

  identifiers: ProductIdentifiers;

  pricing: ProductPricing;

  tax: ProductTax;

  inventory: ProductInventory;

  sku: string;

  barcode?: string | null;

  description?: string | null;

  categoryId?: string | null;

  brandId?: string | null;

  unitId?: string | null;

  taxId?: string | null;

  productType: ProductType;

  type: ProductType;

  status: ProductStatus;

  costPrice: number;

  sellingPrice: number;

  trackInventory: boolean;

  imageUrl?: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface ProductFilters {
  search?: string;

  categoryId?: string;

  brandId?: string;

  unitId?: string;

  status?: ProductStatus;

  productType?: ProductType;
}

export interface ProductListParams {
  page?: number;

  limit?: number;

  filters?: ProductFilters;
}

export interface ProductListResult {
  data: Product[];

  total: number;

  page: number;

  limit: number;
}

export interface CreateProductInput {
  tenantId: TenantId;

  storeId?: StoreId;

  name: string;

  sku: string;

  barcode?: string;

 description?: string | null;

  categoryId?: string;

  brandId?: string;

  unitId?: string;

  taxId?: string;

  productType?: ProductType;

  status?: ProductStatus;

  costPrice: number;

  sellingPrice: number;

  currency?: string;

  trackInventory?: boolean;

  imageUrl?: string;
}

export interface UpdateProductInput
  extends Partial<CreateProductInput> {}

export type CreateProductDto =
  CreateProductInput;

export type UpdateProductDto =
  UpdateProductInput;