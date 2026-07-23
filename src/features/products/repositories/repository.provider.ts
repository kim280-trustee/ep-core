import { InMemoryProductRepository } from "./in-memory-product.repository";
import type { ProductRepository } from "./product.repository";

export const productRepository: ProductRepository =
  new InMemoryProductRepository();
  