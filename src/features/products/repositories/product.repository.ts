/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Repository
 * ============================================================
 */

import { supabase } from "@/core/infrastructure/supabase/client";

import type {
  CreateProductInput,
  Product,
  ProductFilters,
  ProductListParams,
  ProductListResult,
  UpdateProductInput,
} from "../types/product.types";

import {
  ProductStatus,
  ProductType,
} from "../types/product.types";

const TABLE = "products";

export interface IProductRepository {
  findAll(
    tenantId: string,
    params?: ProductListParams,
  ): Promise<ProductListResult>;

  findById(
    tenantId: string,
    id: string,
  ): Promise<Product | null>;

  create(
    input: CreateProductInput,
  ): Promise<Product>;

  update(
    tenantId: string,
    id: string,
    input: UpdateProductInput,
  ): Promise<Product>;

  delete(
    tenantId: string,
    id: string,
  ): Promise<void>;

  search(
    tenantId: string,
    search: string,
  ): Promise<Product[]>;
}

interface ProductDatabaseRow {
  id: string;
  tenant_id: string;
  store_id: string | null;
  name: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  category_id: string | null;
  brand_id: string | null;
  unit_id: string | null;
  tax_id: string | null;
  product_type: string;
  status: string;
  cost_price: number | string | null;
  selling_price: number | string | null;
  track_inventory: boolean | null;
  image_url: string | null;
  currency: string | null;
  created_at: string;
  updated_at: string;
  tax_rate?: number | string | null;
  stock_quantity?: number | string | null;
}

function fromDatabaseRow(
  row: ProductDatabaseRow,
): Product {
  const costPrice =
    Number(row.cost_price ?? 0);

  const sellingPrice =
    Number(row.selling_price ?? 0);

  const productType =
    Object.values(ProductType).includes(
      row.product_type as ProductType,
    )
      ? (row.product_type as ProductType)
      : ProductType.PRODUCT;

  const status =
    Object.values(ProductStatus).includes(
      row.status as ProductStatus,
    )
      ? (row.status as ProductStatus)
      : ProductStatus.ACTIVE;

  const stockQuantity =
    Number(
      row.stock_quantity ?? 0,
    );

  const taxRate =
    row.tax_rate == null
      ? undefined
      : Number(row.tax_rate);

  return {
    id: row.id,

    tenantId:
      row.tenant_id,

    storeId:
      row.store_id ?? undefined,

    name:
      row.name,

    identifiers: {
      sku:
        row.sku,

      barcode:
        row.barcode,
    },

    pricing: {
      costPrice,

      sellingPrice,

      currency:
        row.currency ?? "THB",
    },

    tax: {
      taxRate,
    },

    inventory: {
      stockQuantity,
    },

    sku:
      row.sku,

    barcode:
      row.barcode,

    description:
      row.description,

    categoryId:
      row.category_id,

    brandId:
      row.brand_id,

    unitId:
      row.unit_id,

    taxId:
      row.tax_id,

    productType,

    type:
      productType,

    status,

    costPrice,

    sellingPrice,

    trackInventory:
      row.track_inventory ?? true,

    imageUrl:
      row.image_url,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

function toDatabaseRow(
  input: CreateProductInput,
): Record<string, unknown> {
  return {
    tenant_id:
      input.tenantId,

    store_id:
      input.storeId ?? null,

    name:
      input.name,

    sku:
      input.sku,

    barcode:
      input.barcode ?? null,

    description:
      input.description ?? null,

    category_id:
      input.categoryId ?? null,

    brand_id:
      input.brandId ?? null,

    unit_id:
      input.unitId ?? null,

    tax_id:
      input.taxId ?? null,

    product_type:
      input.productType ??
      ProductType.PRODUCT,

    status:
      input.status ??
      ProductStatus.ACTIVE,

    cost_price:
      Number(input.costPrice),

    selling_price:
      Number(input.sellingPrice),

    track_inventory:
      input.trackInventory ?? true,

    image_url:
      input.imageUrl ?? null,

    currency:
      input.currency ?? "THB",
  };
}

function toDatabaseUpdate(
  input: UpdateProductInput,
): Record<string, unknown> {
  const updateData:
    Record<string, unknown> = {};

  if (input.storeId !== undefined) {
    updateData.store_id =
      input.storeId ?? null;
  }

  if (input.name !== undefined) {
    updateData.name =
      input.name;
  }

  if (input.sku !== undefined) {
    updateData.sku =
      input.sku;
  }

  if (input.barcode !== undefined) {
    updateData.barcode =
      input.barcode ?? null;
  }

  if (input.description !== undefined) {
    updateData.description =
      input.description ?? null;
  }

  if (input.categoryId !== undefined) {
    updateData.category_id =
      input.categoryId ?? null;
  }

  if (input.brandId !== undefined) {
    updateData.brand_id =
      input.brandId ?? null;
  }

  if (input.unitId !== undefined) {
    updateData.unit_id =
      input.unitId ?? null;
  }

  if (input.taxId !== undefined) {
    updateData.tax_id =
      input.taxId ?? null;
  }

  if (input.productType !== undefined) {
    updateData.product_type =
      input.productType;
  }

  if (input.status !== undefined) {
    updateData.status =
      input.status;
  }

  if (input.costPrice !== undefined) {
    updateData.cost_price =
      Number(input.costPrice);
  }

  if (input.sellingPrice !== undefined) {
    updateData.selling_price =
      Number(input.sellingPrice);
  }

  if (input.trackInventory !== undefined) {
    updateData.track_inventory =
      input.trackInventory;
  }

  if (input.imageUrl !== undefined) {
    updateData.image_url =
      input.imageUrl ?? null;
  }

  if (input.currency !== undefined) {
    updateData.currency =
      input.currency;
  }

  updateData.updated_at =
    new Date().toISOString();

  return updateData;
}

class ProductRepository
  implements IProductRepository {

  async findAll(
    tenantId: string,
    params: ProductListParams = {},
  ): Promise<ProductListResult> {
    const page =
      params.page ?? 1;

    const limit =
      params.limit ?? 20;

    const from =
      (page - 1) * limit;

    const to =
      from + limit - 1;

    let query =
      supabase
        .from(TABLE)
        .select("*", {
          count: "exact",
        })
        .eq(
          "tenant_id",
          tenantId,
        );

    const filters:
      ProductFilters =
      params.filters ?? {};

    if (filters.search) {
      const search =
        filters.search
          .trim()
          .replace(
            /[%_,]/g,
            " ",
          );

      if (search) {
        query =
          query.or(
            `name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`,
          );
      }
    }

    if (filters.categoryId) {
      query =
        query.eq(
          "category_id",
          filters.categoryId,
        );
    }

    if (filters.brandId) {
      query =
        query.eq(
          "brand_id",
          filters.brandId,
        );
    }

    if (filters.unitId) {
      query =
        query.eq(
          "unit_id",
          filters.unitId,
        );
    }

    if (filters.status) {
      query =
        query.eq(
          "status",
          filters.status,
        );
    }

    if (filters.productType) {
      query =
        query.eq(
          "product_type",
          filters.productType,
        );
    }

    const {
      data,
      error,
      count,
    } =
      await query
        .order(
          "name",
          {
            ascending: true,
          },
        )
        .range(
          from,
          to,
        );

    if (error) {
      console.error(
        "ProductRepository.findAll:",
        error,
      );

      throw error;
    }

    return {
      data:
        (data ?? []).map(
          (row) =>
            fromDatabaseRow(
              row as ProductDatabaseRow,
            ),
        ),

      total:
        count ?? 0,

      page,

      limit,
    };
  }

  async findById(
    tenantId: string,
    id: string,
  ): Promise<Product | null> {
    const {
      data,
      error,
    } =
      await supabase
        .from(TABLE)
        .select("*")
        .eq(
          "tenant_id",
          tenantId,
        )
        .eq(
          "id",
          id,
        )
        .maybeSingle();

    if (error) {
      console.error(
        "ProductRepository.findById:",
        error,
      );

      throw error;
    }

    if (!data) {
      return null;
    }

    return fromDatabaseRow(
      data as ProductDatabaseRow,
    );
  }

  async create(
    input: CreateProductInput,
  ): Promise<Product> {
    const row =
      toDatabaseRow(input);

    console.log(
      "Creating product:",
      row,
    );

    const {
      data,
      error,
    } =
      await supabase
        .from(TABLE)
        .insert(row)
        .select("*")
        .single();

    if (error) {
      console.error(
        "ProductRepository.create:",
        error,
      );

      throw new Error(
        `Failed to create product: ${error.message}`,
      );
    }

    if (!data) {
      throw new Error(
        "Product creation returned no data.",
      );
    }

    console.log(
      "Product created:",
      data,
    );

    return fromDatabaseRow(
      data as ProductDatabaseRow,
    );
  }

  async update(
    tenantId: string,
    id: string,
    input: UpdateProductInput,
  ): Promise<Product> {
    const updateData =
      toDatabaseUpdate(input);

    const {
      data,
      error,
    } =
      await supabase
        .from(TABLE)
        .update(updateData)
        .eq(
          "tenant_id",
          tenantId,
        )
        .eq(
          "id",
          id,
        )
        .select("*")
        .single();

    if (error) {
      console.error(
        "ProductRepository.update:",
        error,
      );

      throw error;
    }

    if (!data) {
      throw new Error(
        "Product update returned no data.",
      );
    }

    return fromDatabaseRow(
      data as ProductDatabaseRow,
    );
  }

  async delete(
    tenantId: string,
    id: string,
  ): Promise<void> {
    const {
      error,
    } =
      await supabase
        .from(TABLE)
        .delete()
        .eq(
          "tenant_id",
          tenantId,
        )
        .eq(
          "id",
          id,
        );

    if (error) {
      console.error(
        "ProductRepository.delete:",
        error,
      );

      throw error;
    }
  }

  async search(
    tenantId: string,
    search: string,
  ): Promise<Product[]> {
    const value =
      search.trim();

    if (!value) {
      return [];
    }

    const {
      data,
      error,
    } =
      await supabase
        .from(TABLE)
        .select("*")
        .eq(
          "tenant_id",
          tenantId,
        )
        .or(
          `name.ilike.%${value}%,sku.ilike.%${value}%,barcode.ilike.%${value}%`,
        )
        .limit(20);

    if (error) {
      console.error(
        "ProductRepository.search:",
        error,
      );

      throw error;
    }

    return (data ?? []).map(
      (row) =>
        fromDatabaseRow(
          row as ProductDatabaseRow,
        ),
    );
  }
}

export const productRepository =
  new ProductRepository();