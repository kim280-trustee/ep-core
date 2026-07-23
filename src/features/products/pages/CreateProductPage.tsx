import {
  useNavigate,
} from "react-router-dom";


import {
  ProductForm,
} from "../components/ProductForm";


import {
  productService,
} from "../services/product.service";



export function CreateProductPage() {


  const navigate = useNavigate();



  function handleSubmit(
    data: Parameters<
      typeof productService.createProduct
    >[0],
  ) {


    productService.createProduct(

      data,

      "default-tenant",

      "default-store",

    );


    navigate("/products");

  }



  return (

    <div
      className="p-6"
    >

      <h1
        className="
          text-2xl
          font-bold
          mb-6
        "
      >

        Create Product

      </h1>



      <ProductForm

        onSubmit={handleSubmit}

      />


    </div>

  );

}