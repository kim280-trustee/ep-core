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
      let cancelled = false;
      let retryTimer: number | undefined;

      const loadWhenContextIsReady = async () => {
        if (cancelled) return;

        const context = storeContext.getStore();

        if (!context?.tenantId) {
          retryTimer = window.setTimeout(
            () => void loadWhenContextIsReady(),
            250,
          );
          return;
        }

        try {
          const loaded =
            await customerService.getCustomers(
              context.tenantId,
              context.storeId,
            );

          if (!cancelled) {
            setCustomers(loaded);
          }
        } catch {
          if (!cancelled) {
            retryTimer = window.setTimeout(
              () => void loadWhenContextIsReady(),
              500,
            );
          }
        }
      };

      void loadWhenContextIsReady();

      return () => {
        cancelled = true;
        if (retryTimer !== undefined) {
          window.clearTimeout(retryTimer);
        }
      };
    },
    [setCustomers],
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
