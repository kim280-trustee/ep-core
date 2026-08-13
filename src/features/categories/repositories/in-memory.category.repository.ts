/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Categories Module
 *
 * In Memory Category Repository
 * ============================================================
 */

import type {
  Category,
} from "../types/category.types";

import type {
  ICategoryRepository,
} from "./category.repository";

class InMemoryCategoryRepository
  implements ICategoryRepository
{
  private categories: Category[] = [];

  findAll(
    tenantId: string,
  ): Category[] {
    return this.categories.filter(
      (category) =>
        category.tenantId === tenantId,
    );
  }

  findById(
    tenantId: string,
    id: string,
  ): Category | undefined {
    return this.categories.find(
      (category) =>
        category.tenantId === tenantId &&
        category.id === id,
    );
  }

  create(
    category: Category,
  ): Category {
    this.categories.push(category);

    return category;
  }

  update(
    tenantId: string,
    id: string,
    updates: Partial<Category>,
  ): Category | undefined {
    const index =
      this.categories.findIndex(
        (category) =>
          category.tenantId === tenantId &&
          category.id === id,
      );

    if (index === -1) {
      return undefined;
    }

    const existing =
      this.categories[index];

    if (!existing) {
      return undefined;
    }

    const updated: Category = {
      ...existing,
      ...updates,
      id: existing.id,
      tenantId: existing.tenantId,
      storeId: existing.storeId,
      createdAt: existing.createdAt,
      updatedAt:
        new Date().toISOString(),
    };

    this.categories[index] = updated;

    return updated;
  }

  delete(
    tenantId: string,
    id: string,
  ): boolean {
    const index =
      this.categories.findIndex(
        (category) =>
          category.tenantId === tenantId &&
          category.id === id,
      );

    if (index === -1) {
      return false;
    }

    this.categories.splice(
      index,
      1,
    );

    return true;
  }
}

export const inMemoryCategoryRepository =
  new InMemoryCategoryRepository();