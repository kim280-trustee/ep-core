/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Repository Provider
 * ============================================================
 */


import {
  InMemoryProductRepository,
} from "./in-memory-product.repository";


import type {
  IProductRepository,
} from "./product.repository";



export const productRepository:

  IProductRepository =

    new InMemoryProductRepository();