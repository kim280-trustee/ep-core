import {
  useForm,
} from "react-hook-form";


import {
  zodResolver,
} from "@hookform/resolvers/zod";


import {
  customerSchema,
} from "../validators/customer.schema";


import type {
  CustomerFormInput,
} from "../validators/customer.schema";



interface CustomerFormProps {

  defaultValues?: Partial<CustomerFormInput>;


  onSubmit: (
    data: CustomerFormInput,
  ) => void;

}



export function CustomerForm({

  defaultValues,

  onSubmit,

}: CustomerFormProps) {



  const {

    register,

    handleSubmit,

    formState: {
      errors,
    },

  } = useForm<CustomerFormInput>({

    resolver:
      zodResolver(customerSchema),


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

        placeholder="Customer name"

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



      <select

        {...register("customerType")}

        className="
          border
          rounded
          p-2
          w-full
        "

      >

        <option value="regular">
          Regular
        </option>


        <option value="wholesale">
          Wholesale
        </option>


      </select>



      <input

        type="number"

        {...register(
          "creditLimit",
          {
            valueAsNumber: true,
          },
        )}

        placeholder="Credit limit"

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

        Save Customer

      </button>


    </form>

  );

}