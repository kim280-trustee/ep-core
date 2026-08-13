/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Selector
 * ============================================================
 */


import {
  useEffect,
} from "react";


import {
  useProductsStore,
} from "@/features/products";




interface ProductSelectorProps {


  value?: string;


  onChange: (
    productId: string,
  ) => void;


  disabled?: boolean;


}





export function ProductSelector({

  value,

  onChange,

  disabled = false,

}: ProductSelectorProps) {



  const products =

    useProductsStore(

      (state) => state.products,

    );





  const loadProducts =

    useProductsStore(

      (state) => state.loadProducts,

    );






  useEffect(() => {


    if (

      products.length === 0

    ) {

      loadProducts();

    }


  }, [

    products.length,

    loadProducts,

  ]);







  return (



    <div

      className="
      flex
      flex-col
      gap-2
      "

    >



      <label

        className="font-medium"

      >

        Product


      </label>






      <select


        value={value ?? ""}


        disabled={disabled}


        onChange={(e) =>

          onChange(

            e.target.value,

          )

        }


        className="
        border
        rounded
        p-2
        w-full
        "


      >




        <option value="">

          -- Select Product --

        </option>






        {products.map((product) => (



          <option


            key={product.id}


            value={product.id}


          >

            {product.name}

            {" - "}

            {product.identifiers.sku}

            {" - "}

            {product.pricing.sellingPrice}

            {" "}

            {product.pricing.currency}



          </option>



        ))}





      </select>





    </div>



  );



}