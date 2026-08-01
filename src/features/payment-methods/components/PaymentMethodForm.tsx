import {

 useForm,

} from "react-hook-form";


import type {

 CreatePaymentMethodDto,

} from "../types/payment-method.types";



interface Props {

 onSubmit(data:CreatePaymentMethodDto):void;

}



export function PaymentMethodForm({

 onSubmit,

}:Props){


 const {

 register,

 handleSubmit,

 } = useForm<CreatePaymentMethodDto>();



 return (

 <form

  onSubmit={handleSubmit(onSubmit)}

 >


 <input

  {...register("name")}

  placeholder="Name"

 />


 <input

  {...register("code")}

  placeholder="Code"

 />


 <input

  {...register("type")}

  placeholder="Type"

 />


 <button>

 Save

 </button>


 </form>

 );


}