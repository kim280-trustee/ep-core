import {
  Link,
} from "react-router-dom";


import type {
  Product,
} from "../types/product.types";


interface ProductTableProps {

  products: Product[];

  onDelete: (
    id: string,
  ) => void;

}



export function ProductTable({

  products,

  onDelete,

}: ProductTableProps) {


  if (products.length === 0) {

    return (

      <div
        className="
          border
          rounded
          p-8
          text-center
        "
      >

        No products found.

      </div>

    );

  }



  return (

    <div
      className="
        overflow-x-auto
      "
    >

      <table
        className="
          w-full
          border-collapse
        "
      >

        <thead>

          <tr
            className="
              border-b
            "
          >

            <th className="text-left p-3">
              Name
            </th>


            <th className="text-left p-3">
              SKU
            </th>


            <th className="text-left p-3">
              Price
            </th>


            <th className="text-left p-3">
              Status
            </th>


            <th className="text-left p-3">
              Actions
            </th>

          </tr>

        </thead>


        <tbody>

          {products.map(
            (product) => (

              <tr
                key={product.id}
                className="
                  border-b
                "
              >

                <td className="p-3">
                  {product.name}
                </td>


                <td className="p-3">
                  {product.identifiers.sku}
                </td>


                <td className="p-3">

                  {product.pricing.currency}

                  {" "}

                  {product.pricing.sellingPrice}

                </td>


                <td className="p-3">

                  {product.status}

                </td>


                <td
                  className="
                    p-3
                    flex
                    gap-3
                  "
                >

                  <Link

                    to={`/products/edit/${product.id}`}

                    className="
                      underline
                    "

                  >

                    Edit

                  </Link>



                  <button

                    onClick={() =>
                      onDelete(product.id)
                    }

                    className="
                      text-red-600
                    "

                  >

                    Delete

                  </button>


                </td>


              </tr>

            ),

          )}

        </tbody>


      </table>


    </div>

  );

}