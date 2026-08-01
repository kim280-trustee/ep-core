import {
  salesOrderRepository,
} from "../repositories";


import type {
  SalesOrder,
} from "../types/sales-order.types";


import type {
  SalesOrderItem,
} from "../types/sales-order-item.types";



interface CreateSalesOrderInput {


  tenantId: string;


  storeId: string;


  warehouseId: string;


  customerId?: string;


  notes?: string;


}



class SalesOrderService {



  createDraft(

    input: CreateSalesOrderInput,

  ) {


    const now =

      new Date().toISOString();



    const order: SalesOrder = {


      id:

        crypto.randomUUID(),



      tenantId:

        input.tenantId,



      storeId:

        input.storeId,



      warehouseId:

        input.warehouseId,



      customerId:

        input.customerId,



      orderNumber:

        `SO-${Date.now()}`,



      status:

        "DRAFT",



      items: [],



      subtotal:

        0,



      discountAmount:

        0,



      taxAmount:

        0,



      totalAmount:

        0,



      paymentStatus:

        "UNPAID",



      notes:

        input.notes,



      createdAt:

        now,



      updatedAt:

        now,


    };



    return salesOrderRepository.create(

      order,

    );

  }







  getOrders() {


    return salesOrderRepository.findAll();


  }







  getOrderById(

    id: string,

  ) {


    return salesOrderRepository.findById(

      id,

    );


  }







  update(

    id: string,

    updates: Partial<SalesOrder>,

  ) {


    return salesOrderRepository.update(

      id,

      updates,

    );


  }







  addItem(

    orderId: string,

    item: SalesOrderItem,

  ) {


    const order =

      salesOrderRepository.findById(

        orderId,

      );



    if (!order) {


      throw new Error(

        "Sales order not found.",

      );


    }



    const updatedItems = [

      ...order.items,

      item,

    ];



    const totals =

      this.calculateTotals(

        updatedItems,

      );



    return salesOrderRepository.update(

      orderId,

      {


        items:

          updatedItems,


        ...totals,


      },

    );


  }







  confirm(

    orderId: string,

  ) {


    return salesOrderRepository.update(

      orderId,

      {


        status:

          "CONFIRMED",


      },

    );


  }







  cancel(

    orderId: string,

  ) {


    return salesOrderRepository.update(

      orderId,

      {


        status:

          "CANCELLED",


      },

    );


  }







  private calculateTotals(

    items: SalesOrderItem[],

  ) {


    const subtotal =

      items.reduce(

        (

          total,

          item,

        ) =>


          total +

          (

            item.quantity *

            item.unitPrice

          ),


        0,

      );





    const discountAmount =

      items.reduce(

        (

          total,

          item,

        ) =>


          total +

          item.discountAmount,


        0,

      );





    const taxAmount =

      items.reduce(

        (

          total,

          item,

        ) =>


          total +

          (

            item.lineTotal *

            (

              item.taxRate /

              100

            )

          ),


        0,

      );





    return {


      subtotal,



      discountAmount,



      taxAmount,



      totalAmount:

        subtotal -

        discountAmount +

        taxAmount,


    };


  }



}



export const salesOrderService =

  new SalesOrderService();