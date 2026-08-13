/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Edit Product Page
 * ============================================================
 */

import {
  useParams,
} from "react-router-dom";

import {
  ProductForm,
} from "../components/ProductForm";


export function EditProductPage() {

  const {
    id,
  } = useParams();


  const handleSubmit = (
    values: any,
  ) => {

    console.log(
      "Update product:",
      id,
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
        Edit Product
      </h1>


      <ProductForm

        defaultValues={{
          name: "",
          sku: "",
          currency: "THB",
        }}

        onSubmit={
          handleSubmit
        }

      />


    </div>

  );

}