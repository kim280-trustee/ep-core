/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Service
 * ============================================================
 */

import {
  productRepository,
} from "../repositories";

import {
  createProductSchema,
} from "../validation/product.schema";

import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
} from "../types/product.types";

import {
  ProductStatus,
  ProductType,
} from "../types/product.types";

class ProductService {

  getProducts(): Product[] {

    return productRepository.findAll();

  }

  getProductById(
    id: string,
  ): Product | undefined {

    return productRepository.findById(id);

  }

  getActiveProducts(): Product[] {

    return this.getProducts().filter(
      product =>
        product.status === ProductStatus.ACTIVE,
    );

  }

  getInactiveProducts(): Product[] {

    return this.getProducts().filter(
      product =>
        product.status === ProductStatus.INACTIVE,
    );

  }

  getProductStats() {

    const products = this.getProducts();

    return {

      total: products.length,

      active: products.filter(
        p => p.status === ProductStatus.ACTIVE,
      ).length,

      inactive: products.filter(
        p => p.status === ProductStatus.INACTIVE,
      ).length,

    };

  }

  createProduct(
    tenantId: string,
    storeId: string,
    input: CreateProductDto,
  ): Product {

    const validated =
      createProductSchema.parse(input);

    return productRepository.create(

      tenantId,

      storeId,

      {

        name: validated.name,

        description:
          validated.description ?? null,

        type:
          validated.type ?? ProductType.PRODUCT,

        identifiers: {

          sku:
            validated.identifiers.sku,

          barcode:
            validated.identifiers.barcode ?? null,

        },

        pricing:
          validated.pricing,

        tax:
          validated.tax ?? {

            taxId: null,

            taxRate: 0,

          },

        inventory:
          validated.inventory ?? {

            trackInventory: false,

            stockQuantity: 0,

          },

        categoryId:
          validated.categoryId ?? null,

        brandId:
          validated.brandId ?? null,

        unitId:
          validated.unitId ?? null,

        imageUrl:
          validated.imageUrl ?? null,

      },

    );

  }

  updateProduct(
    id: string,
    updates: UpdateProductDto,
  ): Product | undefined {

    return productRepository.update(
      id,
      updates,
    );

  }

  toggleStatus(
    product: Product,
  ): Product {

    return {

      ...product,

      status:
        product.status === ProductStatus.ACTIVE
          ? ProductStatus.INACTIVE
          : ProductStatus.ACTIVE,

      updatedAt:
        new Date().toISOString(),

    };

  }

  duplicateProduct(
    product: Product,
  ): Product {

    return {

      ...product,

      id:
        crypto.randomUUID(),

      name:
        `${product.name} Copy`,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),

    };

  }

  deleteProduct(
    id: string,
  ): boolean {

    return productRepository.delete(id);

  }

}

export const productService =
  new ProductService();