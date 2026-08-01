/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Product Details Page
 * ============================================================
 */


import {
  useParams,
} from "react-router-dom";


import {
  ProductCard,
} from "../components/ProductCard";


import {
  useProductsStore,
} from "../store/products.store";







export function ProductDetailsPage(){



  const {

    id,

  } = useParams();





  const products =

    useProductsStore(

      (state)=>

        state.products,

    );







  const product =

    products.find(

      (item)=>

        item.id === id,

    );







  if(!product){


    return (


      <div

        className="
        p-6
        "

      >

        Product not found


      </div>


    );


  }







  return (



    <div

      className="
      flex
      flex-col
      gap-6
      "

    >



      <h1

        className="
        text-2xl
        font-semibold
        "

      >

        Product Details


      </h1>






      <ProductCard

        product={product}

      />





    </div>


  );


}