/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Products Module
 * ------------------------------------------------------------
 * Products Hook
 * ============================================================
 */


import {
  useProductsStore,
} from "../store/products.store";





export function useProducts(){


  const products =

    useProductsStore(

      (state) =>

        state.products,

    );





  const search =

    useProductsStore(

      (state) =>

        state.search,

    );





  const statusFilter =

    useProductsStore(

      (state) =>

        state.statusFilter,

    );





  const loadProducts =

    useProductsStore(

      (state) =>

        state.loadProducts,

    );





  const addProduct =

    useProductsStore(

      (state) =>

        state.addProduct,

    );





  const updateProduct =

    useProductsStore(

      (state) =>

        state.updateProduct,

    );





  const deleteProduct =

    useProductsStore(

      (state) =>

        state.deleteProduct,

    );





  const duplicateProduct =

    useProductsStore(

      (state) =>

        state.duplicateProduct,

    );





  const setSearch =

    useProductsStore(

      (state) =>

        state.setSearch,

    );





  const setStatusFilter =

    useProductsStore(

      (state) =>

        state.setStatusFilter,

    );







  return {


    products,


    search,


    statusFilter,



    loadProducts,


    addProduct,


    updateProduct,


    deleteProduct,


    duplicateProduct,



    setSearch,


    setStatusFilter,



  };


}