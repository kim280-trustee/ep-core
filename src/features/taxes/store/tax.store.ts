/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Taxes Module
 * ------------------------------------------------------------
 * Taxes Zustand Store
 * ============================================================
 */


import {

  create,

} from "zustand";


import {

  taxService,

} from "../services/tax.service";


import type {

  Tax,

  CreateTaxDto,

  UpdateTaxDto,

} from "../types/tax.types";







interface TaxStore {


  taxes:Tax[];




  loadTaxes():void;




  createTax(

    input:CreateTaxDto,

    tenantId:string,

    storeId:string,

  ):void;





  updateTax(

    id:string,

    updates:UpdateTaxDto,

  ):void;





  deleteTax(

    id:string,

  ):void;



}







export const useTaxStore =

create<TaxStore>((set)=>({







  taxes:[],








  loadTaxes(){


    set({

      taxes:

        taxService.getTaxes(),

    });


  },









  createTax(

    input,

    tenantId,

    storeId,

  ){


    taxService.createTax(

      tenantId,

      storeId,

      input,

    );



    set({

      taxes:

        taxService.getTaxes(),

    });


  },









  updateTax(

    id,

    updates,

  ){


    taxService.updateTax(

      id,

      updates,

    );



    set({

      taxes:

        taxService.getTaxes(),

    });


  },









  deleteTax(

    id,

  ){


    taxService.deleteTax(

      id,

    );



    set({

      taxes:

        taxService.getTaxes(),

    });


  },



}));