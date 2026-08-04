import {
  checkoutService,
} from "../services";

import type {
  CheckoutRequest,
} from "../types";


export class CheckoutEngine {


  process(

    input: CheckoutRequest,

  ) {

    return checkoutService.checkout(

      input,

    );

  }


}


export const checkoutEngine =

  new CheckoutEngine();