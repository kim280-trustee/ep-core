import {
  useNavigate,
  useParams,
} from "react-router-dom";


import {
  ProductForm,
} from "../components/ProductForm";


import {
  productService,
} from "../services/product.service";



export function EditProductPage() {


  const navigate = useNavigate();


  const {
    id,
  } = useParams();



  const foundProduct =
    id
      ? productService.getProductById(id)
      : undefined;



  if (!foundProduct) {

    return (

      <div
        className="p-6"
      >

        Product not found

      </div>

    );

  }



  const product = foundProduct;



  function handleSubmit(
    data: Parameters<
      typeof productService.createProduct
    >[0],
  ) {


    productService.updateProduct(

      product.id,

      {

        name: data.name,


        description:
          data.description,


        pricing: {

          ...product.pricing,


          sellingPrice:
            data.sellingPrice,


          costPrice:
            data.costPrice,

        },


        inventory: {

          ...product.inventory,


          stockQuantity:
            data.stockQuantity,

        },

      },

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

        Edit Product

      </h1>



      <ProductForm

        defaultValues={{

          name:
            product.name,


          sku:
            product.identifiers.sku,


          sellingPrice:
            product.pricing.sellingPrice,


          stockQuantity:
            product.inventory.stockQuantity,

        }}


        onSubmit={handleSubmit}

      />


    </div>

  );

}