import {
  useEffect,
  useState,
} from "react";

import {
  ProductSearch,
} from "../components/ProductSearch";

import {
  Cart,
} from "../components/Cart";

import {
  CheckoutPanel,
} from "../components/CheckoutPanel";

import {
  productService,
} from "../../products/services/product.service";

import type {
  Product,
} from "../../products/types/product.types";


export function PosSalesPage() {


  const [products, setProducts] =
    useState<Product[]>([]);


  useEffect(() => {

    async function loadProducts() {

      const result =
        await productService.getProducts(
          "",
        );

      setProducts(
  result.data,
);

    }


    loadProducts();

  }, []);



  return (

    <div className="p-6">


      <h1 className="text-2xl font-semibold">
        POS Sales
      </h1>



      <div className="mt-6 grid grid-cols-2 gap-6">


        <div className="rounded border p-4">


          <h2 className="mb-4 font-medium">
            Products
          </h2>



          <ProductSearch
            products={products}
          />


        </div>




        <div className="rounded border p-4">


          <Cart />


        </div>


      </div>




      <div className="mt-6">


        <CheckoutPanel />


      </div>


    </div>

  );

}