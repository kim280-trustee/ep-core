 /**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Create Product Page
 * ============================================================
 */


import {
  ProductForm,
} from "../components/ProductForm";

import type {
  ProductFormValues,
} from "../schemas/product.schema";




export function CreateProductPage() {


  const handleCreate =
    (
      values: ProductFormValues,
    ) => {

      console.log(
        "Create Product:",
        values,
      );

    };



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

        Create Product

      </h1>



      <ProductForm

        onSubmit={
          handleCreate
        }

      />


    </div>

  );

}