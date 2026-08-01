import {
  useForm,
} from "react-hook-form";


import {
  zodResolver,
} from "@hookform/resolvers/zod";


import {
  unitSchema,
} from "../validators/unit.schema";


import type {
  UnitFormInput,
} from "../validators/unit.schema";



interface UnitFormProps {

  defaultValues?: Partial<UnitFormInput>;


  onSubmit(
    data: UnitFormInput,
  ): void;

}



export function UnitForm({

  defaultValues,

  onSubmit,

}: UnitFormProps) {


  const {

    register,

    handleSubmit,

    formState:{
      errors,
    },

  } =
  useForm<UnitFormInput>({

    resolver:
      zodResolver(unitSchema),

    defaultValues,

  });



  return (

    <form

      noValidate

      onSubmit={
        handleSubmit(onSubmit)
      }

      className="space-y-4 max-w-xl"

    >


      <div>

        <input

          {...register("name")}

          placeholder="Unit name"

          className="border rounded p-2 w-full"

        />


        {
          errors.name &&
          <p className="text-red-600">

            {errors.name.message}

          </p>
        }

      </div>



      <div>

        <input

          {...register("symbol")}

          placeholder="Symbol e.g. kg, pcs"

          className="border rounded p-2 w-full"

        />


        {
          errors.symbol &&
          <p className="text-red-600">

            {errors.symbol.message}

          </p>
        }

      </div>



      <textarea

        {...register("description")}

        placeholder="Description"

        className="border rounded p-2 w-full"

      />



      <button

        type="submit"

        className="bg-black text-white px-5 py-2 rounded"

      >

        Save Unit

      </button>


    </form>

  );

}