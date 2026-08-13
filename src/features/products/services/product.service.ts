/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Service
 * ============================================================
 */

import {
  productRepositoryProvider,
} from "../repositories/repository.provider";

import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
  ProductListResult,
} from "../types/product.types";

export const productService = {

  async getProducts(
    tenantId: string,
    filters?: ProductFilters,
  ): Promise<ProductListResult> {

    return productRepositoryProvider.findAll(
      tenantId,
      {
        filters,
      },
    );

  },

  async getProduct(
    tenantId: string,
    id: string,
  ): Promise<Product | null> {

    return productRepositoryProvider.findById(
      tenantId,
      id,
    );

  },

  async getProductById(
    tenantId: string,
    id: string,
  ): Promise<Product | null> {

    return productRepositoryProvider.findById(
      tenantId,
      id,
    );

  },

  async createProduct(
    input: CreateProductInput,
  ): Promise<Product> {

    return productRepositoryProvider.create(
      input,
    );

  },

  async updateProduct(
    tenantId: string,
    id: string,
    input: UpdateProductInput,
  ): Promise<Product> {

    return productRepositoryProvider.update(
      tenantId,
      id,
      input,
    );

  },

  async deleteProduct(
    tenantId: string,
    id: string,
  ): Promise<void> {

    return productRepositoryProvider.delete(
      tenantId,
      id,
    );

  },

  async searchProducts(
    tenantId: string,
    query: string,
  ): Promise<Product[]> {

    return productRepositoryProvider.search(
      tenantId,
      query,
    );

  },

};