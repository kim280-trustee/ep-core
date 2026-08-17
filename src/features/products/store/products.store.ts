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

import {
  productService,
} from "../services/product.service";

import {
  storeContext,
} from "@/core/store/store.context";


interface ProductStore {

  products: Product[];

  filters: ProductFilters;

  loading: boolean;

  error: string | null;

  setProducts(
    products: Product[],
  ): void;

  loadProducts(
    products?: Product[],
  ): Promise<void>;

  setFilters(
    filters: ProductFilters,
  ): void;

  updateFilters(
    filters: Partial<ProductFilters>,
  ): void;

  clearFilters(): void;

}


export const useProductStore =
  create<ProductStore>((set) => ({

    products: [],

    filters: {},

    loading: false,

    error: null,


    setProducts(
      products,
    ) {

      set({

        products,

        error: null,

      });

    },


    async loadProducts(
      products,
    ) {

      if (products) {

        set({

          products,

          loading: false,

          error: null,

        });

        return;

      }


      const context =
        storeContext.getStore();


      if (!context?.tenantId) {

        set({

          products: [],

          loading: false,

          error:
            "Tenant context is not initialized.",

        });

        return;

      }


      set({

        loading: true,

        error: null,

      });


      try {

        const filters =
          useProductStore
            .getState()
            .filters;


        const result =
          await productService.getProducts(

            context.tenantId,

            filters,

          );


        set({

          products:
            result.data,

          loading: false,

          error: null,

        });

      } catch (error) {

        console.error(
          "Failed to load products:",
          error,
        );


        set({

          products: [],

          loading: false,

          error:
            error instanceof Error
              ? error.message
              : "Unable to load products.",

        });

      }

    },


    setFilters(
      filters,
    ) {

      set({

        filters,

      });

    },


    updateFilters(
      filters,
    ) {

      set(
        (state) => ({

          filters: {

            ...state.filters,

            ...filters,

          },

        }),
      );

    },


    clearFilters() {

      set({

        filters: {},

      });

    },

  }));


export const useProductsStore =
  useProductStore;