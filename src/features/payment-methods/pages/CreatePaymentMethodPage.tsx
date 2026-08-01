import {

 useNavigate,

} from "react-router-dom";


import {

 PaymentMethodForm,

} from "../components/PaymentMethodForm";


import {

 paymentMethodService,

} from "../services/payment-method.service";



export function CreatePaymentMethodPage(){


 const navigate = useNavigate();



 function submit(data:any){


 paymentMethodService.createPaymentMethod(

 "default-tenant",

 "default-store",

 data,

 );


 navigate("/payment-methods");


 }



 return (

 <PaymentMethodForm

 onSubmit={submit}

 />

 );


}