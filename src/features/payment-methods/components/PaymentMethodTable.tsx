import type {

 PaymentMethod,

} from "../types/payment-method.types";



interface Props {

 paymentMethods:PaymentMethod[];

 onDelete(id:string):void;

}



export function PaymentMethodTable({

 paymentMethods,

 onDelete,

}:Props){


 return (

 <table>

 <tbody>


 {

 paymentMethods.map(method=>(


 <tr key={method.id}>


 <td>{method.name}</td>


 <td>{method.code}</td>


 <td>

 <button

 onClick={()=>onDelete(method.id)}

 >

 Delete

 </button>


 </td>


 </tr>


 ))


 }


 </tbody>

 </table>

 );


}