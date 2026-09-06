import {
  useCallback,
  useEffect,
} from "react";

import {
  useCustomersStore,
} from "../store/customer.store";

import {
  customerService,
} from "../services/customer.service";

import {
  storeContext,
} from "@/core/store/store.context";


export function useCustomers() {

  const customers =
    useCustomersStore(
      (state) => state.customers,
    );

  const setCustomers =
    useCustomersStore(
      (state) => state.setCustomers,
    );

  const addCustomer =
    useCustomersStore(
      (state) => state.addCustomer,
    );

  const updateCustomer =
    useCustomersStore(
      (state) => state.updateCustomer,
    );

  const removeCustomerFromStore =
    useCustomersStore(
      (state) => state.removeCustomer,
    );


  const refresh =
    useCallback(
      async () => {

        const context =
          storeContext.getStore();

        if (!context?.tenantId) {
          setCustomers([]);
          return;
        }

        const loaded =
          await customerService.getCustomers(
            context.tenantId,
            context.storeId,
          );

        setCustomers(loaded);

      },
      [setCustomers],
    );


  useEffect(
    () => {
      void refresh();
    },
    [refresh],
  );


  async function createCustomer(
    input: Parameters<
      typeof customerService.createCustomer
    >[0],
  ) {

    const context =
      storeContext.getStore();

    if (!context) {
      throw new Error(
        "Store context is not initialized.",
      );
    }

    const customer =
      await customerService.createCustomer(
        input,
        context.tenantId,
        context.storeId,
      );

    addCustomer(customer);

    return customer;
  }


  async function updateCustomerById(
    id: string,
    updates: Parameters<
      typeof customerService.updateCustomer
    >[2],
  ) {

    const context =
      storeContext.getStore();

    if (!context) {
      throw new Error(
        "Store context is not initialized.",
      );
    }

    const updated =
      await customerService.updateCustomer(
        context.tenantId,
        id,
        updates,
      );

    if (updated) {
      updateCustomer(updated);
    }

    return updated;
  }


  async function deleteCustomer(
    id: string,
  ) {

    const context =
      storeContext.getStore();

    if (!context) {
      throw new Error(
        "Store context is not initialized.",
      );
    }

    const deleted =
      await customerService.deleteCustomer(
        context.tenantId,
        id,
      );

    if (deleted) {
      removeCustomerFromStore(id);
    }

    return deleted;
  }


  return {
    customers,
    refresh,
    createCustomer,
    updateCustomer: updateCustomerById,
    deleteCustomer,
    removeCustomer: deleteCustomer,
  };

}
