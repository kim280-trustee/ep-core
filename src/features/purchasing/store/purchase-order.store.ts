import {
  create,
} from "zustand";


import {
  purchaseOrderService,
} from "../services/purchase-order.service";


import type {
  PurchaseOrder,
} from "../types/purchase-order.types";



interface PurchaseOrderState {


  orders: PurchaseOrder[];


  loadOrders: () => void;


  createDraft: (

    input: {

      tenantId: string;

      storeId: string;

      supplierId: string;

      warehouseId: string;

      notes?: string;

    },

  ) => PurchaseOrder;



  submitOrder: (

    id: string,

  ) => void;



  approveOrder: (

    id: string,

  ) => void;



  cancelOrder: (

    id: string,

  ) => void;



  receiveOrder: (

    id: string,

  ) => void;



}



export const usePurchaseOrderStore =

  create<PurchaseOrderState>((set) => ({



    orders: [],



    loadOrders: () => {


      set({

        orders:

          purchaseOrderService.getOrders(),

      });


    },



    createDraft: (

      input,

    ) => {


      const order =

        purchaseOrderService.createDraft(

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



    submitOrder: (

      id,

    ) => {


      purchaseOrderService.submit(

        id,

      );



      set({

        orders:

          purchaseOrderService.getOrders(),

      });


    },



    approveOrder: (

      id,

    ) => {


      purchaseOrderService.approve(

        id,

      );



      set({

        orders:

          purchaseOrderService.getOrders(),

      });


    },



    cancelOrder: (

      id,

    ) => {


      purchaseOrderService.cancel(

        id,

      );



      set({

        orders:

          purchaseOrderService.getOrders(),

      });


    },



    receiveOrder: (

      id,

    ) => {


      purchaseOrderService.receive(

        id,

      );



      set({

        orders:

          purchaseOrderService.getOrders(),

      });


    },


  }));