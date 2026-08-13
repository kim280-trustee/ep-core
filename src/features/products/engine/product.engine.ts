/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Engine
 * ============================================================
 */

import { productService } from "../services/product.service";

import type {
  CreateProductInput,
  Product,
  ProductFilters,
  ProductListResult,
  UpdateProductInput,
} from "../types/product.types";

class ProductEngine {
  async getProducts(
    tenantId: string,
    filters?: ProductFilters,
  ): Promise<ProductListResult> {
    return productService.getProducts(
      tenantId,
      filters,
    );
  }

  async getProduct(
    tenantId: string,
    id: string,
  ): Promise<Product | null> {
    return productService.getProduct(
      tenantId,
      id,
    );
  }

  async createProduct(
    input: CreateProductInput,
  ): Promise<Product> {
    return productService.createProduct(
      input,
    );
  }

  async updateProduct(
    tenantId: string,
    id: string,
    input: UpdateProductInput,
  ): Promise<Product> {
    return productService.updateProduct(
      tenantId,
      id,
      input,
    );
  }

  async deleteProduct(
    tenantId: string,
    id: string,
  ): Promise<void> {
    return productService.deleteProduct(
      tenantId,
      id,
    );
  }

  async searchProducts(
    tenantId: string,
    keyword: string,
  ): Promise<Product[]> {
    return productService.searchProducts(
      tenantId,
      keyword,
    );
  }

  async getInventoryValue(
    tenantId: string,
  ): Promise<number> {
    const result =
      await this.getProducts(
        tenantId,
      );

    return result.data.reduce(
      (
        total: number,
        product: Product,
      ) =>
        total +
        Number(
          product.pricing.costPrice,
        ),
      0,
    );
  }

  async getLowStockCount(
    tenantId: string,
  ): Promise<number> {
    const result =
      await this.getProducts(
        tenantId,
      );

    return result.data.filter(
      (
        product: Product,
      ) =>
        Number(
          product.inventory.stockQuantity,
        ) <= 5,
    ).length;
  }
}

export const productEngine =
  new ProductEngine();