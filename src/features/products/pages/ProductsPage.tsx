/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Products Page
 * ============================================================
 */


import {
  useEffect,
} from "react";


import {
  ProductTable,
} from "../components/ProductTable";


import {
  ProductSearch,
} from "../components/ProductSearch";


import {
  ProductFilters,
} from "../components/ProductFilters";


import {
  ProductStats,
} from "../components/ProductStats";


import {
  useProductsStore,
} from "../store/products.store";





export function ProductsPage(){



  const loadProducts =

    useProductsStore(

      (state)=>

        state.loadProducts,

    );





  const search =

    useProductsStore(

      (state)=>

        state.search,

    );





  const setSearch =

    useProductsStore(

      (state)=>

        state.setSearch,

    );






  const statusFilter =

    useProductsStore(

      (state)=>

        state.statusFilter,

    );






  const setStatusFilter =

    useProductsStore(

      (state)=>

        state.setStatusFilter,

    );








  useEffect(()=>{


    loadProducts();



  },[loadProducts]);







  return (


    <div

      className="
      flex
      flex-col
      gap-6
      "

    >




      <h1

        className="
        text-2xl
        font-semibold
        "

      >

        Products


      </h1>







      <ProductStats />







      <div

        className="
        flex
        gap-4
        "

      >



        <ProductSearch

          value={search}

          onChange={setSearch}

        />






        <ProductFilters

          status={statusFilter}

          onChange={setStatusFilter}

        />



      </div>








      <ProductTable />





    </div>


  );


}