import {
  useForm,
} from "react-hook-form";


import {
  zodResolver,
} from "@hookform/resolvers/zod";


import {
  brandSchema,
} from "../validators/brand.schema";


import type {
  BrandFormInput,
} from "../validators/brand.schema";



interface BrandFormProps {

  defaultValues?: Partial<BrandFormInput>;

  onSubmit(
    data: BrandFormInput,
  ): void;

}



export function BrandForm({

  defaultValues,

  onSubmit,

}: BrandFormProps) {


  const {

    register,

    handleSubmit,

    formState:{
      errors,
      isSubmitting,
    },

  } = useForm<BrandFormInput>({

    resolver:
      zodResolver(
        brandSchema,
      ),

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

          placeholder="Brand name"

          className="
          border
          rounded
          p-2
          w-full
          "

        />


        {
          errors.name && (

            <p className="text-red-600">

              {errors.name.message}

            </p>

          )
        }


      </div>



      <textarea

        {...register("description")}

        placeholder="Description"

        className="
        border
        rounded
        p-2
        w-full
        "

      />



      <button

        disabled={isSubmitting}

        type="submit"

        className="
        bg-black
        text-white
        px-5
        py-2
        rounded
        disabled:opacity-50
        "

      >

        {
          isSubmitting
          ?
          "Saving..."
          :
          "Save Brand"
        }


      </button>



    </form>

  );

}