import type {

  CreatePaymentMethodDto,

  UpdatePaymentMethodDto,

} from "../types/payment-method.types";


import {

  paymentMethodRepository,

} from "../repositories/repository.provider";



export const paymentMethodService = {



  getPaymentMethods(){


    return paymentMethodRepository.findAll();


  },



  getPaymentMethodById(

    id:string,

  ){


    return paymentMethodRepository.findById(

      id,

    );


  },



  createPaymentMethod(

    tenantId:string,

    storeId:string,

    data:CreatePaymentMethodDto,

  ){


    return paymentMethodRepository.create(

      tenantId,

      storeId,

      data,

    );


  },



  updatePaymentMethod(

    id:string,

    data:UpdatePaymentMethodDto,

  ){


    return paymentMethodRepository.update(

      id,

      data,

    );


  },



  deletePaymentMethod(

    id:string,

  ){


    return paymentMethodRepository.delete(

      id,

    );


  },


};