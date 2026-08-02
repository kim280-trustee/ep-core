/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Table
 * ============================================================
 */


import {
  useNavigate,
} from "react-router-dom";


import {
  useProductsStore,
} from "../store/products.store";


import {
  ProductStatusBadge,
} from "./ProductStatusBadge";


import {
  ProductStatusToggle,
} from "./ProductStatusToggle";


import {
  ProductDuplicateButton,
} from "./ProductDuplicateButton";



type Product = ReturnType<
  typeof useProductsStore.getState
>["products"][number];





export function ProductTable(){



  const navigate =

    useNavigate();





  const products =

    useProductsStore(

      (state)=>

        state.products,

    );





  const search =

    useProductsStore(

      (state)=>

        state.search,

    );





  const statusFilter =

    useProductsStore(

      (state)=>

        state.statusFilter,

    );





  const deleteProduct =

    useProductsStore(

      (state)=>

        state.deleteProduct,

    );





  const updateProduct =

    useProductsStore(

      (state)=>

        state.updateProduct,

    );







  const filteredProducts =

    products.filter((product)=>{



      const searchMatch =

        product.name

        .toLowerCase()

        .includes(

          search.toLowerCase(),

        );





      const statusMatch =

        statusFilter === "ALL"

        ||

        product.status === statusFilter;





      return (

        searchMatch && statusMatch

      );



    });







  function duplicateProduct(

    product: Product,

  ){



    const copy = {


      ...product,


      id:

        crypto.randomUUID(),


      name:

        `${product.name} Copy`,


      createdAt:

        new Date().toISOString(),


      updatedAt:

        new Date().toISOString(),



    };





    updateProduct(copy);



  }







  if(filteredProducts.length===0){


    return (


      <div

        className="
        border
        rounded
        p-6
        text-center
        "

      >

        No products found


      </div>


    );


  }








  return (


    <div

      className="
      border
      rounded
      overflow-hidden
      "

    >



      <table

        className="
        w-full
        "

      >



        <thead>


          <tr

            className="
            border-b
            bg-gray-100
            "

          >


            <th className="p-3 text-left">

              Name

            </th>


            <th className="p-3 text-left">

              SKU

            </th>


            <th className="p-3 text-left">

              Price

            </th>


            <th className="p-3 text-left">

              Stock

            </th>


            <th className="p-3 text-left">

              Status

            </th>


            <th className="p-3 text-left">

              Actions

            </th>


          </tr>


        </thead>







        <tbody>


        {

          filteredProducts.map((product)=>(



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

                {product.pricing.sellingPrice}

                {" "}

                {product.pricing.currency}

              </td>





              <td className="p-3">

                {product.inventory.stockQuantity}

              </td>





              <td className="p-3">

                <ProductStatusBadge

                  status={product.status}

                />


              </td>






              <td

                className="
                p-3
                flex
                gap-3
                "

              >



                <button

                  onClick={()=>


                    navigate(

                      `/products/${product.id}`

                    )


                  }


                  className="
                  text-blue-600
                  "

                >

                  View


                </button>







                <ProductDuplicateButton

                  onDuplicate={()=>


                    duplicateProduct(product)


                  }

                />







                <ProductStatusToggle


                  status={product.status}



                  onChange={(status)=>


                    updateProduct({


                      ...product,


                      status,


                      updatedAt:

                        new Date().toISOString(),


                    })


                  }


                />







                <button

                  onClick={()=>


                    deleteProduct(

                      product.id,

                    )


                  }


                  className="
                  text-red-600
                  "

                >

                  Delete


                </button>




              </td>




            </tr>



          ))


        }


        </tbody>



      </table>



    </div>


  );


}