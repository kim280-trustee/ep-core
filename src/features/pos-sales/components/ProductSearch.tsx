import {
  useState,
} from "react";


import type {
  Product,
} from "../../products/types/product.types";


import {
  usePosSalesStore,
} from "../store/pos-sales.store";


interface ProductSearchProps {

  products: Product[];

}



export function ProductSearch({
  products,
}: ProductSearchProps) {


  const [
    search,
    setSearch,
  ] = useState("");



  const addItem =
    usePosSalesStore(
      (state) =>
        state.addItem,
    );



  const filteredProducts =

    products.filter(

      (product) =>

        product.name

          .toLowerCase()

          .includes(

            search.toLowerCase(),

          ),

    );



  function handleAddProduct(
    product: Product,
  ) {


    const price =
      product.pricing.sellingPrice;



    addItem({

      id:
        crypto.randomUUID(),


      saleId:
        "TEMP-CART",


      productId:
        product.id,


      quantity:
        1,


      unitPrice:
        price,


      taxRate:
        product.tax.taxRate ?? 0,


      lineTotal:
        price,


    });


  }



  return (

    <div>


      <input

        className="w-full rounded border p-2"

        placeholder="Search product..."

        value={search}

        onChange={(event) =>

          setSearch(

            event.target.value,

          )

        }

      />



      <div className="mt-4 space-y-2">


        {filteredProducts.map(

          (product) => (


            <button

              key={product.id}

              className="w-full rounded border p-3 text-left"

              onClick={() =>

                handleAddProduct(product)

              }

            >

              <div className="font-medium">

                {product.name}

              </div>


              <div className="text-sm text-gray-600">

                {product.pricing.sellingPrice}

                {" "}

                {product.pricing.currency}

              </div>


            </button>


          ),

        )}


      </div>


    </div>

  );

}