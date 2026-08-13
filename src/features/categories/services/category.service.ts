/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Categories Module
 *
 * Category Business Service
 * ============================================================
 */

import {
  categoryRepository,
} from "../repositories";

import {
  categorySchema,
} from "../validators/category.schema";

import {
  CategoryStatus,
} from "../types/category.types";

import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../types/category.types";

class CategoryService {

  private generateId(): string {
    return crypto.randomUUID();
  }

  getCategories(
    tenantId: string,
  ): Category[] {
    return categoryRepository.findAll(
      tenantId,
    );
  }

  getCategoryById(
    tenantId: string,
    id: string,
  ): Category | undefined {
    return categoryRepository.findById(
      tenantId,
      id,
    );
  }

  createCategory(
    input: CreateCategoryDto,
    tenantId: string,
    storeId: string,
  ): Category {

    if (!tenantId) {
      throw new Error(
        "Tenant ID is required.",
      );
    }

    if (!storeId) {
      throw new Error(
        "Store ID is required.",
      );
    }

    const validated =
      categorySchema.parse(input);

    const categories =
      categoryRepository.findAll(
        tenantId,
      );

    const duplicate =
      categories.find(
        (category) =>
          category.storeId === storeId &&
          category.name
            .trim()
            .toLowerCase() ===
            validated.name
              .trim()
              .toLowerCase(),
      );

    if (duplicate) {
      throw new Error(
        "Category with this name already exists.",
      );
    }

    const now =
      new Date().toISOString();

    const category: Category = {
      id: this.generateId(),
      tenantId,
      storeId,
      name: validated.name.trim(),
      description:
        validated.description?.trim() ??
        null,
      parentId:
        validated.parentId ?? null,
      status:
        CategoryStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };

    return categoryRepository.create(
      category,
    );
  }

  updateCategory(
    tenantId: string,
    id: string,
    updates: UpdateCategoryDto,
  ): Category | undefined {

    if (!tenantId) {
      throw new Error(
        "Tenant ID is required.",
      );
    }

    const existing =
      categoryRepository.findById(
        tenantId,
        id,
      );

    if (!existing) {
      return undefined;
    }

    let validatedName:
      string | undefined;

    if (updates.name !== undefined) {
      validatedName =
        categorySchema.parse({
          name: updates.name,
        }).name;
    }

    if (validatedName !== undefined) {

      const duplicate =
        categoryRepository
          .findAll(tenantId)
          .find(
            (category) =>
              category.id !== id &&
              category.storeId ===
                existing.storeId &&
              category.name
                .trim()
                .toLowerCase() ===
                validatedName!
                  .trim()
                  .toLowerCase(),
          );

      if (duplicate) {
        throw new Error(
          "Category with this name already exists.",
        );
      }
    }

    return categoryRepository.update(
      tenantId,
      id,
      {
        ...updates,
        ...(validatedName !== undefined
          ? {
              name: validatedName,
            }
          : {}),
        updatedAt:
          new Date().toISOString(),
      },
    );
  }

  deleteCategory(
    tenantId: string,
    id: string,
  ): boolean {

    if (!tenantId) {
      throw new Error(
        "Tenant ID is required.",
      );
    }

    return categoryRepository.delete(
      tenantId,
      id,
    );
  }
}

export const categoryService =
  new CategoryService();