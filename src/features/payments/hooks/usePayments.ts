import {
  useEffect,
} from "react";

import {
  usePaymentStore,
} from "../store/payment.store";

import {
  storeContext,
} from "@/core/store/store.context";


export function usePayments() {

  const payments =
    usePaymentStore(
      (state) =>
        state.payments,
    );

  const loading =
    usePaymentStore(
      (state) =>
        state.loading,
    );

  const error =
    usePaymentStore(
      (state) =>
        state.error,
    );

  const loadPayments =
    usePaymentStore(
      (state) =>
        state.loadPayments,
    );

  const createPayment =
    usePaymentStore(
      (state) =>
        state.createPayment,
    );

  const completePayment =
    usePaymentStore(
      (state) =>
        state.completePayment,
    );

  const failPayment =
    usePaymentStore(
      (state) =>
        state.failPayment,
    );

  const refundPayment =
    usePaymentStore(
      (state) =>
        state.refundPayment,
    );


  useEffect(
    () => {

      const context =
        storeContext.getStore();


      if (!context?.tenantId) {

        return;

      }


      void loadPayments(
        context.tenantId,
      );

    },
    [
      loadPayments,
    ],
  );


  return {

    payments,

    loading,

    error,

    loadPayments,

    createPayment,

    completePayment,

    failPayment,

    refundPayment,

  };

}
