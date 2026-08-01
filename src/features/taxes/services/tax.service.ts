import type {

  CreateTaxDto,

  UpdateTaxDto,

} from "../types/tax.types";


import {

  taxRepository,

} from "../repositories/repository.provider";



export const taxService = {


  getTaxes(){


    return taxRepository.findAll();


  },



  getTaxById(

    id:string,

  ){


    return taxRepository.findById(

      id,

    );


  },



  createTax(

    tenantId:string,

    storeId:string,

    tax:CreateTaxDto,

  ){


    return taxRepository.create({

      ...tax,

      tenantId,

      storeId,

    });


  },



  updateTax(

    id:string,

    tax:UpdateTaxDto,

  ){


    return taxRepository.update(

      id,

      tax,

    );


  },



  deleteTax(

    id:string,

  ){


    return taxRepository.delete(

      id,

    );


  },


};