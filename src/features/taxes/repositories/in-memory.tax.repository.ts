/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Taxes Module
 * ------------------------------------------------------------
 * In Memory Tax Repository
 * ============================================================
 */


import {

  TaxStatus,

} from "../types/tax.types";


import type {

  Tax,

} from "../types/tax.types";



import type {

  TaxRepository,

} from "./tax.repository";







let taxes:Tax[] = [


  {


    id:

      crypto.randomUUID(),


    tenantId:

      "default-tenant",


    storeId:

      "default-store",


    code:

      "VAT",


    name:

      "Value Added Tax",


    rate:

      7,


    country:

      "Thailand",


    currency:

      "THB",


    status:

      TaxStatus.ACTIVE,


    createdAt:

      new Date().toISOString(),


    updatedAt:

      new Date().toISOString(),


  },


];








export const inMemoryTaxRepository:TaxRepository = {



  findAll(){


    return taxes;


  },







  findById(

    id:string,

  ){


    return taxes.find(

      tax =>

        tax.id === id,

    );


  },







  create(

    tax:Tax,

  ){


    taxes.push(

      tax,

    );


    return tax;


  },







  update(

    id:string,

    updates:Partial<Tax>,

  ){


    const index =

      taxes.findIndex(

        tax =>

          tax.id === id,

      );





    if(index === -1){


      return undefined;


    }






    taxes[index] = {


      ...taxes[index],

      ...updates,


      updatedAt:

        new Date().toISOString(),


    };





    return taxes[index];


  },







  delete(

    id:string,

  ){


    const before =

      taxes.length;





    taxes =

      taxes.filter(

        tax =>

          tax.id !== id,

      );





    return taxes.length < before;


  },


};