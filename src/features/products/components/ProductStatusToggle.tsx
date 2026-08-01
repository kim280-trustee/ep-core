/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Status Toggle
 * ============================================================
 */


import {

ProductStatus,

} from "../types/product.types";





interface ProductStatusToggleProps {


  status: ProductStatus;


  onChange:(

    status:ProductStatus,

  )=>void;


}






export function ProductStatusToggle({

  status,

  onChange,

}:ProductStatusToggleProps){



  const nextStatus =

    status === ProductStatus.ACTIVE

      ? ProductStatus.INACTIVE

      : ProductStatus.ACTIVE;





  return (


    <button


      onClick={()=>onChange(nextStatus)}



      className="
      border
      rounded
      px-3
      py-2
      "


    >


      {

        status === ProductStatus.ACTIVE

        ? "Deactivate"

        : "Activate"

      }



    </button>


  );


}