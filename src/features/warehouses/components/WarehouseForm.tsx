import {
  useForm,
} from "react-hook-form";


import {
  zodResolver,
} from "@hookform/resolvers/zod";


import {
  warehouseSchema,
} from "../validators/warehouse.schema";


import type {
  WarehouseFormInput,
} from "../validators/warehouse.schema";



interface WarehouseFormProps {

  defaultValues?: Partial<WarehouseFormInput>;


  onSubmit: (
    data: WarehouseFormInput,
  ) => void;

}



export function WarehouseForm({

  defaultValues,

  onSubmit,

}: WarehouseFormProps) {



  const {

    register,

    handleSubmit,

    formState: {
      errors,
    },

  } = useForm<WarehouseFormInput>({

    resolver:
      zodResolver(warehouseSchema),


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

        placeholder="Warehouse name"

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

        {...register("code")}

        placeholder="Warehouse code"

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

        Save Warehouse

      </button>


    </form>

  );

}