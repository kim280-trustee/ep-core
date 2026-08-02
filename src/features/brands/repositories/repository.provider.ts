/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Brands Repository Provider
 * ============================================================
 */


import {

  InMemoryBrandRepository,

} from "./in-memory-brand.repository";



import type {

  IBrandRepository,

} from "./brand.repository";





export const brandRepository:

  IBrandRepository =

    new InMemoryBrandRepository();