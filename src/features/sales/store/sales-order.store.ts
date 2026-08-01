import {
  create,
} from "zustand";


import {
  salesOrderService,
} from "../services/sales-order.service";


import {
  salesProcessingEngine,
} from "../engine";


import type {
  SalesOrder,
} from "../types/sales-order.types";


import type {
  SalesOrderItem,
} from "../types/sales-order-item.types";



interface SalesOrderState {


  orders: SalesOrder[];



  loadOrders: () => void;



  createDraft: (

    input: {

      tenantId: string;

      storeId: string;

      warehouseId: string;

      customerId?: string;

      notes?: string;

    },

  ) => SalesOrder;



  addItem: (

    orderId: string,

    item: SalesOrderItem,

  ) => void;



  confirmOrder: (

    id: string,

  ) => void;



  processOrder: (

    id: string,

  ) => void;



  cancelOrder: (

    id: string,

  ) => void;



}



export const useSalesOrderStore =

  create<SalesOrderState>((set) => ({



    orders: [],





    loadOrders: () => {


      set({

        orders:

          salesOrderService.getOrders(),

      });


    },





    createDraft: (

      input,

    ) => {


      const order =

        salesOrderService.createDraft(

          input,

        );



      set((state) => ({


        orders:

          [

            ...state.orders,

            order,

          ],


      }));



      return order;


    },





    addItem: (

      orderId,

      item,

    ) => {


      salesOrderService.addItem(

        orderId,

        item,

      );



      set({

        orders:

          salesOrderService.getOrders(),

      });


    },





    confirmOrder: (

      id,

    ) => {


      salesOrderService.confirm(

        id,

      );



      set({

        orders:

          salesOrderService.getOrders(),

      });


    },





    processOrder: (

      id,

    ) => {


      const order =

        salesOrderService.getOrderById(

          id,

        );



      if (!order) {

        throw new Error(

          "Sales order not found.",

        );

      }



      const completedOrder =

        salesProcessingEngine.process(

          order,

        );



      salesOrderService.update(

        id,

        completedOrder,

      );



      set({

        orders:

          salesOrderService.getOrders(),

      });


    },





    cancelOrder: (

      id,

    ) => {


      salesOrderService.cancel(

        id,

      );



      set({

        orders:

          salesOrderService.getOrders(),

      });


    },


  }));