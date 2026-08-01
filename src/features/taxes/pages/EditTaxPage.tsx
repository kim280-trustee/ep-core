import {

 useNavigate,

 useParams,

} from "react-router-dom";


import {

 TaxForm,

} from "../components/TaxForm";


import {

 taxService,

} from "../services/tax.service";



export function EditTaxPage(){


 const {

  id,

 } = useParams();


 const navigate=

 useNavigate();



 const tax =

 id

 ? taxService.getTaxById(id)

 : undefined;



 function handleSubmit(

  data:any,

 ){


  if(!id){

    return;

  }



  taxService.updateTax(

    id,

    data,

  );



  navigate(

    "/taxes"

  );


 }



 return (

  <TaxForm


   defaultValues={tax}


   onSubmit={handleSubmit}


  />

 );


}