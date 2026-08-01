/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Filters
 * ============================================================
 */


import {
  ProductStatus,
} from "../types/product.types";




interface ProductFiltersProps {


  status:

    ProductStatus | "ALL";



  onChange:

    (

      value: ProductStatus | "ALL",

    ) => void;


}







export function ProductFilters({

  status,

  onChange,

}: ProductFiltersProps){



  return (


    <select


      value={status}



      onChange={

        (event)=>

          onChange(

            event.target.value as ProductStatus | "ALL",

          )

      }



      className="
      border
      rounded
      px-3
      py-2
      "


    >



      <option value="ALL">

        All Products

      </option>




      <option value={ProductStatus.ACTIVE}>

        Active

      </option>




      <option value={ProductStatus.INACTIVE}>

        Inactive

      </option>




    </select>


  );


}