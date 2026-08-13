/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Categories Store
 * ============================================================
 */

import {
  create,
} from "zustand";

import {
  categoryService,
} from "../services/category.service";

import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../types/category.types";

interface CategoriesStore {
  categories: Category[];

  search: string;

  loadCategories: (
    tenantId: string,
  ) => void;

  createCategory: (
    input: CreateCategoryDto,
    tenantId: string,
    storeId: string,
  ) => void;

  updateCategory: (
    tenantId: string,
    id: string,
    updates: UpdateCategoryDto,
  ) => void;

  deleteCategory: (
    tenantId: string,
    id: string,
  ) => void;

  setSearch: (
    value: string,
  ) => void;
}

export const useCategoriesStore =
  create<CategoriesStore>(
    (set) => ({

      categories: [],

      search: "",

      loadCategories(
        tenantId,
      ) {
        set({
          categories:
            categoryService.getCategories(
              tenantId,
            ),
        });
      },

      createCategory(
        input,
        tenantId,
        storeId,
      ) {

        categoryService.createCategory(
          input,
          tenantId,
          storeId,
        );

        set({
          categories:
            categoryService.getCategories(
              tenantId,
            ),
        });
      },

      updateCategory(
        tenantId,
        id,
        updates,
      ) {

        categoryService.updateCategory(
          tenantId,
          id,
          updates,
        );

        set({
          categories:
            categoryService.getCategories(
              tenantId,
            ),
        });
      },

      deleteCategory(
        tenantId,
        id,
      ) {

        categoryService.deleteCategory(
          tenantId,
          id,
        );

        set({
          categories:
            categoryService.getCategories(
              tenantId,
            ),
        });
      },

      setSearch(value) {
        set({
          search: value,
        });
      },

    }),
  );