import {

 useTaxes,

} from "../hooks/useTaxes";



export function TaxesPage(){


 const {

  taxes,

 } = useTaxes();



 return (

  <div>


   <h1>

    Taxes

   </h1>


   {

    taxes.map(

     tax=>(

      <div

       key={
        tax.id
       }

      >

       {tax.name}

       {" - "}

       {tax.rate}%

      </div>

     )

    )

   }


  </div>

 );


}