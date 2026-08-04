import {
  create,
} from "zustand";


import {
  purchaseOrderService,
} from "../services/purchase-order.service";


import {
  purchaseItemEngine,
} from "../engine";


import type {
  PurchaseOrder,
} from "../types/purchase-order.types";


import type {
  PurchaseOrderItem,
} from "../types/purchase-order-item.types";



interface CreatePurchaseOrderInput {

  tenantId: string;

  storeId: string;

  supplierId: string;

  warehouseId: string;

  notes?: string;

}



interface PurchaseOrderState {


  orders: PurchaseOrder[];



  loadOrders(): void;



  getOrderById(

    id: string,

  ): PurchaseOrder | undefined;



  createDraft(

    input: CreatePurchaseOrderInput,

  ): PurchaseOrder;



  updateOrder(

    id: string,

    updates: Partial<PurchaseOrder>,

  ): void;



  addItem(

    orderId: string,

    item: PurchaseOrderItem,

  ): void;



  submitOrder(

    id: string,

  ): void;



  approveOrder(

    id: string,

  ): void;



  cancelOrder(

    id: string,

  ): void;



  receiveOrder(

    id: string,

  ): void;


}



export const usePurchaseOrderStore =

  create<PurchaseOrderState>((set, get) => ({



    orders: [],





    loadOrders: () => {


      set({

        orders:

          purchaseOrderService.getOrders(),

      });


    },







    getOrderById: (

      id,

    ) => {


      return get()

        .orders

        .find(

          (order) =>

            order.id === id,

        );


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







    updateOrder: (

      id,

      updates,

    ) => {


      purchaseOrderService.update(

        id,

        updates,

      );



      set({

        orders:

          purchaseOrderService.getOrders(),

      });


    },







    addItem: (

      orderId,

      item,

    ) => {


      const order =

        get()

          .orders

          .find(

            (item) =>

              item.id === orderId,

          );



      if (!order) {

        throw new Error(

          "Purchase order not found.",

        );

      }



      const updated =

        purchaseItemEngine.addItem(

          order,

          item,

        );



      purchaseOrderService.update(

        orderId,

        updated,

      );



      set({

        orders:

          purchaseOrderService.getOrders(),

      });


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