import { create } from "zustand";

import { categoryService } from "../services/category.service";

import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../types/category.types";

interface CategoriesStore {
  categories: Category[];
  search: string;

  loadCategories(
    tenantId: string,
    storeId: string
  ): Promise<void>;

  createCategory(
    input: CreateCategoryDto,
    tenantId: string,
    storeId: string
  ): Promise<void>;

  updateCategory(
    tenantId: string,
    storeId: string,
    id: string,
    updates: UpdateCategoryDto
  ): Promise<void>;

  deleteCategory(
    tenantId: string,
    storeId: string,
    id: string
  ): Promise<void>;

  setSearch(value: string): void;
}

export const useCategoriesStore =
  create<CategoriesStore>((set) => ({

    categories: [],

    search: "",

    async loadCategories(tenantId, storeId) {
      const categories =
        await categoryService.getCategories(
          tenantId,
          storeId
        );

      set({ categories });
    },

    async createCategory(input, tenantId, storeId) {
      await categoryService.createCategory(
        input,
        tenantId,
        storeId
      );

      const categories =
        await categoryService.getCategories(
          tenantId,
          storeId
        );

      set({ categories });
    },

    async updateCategory(
      tenantId,
      storeId,
      id,
      updates
    ) {
      await categoryService.updateCategory(
        tenantId,
        storeId,
        id,
        updates
      );

      const categories =
        await categoryService.getCategories(
          tenantId,
          storeId
        );

      set({ categories });
    },

    async deleteCategory(
      tenantId,
      storeId,
      id
    ) {
      await categoryService.deleteCategory(
        tenantId,
        storeId,
        id
      );

      const categories =
        await categoryService.getCategories(
          tenantId,
          storeId
        );

      set({ categories });
    },

    setSearch(value) {
      set({ search: value });
    },

  }));
