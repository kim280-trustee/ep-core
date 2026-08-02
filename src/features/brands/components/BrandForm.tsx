/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Brand Form
 * ============================================================
 */


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


  defaultValues?:Partial<BrandFormInput>;



  onSubmit:

    (

      data:BrandFormInput,

    )=>void;


}








export function BrandForm({

  defaultValues,

  onSubmit,

}:BrandFormProps){





  const {

    register,

    handleSubmit,

    formState:{errors},

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


      className="space-y-4"

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

          errors.name &&

          <p className="text-red-600">

            {errors.name.message}

          </p>

        }


      </div>







      <input


        {...register("code")}


        placeholder="Brand code"



        className="

        border

        rounded

        p-2

        w-full

        "


      />







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







      <input


        {...register("logoUrl")}



        placeholder="Logo URL"



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

        px-4

        py-2

        rounded

        "


      >


        Save Brand


      </button>





    </form>


  );


}