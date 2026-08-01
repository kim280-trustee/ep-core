/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Card
 * ============================================================
 */


import type {
  Product,
} from "../types/product.types";


import {
  ProductStatusBadge,
} from "./ProductStatusBadge";




interface ProductCardProps {


  product: Product;


}




export function ProductCard({

  product,

}:ProductCardProps){



  return (


    <div

      className="
      border
      rounded
      p-5
      flex
      flex-col
      gap-3
      "

    >



      <h2

        className="
        text-lg
        font-semibold
        "

      >

        {product.name}


      </h2>





      <p>

        SKU:

        {" "}

        {product.identifiers.sku}

      </p>





      <p>

        Price:

        {" "}

        {product.pricing.sellingPrice}

        {" "}

        {product.pricing.currency}

      </p>





      <p>

        Stock:

        {" "}

        {product.inventory.stockQuantity}

      </p>





      <ProductStatusBadge

        status={product.status}

      />



    </div>


  );


}