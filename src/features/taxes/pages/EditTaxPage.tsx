/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Taxes Module
 * ------------------------------------------------------------
 * Edit Tax Page
 * ============================================================
 */


import {

  useParams,

  useNavigate,

} from "react-router-dom";


import {

  TaxForm,

} from "../components/TaxForm";


import {

  taxService,

} from "../services/tax.service";


import type {

  UpdateTaxDto,

} from "../types/tax.types";







export function EditTaxPage(){



  const {

    id,

  } = useParams();




  const navigate = useNavigate();





  const tax =

    id

      ? taxService.getTaxById(id)

      : undefined;









  function handleSubmit(

    values:UpdateTaxDto,

  ){



    if(!id){

      return;

    }




    taxService.updateTax(

      id,

      values,

    );




    navigate("/taxes");

  }









  if(!tax){


    return (

      <div>

        Tax not found

      </div>

    );


  }









  return (

    <TaxForm


      defaultValues={

        {

          name:

            tax.name,


          rate:

            tax.rate,


          country:

            tax.country,


          currency:

            tax.currency,


          code:

            tax.code ?? undefined,


        }

      }



      onSubmit={handleSubmit}


    />

  );


}