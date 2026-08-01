/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Category Form
 * ============================================================
 */


import {

  useForm,

} from "react-hook-form";



import {

  zodResolver,

} from "@hookform/resolvers/zod";



import {

  categorySchema,

} from "../validators/category.schema";



import type {

  CategoryFormInput,

} from "../validators/category.schema";







interface CategoryFormProps {


  defaultValues?: Partial<CategoryFormInput>;



  onSubmit:

    (

      data:CategoryFormInput,

    )=>void;


}









export function CategoryForm({


  defaultValues,


  onSubmit,


}:CategoryFormProps){





  const {


    register,


    handleSubmit,


    formState:{errors},


  } = useForm<CategoryFormInput>({



    resolver:


      zodResolver(

        categorySchema,

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



          placeholder="Category name"



          className="

          border

          rounded

          p-2

          w-full

          "


        />




        {

          errors.name && (


            <p

              className="text-red-600"

            >

              {

                errors.name.message

              }


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


        type="submit"


        className="

        bg-black

        text-white

        px-4

        py-2

        rounded

        "


      >


        Save Category



      </button>






    </form>



  );


}