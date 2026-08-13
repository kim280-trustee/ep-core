/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Categories Module
 *
 * Category Repository Contract
 * ============================================================
 */

import type {
  Category,
} from "../types/category.types";

export interface ICategoryRepository {

  findAll(
    tenantId: string,
  ): Category[];

  findById(
    tenantId: string,
    id: string,
  ): Category | undefined;

  create(
    category: Category,
  ): Category;

  update(
    tenantId: string,
    id: string,
    updates: Partial<Category>,
  ): Category | undefined;

  delete(
    tenantId: string,
    id: string,
  ): boolean;

}