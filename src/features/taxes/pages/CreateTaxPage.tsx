import {

 useNavigate,

} from "react-router-dom";


import {

 TaxForm,

} from "../components/TaxForm";


import {

 taxService,

} from "../services/tax.service";


import type {

 TaxFormInput,

} from "../validators/tax.schema";



export function CreateTaxPage(){


 const navigate=

 useNavigate();



 function handleSubmit(

  data:TaxFormInput,

 ){


  taxService.createTax(

    "default-tenant",

    "default-store",

    data,

  );



  navigate(

    "/taxes"

  );


 }



 return (

  <TaxForm

    onSubmit={handleSubmit}

  />

 );


}