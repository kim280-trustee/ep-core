import {
  create,
} from "zustand";


import type {
  Customer,
} from "../types/customer.types";


interface CustomersStore {

  customers: Customer[];

  setCustomers(
    customers: Customer[],
  ): void;

  addCustomer(
    customer: Customer,
  ): void;

  updateCustomer(
    customer: Customer,
  ): void;

  removeCustomer(
    id: string,
  ): void;

}


export const useCustomersStore =
  create<CustomersStore>((set) => ({

    customers: [],


    setCustomers(
      customers,
    ) {

      set({
        customers,
      });

    },


    addCustomer(
      customer,
    ) {

      set(
        (state) => ({
          customers: [
            ...state.customers,
            customer,
          ],
        }),
      );

    },


    updateCustomer(
      customer,
    ) {

      set(
        (state) => ({
          customers:
            state.customers.map(
              (item) =>
                item.id === customer.id
                  ? customer
                  : item,
            ),
        }),
      );

    },


    removeCustomer(
      id,
    ) {

      set(
        (state) => ({
          customers:
            state.customers.filter(
              (item) =>
                item.id !== id,
            ),
        }),
      );

    },

  }));
