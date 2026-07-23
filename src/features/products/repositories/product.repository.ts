import type {
  Product,
} from "../types/product.types";

export interface ProductRepository {
  findAll(): Product[];

  findById(
    id: string,
  ): Product | undefined;

  findBySku(
    sku: string,
  ): Product | undefined;

  findByBarcode(
    barcode: string,
  ): Product | undefined;

  existsBySku(
    sku: string,
  ): boolean;

  existsByBarcode(
    barcode: string,
  ): boolean;

  create(
    product: Product,
  ): Product;

  update(
    id: string,
    updates: Partial<Product>,
  ): Product | undefined;

  delete(
    id: string,
  ): boolean;
}