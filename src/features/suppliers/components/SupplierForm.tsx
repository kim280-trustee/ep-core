import {
  useForm,
} from "react-hook-form";


import {
  zodResolver,
} from "@hookform/resolvers/zod";


import {

  supplierSchema,

  type SupplierFormInput,

} from "../validators/supplier.schema";



interface Props {

  defaultValues?: Partial<SupplierFormInput>;

  onSubmit(
    data: SupplierFormInput,
  ): void;

}



export function SupplierForm(
  {
    defaultValues,
    onSubmit,
  }: Props,
) {


  const {

    register,

    handleSubmit,

  } =
    useForm<SupplierFormInput>({

      resolver:
        zodResolver(
          supplierSchema,
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
        placeholder="Code"
      />


      <input
        {...register("name")}
        placeholder="Name"
      />


      <input
        {...register("contactPerson")}
        placeholder="Contact"
      />


      <input
        {...register("email")}
        placeholder="Email"
      />


      <input
        {...register("phone")}
        placeholder="Phone"
      />


      <button>

        Save

      </button>


    </form>

  );

}