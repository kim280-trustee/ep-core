import {
  useForm,
} from "react-hook-form";


import {
  zodResolver,
} from "@hookform/resolvers/zod";


import {
  supplierSchema,
} from "../validators/supplier.schema";


import type {
  SupplierFormInput,
} from "../validators/supplier.schema";



interface SupplierFormProps {

  defaultValues?: Partial<SupplierFormInput>;


  onSubmit: (
    data: SupplierFormInput,
  ) => void;

}



export function SupplierForm({

  defaultValues,

  onSubmit,

}: SupplierFormProps) {



  const {

    register,

    handleSubmit,

    formState: {
      errors,
    },

  } = useForm<SupplierFormInput>({

    resolver:
      zodResolver(supplierSchema),


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

        placeholder="Supplier name"

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

        {...register("contactPerson")}

        placeholder="Contact person"

        className="
          border
          rounded
          p-2
          w-full
        "

      />



      <input

        {...register("phone")}

        placeholder="Phone"

        className="
          border
          rounded
          p-2
          w-full
        "

      />



      <input

        {...register("email")}

        placeholder="Email"

        className="
          border
          rounded
          p-2
          w-full
        "

      />



      <textarea

        {...register("address")}

        placeholder="Address"

        className="
          border
          rounded
          p-2
          w-full
        "

      />



      <input

        {...register("taxId")}

        placeholder="Tax ID"

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

        Save Supplier

      </button>


    </form>

  );

}