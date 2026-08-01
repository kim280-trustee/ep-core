/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Toolbar
 * ============================================================
 */


import {
  ProductFilters,
} from "./ProductFilters";


import {
  ProductSearch,
} from "./ProductSearch";


import {
  ProductStatus,
} from "../types/product.types";




interface ProductToolbarProps {


  search: string;


  onSearchChange: (

    value:string,

  )=>void;



  status:

    ProductStatus | "ALL";



  onStatusChange:

    (

      value: ProductStatus | "ALL",

    )=>void;


}





export function ProductToolbar({

  search,

  onSearchChange,

  status,

  onStatusChange,

}:ProductToolbarProps){



  return (


    <div

      className="
      flex
      gap-4
      "

    >



      <ProductSearch

        value={search}

        onChange={onSearchChange}

      />





      <ProductFilters

        status={status}

        onChange={onStatusChange}

      />



    </div>


  );


}