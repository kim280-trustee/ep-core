import {
  useForm,
} from "react-hook-form";


import {
  zodResolver,
} from "@hookform/resolvers/zod";


import {

  warehouseSchema,

  type WarehouseFormInput,

} from "../validators/warehouse.schema";



interface WarehouseFormProps {


  defaultValues?: Partial<WarehouseFormInput>;


  onSubmit(
    data: WarehouseFormInput,
  ): void;


}



export function WarehouseForm(

  {
    defaultValues,

    onSubmit,

  }: WarehouseFormProps

) {


  const {

    register,

    handleSubmit,

  } =
    useForm<WarehouseFormInput>({

      resolver:

        zodResolver(
          warehouseSchema,
        ),


      defaultValues,

    });



  return (

    <form

      onSubmit={
        handleSubmit(
          onSubmit,
        )
      }

    >


      <input

        {...register("code")}

        placeholder="Warehouse Code"

      />


      <input

        {...register("name")}

        placeholder="Warehouse Name"

      />


      <input

        {...register("address")}

        placeholder="Address"

      />


      <input

        {...register("city")}

        placeholder="City"

      />


      <input

        {...register("province")}

        placeholder="Province"

      />


      <input

        {...register("postalCode")}

        placeholder="Postal Code"

      />


      <input

        {...register("country")}

        placeholder="Country"

      />


      <input

        {...register("phone")}

        placeholder="Phone"

      />


      <button>

        Save Warehouse

      </button>


    </form>

  );

}