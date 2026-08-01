/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Brands Page
 * ============================================================
 */


import {

  useEffect,

} from "react";



import {

  BrandToolbar,

} from "../components/BrandToolbar";



import {

  BrandTable,

} from "../components/BrandTable";



import {

  useBrands,

} from "../hooks/useBrands";







export function BrandsPage(){





  const {


    brands,


    search,


    setSearch,


    loadBrands,


    deleteBrand,



  } = useBrands();








  useEffect(()=>{


    loadBrands();


  },[

    loadBrands,

  ]);









  const filteredBrands =


    brands.filter(


      brand =>


        brand.name


          .toLowerCase()


          .includes(


            search.toLowerCase(),


          ),


    );









  return (




    <div

      className="p-6"

    >





      <h1

        className="

        text-2xl

        font-bold

        mb-6

        "

      >


        Brands



      </h1>







      <BrandToolbar



        search={search}



        onSearchChange={setSearch}



      />








      <BrandTable



        brands={filteredBrands}



        onDelete={deleteBrand}



      />






    </div>



  );



}