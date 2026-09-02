import {
  create,
} from "zustand";

import {
  paymentService,
} from "../services/payment.service";

import type {
  Payment,
  PaymentMethod,
} from "../types/payment.types";


interface PaymentStore {

  payments: Payment[];

  loading: boolean;

  error: string | null;

  loadPayments: (
    tenantId: string,
  ) => Promise<void>;

  createPayment: (
    tenantId: string,
    salesOrderId: string,
    method: PaymentMethod,
    amount: number,
    provider?: string,
  ) => Promise<Payment>;

  completePayment: (
    tenantId: string,
    id: string,
    reference?: string,
  ) => Promise<Payment | undefined>;

  failPayment: (
    tenantId: string,
    id: string,
  ) => Promise<Payment | undefined>;

  refundPayment: (
    tenantId: string,
    id: string,
  ) => Promise<Payment | undefined>;

}


export const usePaymentStore =
  create<PaymentStore>(
    (set) => ({

      payments: [],

      loading: false,

      error: null,


      loadPayments:
        async (
          tenantId,
        ) => {

          set({
            loading: true,
            error: null,
          });


          try {

            const payments =
              await paymentService.getPayments(
                tenantId,
              );


            set({
              payments,
              loading: false,
            });

          } catch (error) {

            set({
              loading: false,

              error:
                error instanceof Error
                  ? error.message
                  : "Failed to load payments.",
            });

            throw error;

          }

        },


      createPayment:
        async (
          tenantId,
          salesOrderId,
          method,
          amount,
          provider,
        ) => {

          const payment =
            await paymentService.createPayment(
              tenantId,
              salesOrderId,
              method,
              amount,
              provider,
            );


          set(
            (state) => ({

              payments: [
                payment,
                ...state.payments,
              ],

            }),
          );


          return payment;

        },


      completePayment:
        async (
          tenantId,
          id,
          reference,
        ) => {

          const payment =
            await paymentService.completePayment(
              tenantId,
              id,
              reference,
            );


          if (payment) {

            set(
              (state) => ({

                payments:
                  state.payments.map(
                    (item) =>
                      item.id === id
                        ? payment
                        : item,
                  ),

              }),
            );

          }


          return payment;

        },


      failPayment:
        async (
          tenantId,
          id,
        ) => {

          const payment =
            await paymentService.failPayment(
              tenantId,
              id,
            );


          if (payment) {

            set(
              (state) => ({

                payments:
                  state.payments.map(
                    (item) =>
                      item.id === id
                        ? payment
                        : item,
                  ),

              }),
            );

          }


          return payment;

        },


      refundPayment:
        async (
          tenantId,
          id,
        ) => {

          const payment =
            await paymentService.refundPayment(
              tenantId,
              id,
            );


          if (payment) {

            set(
              (state) => ({

                payments:
                  state.payments.map(
                    (item) =>
                      item.id === id
                        ? payment
                        : item,
                  ),

              }),
            );

          }


          return payment;

        },

    }),
  );

