import {

 useParams,

 useNavigate,

} from "react-router-dom";


import {

 PaymentMethodForm,

} from "../components/PaymentMethodForm";


import {

 paymentMethodService,

} from "../services/payment-method.service";



export function EditPaymentMethodPage(){


 const {

 id,

 } = useParams();



 const navigate=

 useNavigate();



 function submit(data:any){


 if(!id){

 return;

 }


 paymentMethodService.updatePaymentMethod(

 id,

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