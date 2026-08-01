import {

 usePaymentMethods,

} from "../hooks/usePaymentMethods";


import {

 PaymentMethodTable,

} from "../components/PaymentMethodTable";



export function PaymentMethodsPage(){


 const {

 paymentMethods,

 } = usePaymentMethods();



 return (

 <PaymentMethodTable

 paymentMethods={paymentMethods}

 onDelete={()=>{}}

 />

 );


}