/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Taxes Module
 * ------------------------------------------------------------
 * Taxes Hook
 * ============================================================
 */


import {

  useEffect,

} from "react";


import {

  useTaxStore,

} from "../store/tax.store";


import type {

  CreateTaxDto,

  UpdateTaxDto,

} from "../types/tax.types";







export function useTaxes(){





  const {


    taxes,


    loadTaxes,


    createTax: createTaxStore,


    updateTax: updateTaxStore,


    deleteTax: deleteTaxStore,



  } = useTaxStore();








  useEffect(()=>{


    loadTaxes();


  },[loadTaxes]);









  function createTax(

    input:CreateTaxDto,

  ){



    createTaxStore(

      input,

      "default-tenant",

      "default-store",

    );


  }









  function updateTaxById(

    id:string,

    updates:UpdateTaxDto,

  ){



    updateTaxStore(

      id,

      updates,

    );


  }









  function deleteTax(

    id:string,

  ){



    deleteTaxStore(

      id,

    );


  }









  return {


    taxes,


    createTax,


    updateTaxById,


    deleteTax,


  };


}