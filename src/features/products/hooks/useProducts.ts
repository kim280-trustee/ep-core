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





  return {


    products,


    loadProducts,


    addProduct,


    updateProduct,


    deleteProduct,


  };


}