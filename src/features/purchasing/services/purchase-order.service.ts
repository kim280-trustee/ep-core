import {
  purchaseOrderRepository,
} from "../repositories";


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





class PurchaseOrderService {



  createDraft(

    input: CreatePurchaseOrderInput,

  ) {


    const now =
      new Date().toISOString();



    const order:
      PurchaseOrder = {


      id:
        crypto.randomUUID(),


      tenantId:
        input.tenantId,


      storeId:
        input.storeId,


      supplierId:
        input.supplierId,


      warehouseId:
        input.warehouseId,


      orderNumber:
        `PO-${Date.now()}`,


      status:
        "DRAFT",


      items: [],


      subtotal:
        0,


      taxAmount:
        0,


      totalAmount:
        0,


      notes:
        input.notes,


      createdAt:
        now,


      updatedAt:
        now,


    };



    return purchaseOrderRepository.create(
      order,
    );

  }





  addItem(

    orderId: string,

    item: PurchaseOrderItem,

  ) {



    const order =

      purchaseOrderRepository.findById(

        orderId,

      );



    if (!order) {

      throw new Error(
        "Purchase order not found.",
      );

    }



    if (

      order.status !== "DRAFT"

    ) {

      throw new Error(
        "Items can only be added to draft orders.",
      );

    }



    const updatedItems = [

      ...order.items,

      item,

    ];



    return purchaseOrderRepository.update(

      orderId,

      {

        items:
          updatedItems,


        ...this.calculateTotals(

          updatedItems,

        ),

      },

    );

  }





  submit(

    orderId: string,

  ) {


    return this.changeStatus(

      orderId,

      "SUBMITTED",

    );

  }





  approve(

    orderId: string,

  ) {


    return this.changeStatus(

      orderId,

      "APPROVED",

    );

  }





  cancel(

    orderId: string,

  ) {


    return this.changeStatus(

      orderId,

      "CANCELLED",

    );

  }





  private changeStatus(

    orderId: string,

    status:

      PurchaseOrder["status"],

  ) {


    return purchaseOrderRepository.update(

      orderId,

      {

        status,

      },

    );

  }





  private calculateTotals(

    items: PurchaseOrderItem[],

  ) {



    const subtotal =

      items.reduce(

        (

          total,

          item,

        ) =>

          total +

          (

            item.quantityOrdered *

            item.unitCost

          ),

        0,

      );





    const taxAmount =

      items.reduce(

        (

          total,

          item,

        ) =>

          total +

          item.lineTotal *

          (

            item.taxRate / 100

          ),

        0,

      );





    return {


      subtotal,


      taxAmount,


      totalAmount:

        subtotal +

        taxAmount,


    };


  }





  getOrders() {


    return purchaseOrderRepository.findAll();

  }





  getOrderById(

    id: string,

  ) {


    return purchaseOrderRepository.findById(

      id,

    );

  }


}



export const purchaseOrderService =

  new PurchaseOrderService();