import type {
  Product,
} from "../types/product.types";

import type {
  ProductRepository,
} from "./product.repository";

export class InMemoryProductRepository
  implements ProductRepository {

  private readonly products = new Map<
    string,
    Product
  >();

  findAll(): Product[] {
    return Array.from(
      this.products.values(),
    );
  }

  findById(
    id: string,
  ): Product | undefined {
    return this.products.get(id);
  }

  findBySku(
    sku: string,
  ): Product | undefined {

    return this.findAll().find(
      (product) =>
        product.identifiers.sku === sku,
    );

  }

  findByBarcode(
    barcode: string,
  ): Product | undefined {

    return this.findAll().find(
      (product) =>
        product.identifiers.barcode ===
        barcode,
    );

  }

  existsBySku(
    sku: string,
  ): boolean {

    return this.findBySku(sku) !== undefined;

  }

  existsByBarcode(
    barcode: string,
  ): boolean {

    return (
      this.findByBarcode(barcode) !==
      undefined
    );

  }

  create(
    product: Product,
  ): Product {

    this.products.set(
      product.id,
      product,
    );

    return product;

  }

  update(
    id: string,
    updates: Partial<Product>,
  ): Product | undefined {

    const existing =
      this.products.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: Product = {

      ...existing,

      ...updates,

      updatedAt:
        new Date().toISOString(),

    };

    this.products.set(
      id,
      updated,
    );

    return updated;

  }

  delete(
    id: string,
  ): boolean {

    return this.products.delete(id);

  }

}