import {
  getSaleRepository,
} from "../repositories";


import type {
  Sale,
} from "../types";


import type {
  SaleItem,
} from "../types";



interface CreateSaleInput {

  tenantId: string;

  storeId: string;

  warehouseId: string;

  customerId?: string;

  cashierId?: string;

}



class SaleService {


  createSale(
    input: CreateSaleInput,
  ) {


    const now =
      new Date().toISOString();



    const sale: Sale = {


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


      cashierId:
        input.cashierId,


      saleNumber:
        `SALE-${Date.now()}`,


      status:
        "COMPLETED",


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
        "PENDING",


      createdAt:
        now,


      updatedAt:
        now,

    };


    return getSaleRepository()
      .create(
        sale,
      );

  }


    addItem(
    saleId: string,
    item: SaleItem,
  ) {

    const sale =
      this.getSaleById(
        saleId,
      );


    if (!sale) {

      throw new Error(
        "Sale not found",
      );

    }


    const items = [
      ...sale.items,
      item,
    ];


    return getSaleRepository()
      .update(

        saleId,

        {

          items,

          ...this.calculateTotals(
            items,
          ),

        },

      );

  }


  addItems(
    saleId: string,
    items: SaleItem[],
  ) {


    const sale =
      this.getSaleById(
        saleId,
      );


    if(!sale){

      throw new Error(
        "Sale not found",
      );

    }



    return getSaleRepository()
      .update(

        saleId,

        {

          items,

          ...this.calculateTotals(
            items,
          ),

        },

      );

  }




  completePayment(
    saleId:string,
    paymentMethod:string,
  ){

    return getSaleRepository()
      .update(

        saleId,

        {

          paymentStatus:
            "PAID",

          paymentMethod,

          completedAt:
            new Date()
              .toISOString(),

        },

      );

  }


  completeSale(
    saleId: string,
  ) {

    return getSaleRepository()
      .update(

        saleId,

        {

          paymentStatus:
            "PAID",

          completedAt:
            new Date()
              .toISOString(),

        },

      );

  }


  voidSale(
    saleId:string,
  ){

    return getSaleRepository()
      .update(

        saleId,

        {

          status:
            "VOIDED",

        },

      );

  }





  getSales(){

    return getSaleRepository()
      .findAll();

  }




  getSaleById(
    id:string,
  ){

    return getSaleRepository()
      .findById(
        id,
      );

  }





  private calculateTotals(
    items:SaleItem[],
  ){


    const subtotal =
      items.reduce(

        (sum,item)=>
          sum + item.lineTotal,

        0,

      );



    const discountAmount =
      items.reduce(

        (sum,item)=>
          sum + (item.discountAmount ?? 0),
        0,

      );



    const taxAmount =
      items.reduce(

        (sum,item)=>
          sum +
          (
            item.lineTotal *
            item.taxRate /
            100
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



export const saleService =
  new SaleService();