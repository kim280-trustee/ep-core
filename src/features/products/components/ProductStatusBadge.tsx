/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Status Badge
 * ============================================================
 */


import {
  ProductStatus,
} from "../types/product.types";



interface ProductStatusBadgeProps {

  status: ProductStatus;

}



export function ProductStatusBadge({

  status,

}:ProductStatusBadgeProps){



  return (


    <span

      className={`
      px-3
      py-1
      rounded-full
      text-sm
      ${
        status === ProductStatus.ACTIVE

        ? "bg-green-100 text-green-700"

        : "bg-gray-100 text-gray-700"
      }
      `}

    >


      {status}


    </span>


  );


}