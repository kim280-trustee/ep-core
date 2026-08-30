import {
  useEffect,
} from "react";

import {
  useSalesOrderStore,
} from "../store/sales-order.store";

export function useSalesOrders() {

  const orders =
    useSalesOrderStore(
      (state) =>
        state.orders,
    );

  const loading =
    useSalesOrderStore(
      (state) =>
        state.loading,
    );

  const error =
    useSalesOrderStore(
      (state) =>
        state.error,
    );

  const loadOrders =
    useSalesOrderStore(
      (state) =>
        state.loadOrders,
    );

  const createDraft =
    useSalesOrderStore(
      (state) =>
        state.createDraft,
    );

  const addItem =
    useSalesOrderStore(
      (state) =>
        state.addItem,
    );

  const confirmOrder =
    useSalesOrderStore(
      (state) =>
        state.confirmOrder,
    );

  const processOrder =
    useSalesOrderStore(
      (state) =>
        state.processOrder,
    );

  const completeOrder =
    useSalesOrderStore(
      (state) =>
        state.completeOrder,
    );

  const cancelOrder =
    useSalesOrderStore(
      (state) =>
        state.cancelOrder,
    );

  const refundOrder =
    useSalesOrderStore(
      (state) =>
        state.refundOrder,
    );

  const clearError =
    useSalesOrderStore(
      (state) =>
        state.clearError,
    );

  useEffect(
    () => {
      void loadOrders();
    },
    [loadOrders],
  );

  return {
    orders,

    loading,

    error,

    loadOrders,

    createDraft,

    addItem,

    confirmOrder,

    processOrder,

    completeOrder,

    cancelOrder,

    refundOrder,

    clearError,
  };
}
