/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Statistics
 * ============================================================
 */


import {
  ProductStatus,
} from "../types/product.types";


import {
  useProductsStore,
} from "../store/products.store";



export function ProductStats() {


  const products =
    useProductsStore(
      (state) =>
        state.products,
    );



  const total =
    products.length;



  const active =
    products.filter(
      (product) =>
        product.status === ProductStatus.ACTIVE,
    ).length;



  const inactive =
    products.filter(
      (product) =>
        product.status === ProductStatus.INACTIVE,
    ).length;



  const lowStock =
    products.filter(
      (product) =>
        product.inventory.stockQuantity <= 5,
    ).length;



  const cards = [

    {
      title:
        "Total Products",
      value:
        total,
    },


    {
      title:
        "Active",
      value:
        active,
    },


    {
      title:
        "Inactive",
      value:
        inactive,
    },


    {
      title:
        "Low Stock",
      value:
        lowStock,
    },

  ];



  return (

    <div className="grid grid-cols-4 gap-4">


      {
        cards.map(
          (card) => (

            <div

              key={card.title}

              className="border rounded p-4"

            >

              <p className="text-sm">

                {card.title}

              </p>


              <p className="text-2xl font-semibold">

                {card.value}

              </p>


            </div>

          ),
        )
      }


    </div>

  );

}