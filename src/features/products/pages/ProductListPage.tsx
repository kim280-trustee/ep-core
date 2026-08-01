/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Products Module
 * ------------------------------------------------------------
 * Product List Page
 * ============================================================
 */


import {
  useEffect,
} from "react";


import {
  ProductTable,
} from "../components/ProductTable";


import {
  useProducts,
} from "../hooks/useProducts";





function ProductListPage() {


  const {
    loadProducts,
  } = useProducts();




  useEffect(() => {


    loadProducts();


  }, [loadProducts]);





  return (


    <div

      className="
      flex
      flex-col
      gap-6
      "

    >



      <div>


        <h1

          className="
          text-2xl
          font-semibold
          "

        >

          Products

        </h1>



        <p

          className="
          text-gray-600
          "

        >

          Manage your products

        </p>



      </div>





      <ProductTable />



    </div>


  );


}




export {

  ProductListPage,

};