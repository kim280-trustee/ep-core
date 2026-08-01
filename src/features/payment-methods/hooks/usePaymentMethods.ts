import {

  useState,

} from "react";


import {

  paymentMethodService,

} from "../services/payment-method.service";



export function usePaymentMethods(){


  const [

    paymentMethods,

    setPaymentMethods,

  ] = useState(

    paymentMethodService.getPaymentMethods()

  );



  function refresh(){


    setPaymentMethods(

      paymentMethodService.getPaymentMethods()

    );


  }



  return {

    paymentMethods,

    refresh,

  };


}