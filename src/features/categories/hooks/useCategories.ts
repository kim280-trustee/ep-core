/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Categories Hook
 * ============================================================
 */

import {
  useCategoriesStore,
} from "../store/categories.store";

export function useCategories() {

  const categories =
    useCategoriesStore(
      (state) =>
        state.categories,
    );

  const search =
    useCategoriesStore(
      (state) =>
        state.search,
    );

  const loadCategories =
    useCategoriesStore(
      (state) =>
        state.loadCategories,
    );

  const createCategory =
    useCategoriesStore(
      (state) =>
        state.createCategory,
    );

  const updateCategory =
    useCategoriesStore(
      (state) =>
        state.updateCategory,
    );

  const deleteCategory =
    useCategoriesStore(
      (state) =>
        state.deleteCategory,
    );

  const setSearch =
    useCategoriesStore(
      (state) =>
        state.setSearch,
    );

  return {
    categories,
    search,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    setSearch,
  };
}