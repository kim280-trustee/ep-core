/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Products Store
 * ============================================================
 */

import { create } from "zustand";

import type {
  Product,
  ProductFilters,
} from "../types/product.types";


interface ProductStore {

  products: Product[];

  filters: ProductFilters;


  setProducts:
  (
    products: Product[],
  ) => void;


  loadProducts:
  (
    products?: Product[],
  ) => void;


  setFilters:
  (
    filters: ProductFilters,
  ) => void;


  updateFilters:
  (
    filters: Partial<ProductFilters>,
  ) => void;


  clearFilters:
  () => void;

}



export const useProductStore =
create<ProductStore>((set) => ({

  products: [],

  filters: {},


  setProducts:
  (
    products,
  ) =>
  set({
    products,
  }),



  loadProducts:
  (
    products = [],
  ) =>
  set({
    products,
  }),



  setFilters:
  (
    filters,
  ) =>
  set({
    filters,
  }),



  updateFilters:
  (
    filters,
  ) =>
  set(
    (state)=>({

      filters:{
        ...state.filters,
        ...filters,
      },

    }),
  ),



  clearFilters:
  () =>
  set({

    filters:{},

  }),


}));


export const useProductsStore =
useProductStore;