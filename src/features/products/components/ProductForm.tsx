import {
  useForm,
} from "react-hook-form";


import {
  zodResolver,
} from "@hookform/resolvers/zod";


import {
  productSchema,
} from "../validators/product.schema";


import type {
  ProductFormInput,
} from "../validators/product.schema";



interface ProductFormProps {

  defaultValues?: Partial<ProductFormInput>;

  onSubmit: (
    data: ProductFormInput,
  ) => void;

}



export function ProductForm({

  defaultValues,

  onSubmit,

}: ProductFormProps) {



  const {
    register,
    handleSubmit,
    formState: {
      errors,
    },

  } = useForm<ProductFormInput>({

    resolver:
      zodResolver(productSchema),

    defaultValues,

  });



  return (

    <form

      onSubmit={
        handleSubmit(onSubmit)
      }

      className="
        space-y-4
        max-w-xl
      "

    >

      <div>

        <input

          {...register("name")}

          placeholder="Product name"

          className="
            border
            rounded
            p-2
            w-full
          "

        />


        {errors.name && (

          <p className="text-red-600">

            {errors.name.message}

          </p>

        )}

      </div>



      <input

        {...register("sku")}

        placeholder="SKU"

        className="
          border
          rounded
          p-2
          w-full
        "

      />



      <input

        type="number"

        {...register(
          "sellingPrice",
          {
            valueAsNumber: true,
          },
        )}

        placeholder="Selling price"

        className="
          border
          rounded
          p-2
          w-full
        "

      />



      <input

        type="number"

        {...register(
          "stockQuantity",
          {
            valueAsNumber: true,
          },
        )}

        placeholder="Stock quantity"

        className="
          border
          rounded
          p-2
          w-full
        "

      />



      <button

        type="submit"

        className="
          bg-black
          text-white
          px-5
          py-2
          rounded
        "

      >

        Save Product

      </button>


    </form>

  );

}