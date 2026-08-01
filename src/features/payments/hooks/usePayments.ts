import {
  useEffect,
} from "react";


import {
  usePaymentStore,
} from "../store/payment.store";


export function usePayments() {


  const store =

    usePaymentStore();



  useEffect(() => {

    store.loadPayments();

  }, [store]);



  return store;

}