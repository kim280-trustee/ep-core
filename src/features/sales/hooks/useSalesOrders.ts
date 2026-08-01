import {
  useEffect,
} from "react";


import {
  useSalesOrderStore,
} from "../store/sales-order.store";



export function useSalesOrders() {


  const {

    orders,

    loadOrders,

    createDraft,

    addItem,

    confirmOrder,

    processOrder,

    cancelOrder,

  } = useSalesOrderStore();



  useEffect(() => {

    loadOrders();

  }, [loadOrders]);



  return {


    orders,


    loadOrders,


    createDraft,


    addItem,


    confirmOrder,


    processOrder,


    cancelOrder,


  };


}