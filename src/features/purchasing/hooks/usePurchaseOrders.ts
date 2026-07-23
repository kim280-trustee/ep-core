import {
  useState,
} from "react";


import {
  purchaseOrderService,
} from "../services/purchase-order.service";



export function usePurchaseOrders() {


  const [

    orders,

    setOrders,

  ] = useState(

    purchaseOrderService.getOrders(),

  );



  function refresh() {


    setOrders(

      purchaseOrderService.getOrders(),

    );

  }



  return {


    orders,


    refresh,


  };

}