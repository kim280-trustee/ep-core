/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Taxes Module
 * ------------------------------------------------------------
 * Tax Business Service
 * ============================================================
 */


import {

  taxRepository,

} from "../repositories/repository.provider";


import {

  TaxStatus,

} from "../types/tax.types";


import type {

  Tax,

  CreateTaxDto,

  UpdateTaxDto,

} from "../types/tax.types";







class TaxService {







  private generateId():string {


    return crypto.randomUUID();


  }









  getTaxes():Tax[]{


    return taxRepository.findAll();


  }









  getTaxById(

    id:string,

  ):Tax | undefined {


    return taxRepository.findById(

      id,

    );


  }









  createTax(

    tenantId:string,

    storeId:string,

    input:CreateTaxDto,

  ):Tax {



    const duplicate =

      this.getTaxes()

        .find(

          tax =>

            tax.tenantId === tenantId &&

            tax.storeId === storeId &&

            tax.name.toLowerCase() ===

            input.name.toLowerCase(),

        );





    if(duplicate){


      throw new Error(

        "Tax with this name already exists.",

      );


    }









    const now =

      new Date().toISOString();







    const tax:Tax = {


      id:

        this.generateId(),



      tenantId,



      storeId,



      code:

        input.code ?? null,



      name:

        input.name,



      rate:

        input.rate,



      country:

        input.country,



      currency:

        input.currency,



      status:

        TaxStatus.ACTIVE,



      createdAt:

        now,



      updatedAt:

        now,



    };






    return taxRepository.create(

      tax,

    );


  }









  updateTax(

    id:string,

    updates:UpdateTaxDto,

  ):Tax | undefined {



    return taxRepository.update(

      id,

      {

        ...updates,

        updatedAt:

          new Date().toISOString(),

      },

    );


  }









  deleteTax(

    id:string,

  ):boolean {


    return taxRepository.delete(

      id,

    );


  }



}







export const taxService =

  new TaxService();