import {
  useEffect,
} from "react";


import {
  useProductStore,
} from "../stores/product.store";



export function useProducts() {


  const {
    products,
    loadProducts,
    addProduct,
    updateProduct,
    removeProduct,

  } = useProductStore();



  useEffect(() => {

    loadProducts();

  }, [loadProducts]);



  return {

    products,

    addProduct,

    updateProduct,

    removeProduct,

  };

}