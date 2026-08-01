import {

  useForm,

} from "react-hook-form";


import {

  zodResolver,

} from "@hookform/resolvers/zod";


import {

  taxSchema,

  type TaxFormInput,

} from "../validators/tax.schema";



interface Props {


  defaultValues?:Partial<TaxFormInput>;


  onSubmit(

    data:TaxFormInput,

  ):void;


}



export function TaxForm({

  defaultValues,

  onSubmit,

}:Props){



 const {

  register,

  handleSubmit,

 } = useForm<TaxFormInput>({


  resolver:

    zodResolver(

      taxSchema,

    ),


  defaultValues,


 });



 return (

  <form

    onSubmit={

      handleSubmit(onSubmit)

    }

  >


   <input

    {...register("code")}

    placeholder="Tax Code"

   />


   <input

    {...register("name")}

    placeholder="Tax Name"

   />


   <input

    type="number"

    {...register(

      "rate",

      {

        valueAsNumber:true,

      }

    )}

    placeholder="Rate"

   />


   <input

    {...register("country")}

    placeholder="Country"

   />


   <input

    {...register("currency")}

    placeholder="Currency"

   />


   <button>

    Save Tax

   </button>


  </form>

 );


}