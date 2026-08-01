/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Categories Module
 * ------------------------------------------------------------
 * Repository Provider
 * ============================================================
 */

import {
  inMemoryCategoryRepository,
} from "./in-memory.category.repository";


export const categoryRepository =
  inMemoryCategoryRepository;