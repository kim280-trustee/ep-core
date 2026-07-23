import {
  useForm,
} from "react-hook-form";


import {
  zodResolver,
} from "@hookform/resolvers/zod";


import {
  taxSchema,
} from "../validators/tax.schema";


import type {
  TaxFormInput,
} from "../validators/tax.schema";



interface TaxFormProps {

  defaultValues?: Partial<TaxFormInput>;


  onSubmit: (
    data: TaxFormInput,
  ) => void;

}



export function TaxForm({

  defaultValues,

  onSubmit,

}: TaxFormProps) {



  const {

    register,

    handleSubmit,

    formState: {
      errors,
    },

  } = useForm<TaxFormInput>({

    resolver:
      zodResolver(taxSchema),


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

      <input

        {...register("name")}

        placeholder="Tax name"

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



      <input

        type="number"

        {...register(
          "rate",
          {
            valueAsNumber: true,
          },
        )}

        placeholder="Tax rate"

        className="
          border
          rounded
          p-2
          w-full
        "

      />



      <input

        {...register("country")}

        placeholder="Country"

        className="
          border
          rounded
          p-2
          w-full
        "

      />



      <input

        {...register("currency")}

        placeholder="Currency"

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

        Save Tax

      </button>


    </form>

  );

}