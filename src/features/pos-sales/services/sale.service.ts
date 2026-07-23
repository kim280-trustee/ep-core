import {
  saleRepository,
} from "../repositories";


import {
  inventoryTransactionService,
} from "../../inventory-transactions/services/inventory-transaction.service";


import type {
  Sale,
} from "../types/sale.types";


import type {
  SaleItem,
} from "../types/sale-item.types";



interface CreateSaleInput {


  tenantId: string;


  storeId: string;


  warehouseId: string;


  customerId?: string;


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


      saleNumber:

        `SALE-${Date.now()}`,


      status:

        "COMPLETED",


      items: [],


      subtotal:

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



    return saleRepository.create(

      sale,

    );

  }





  addItem(

    saleId: string,

    item: SaleItem,

  ) {


    const sale =

      saleRepository.findById(

        saleId,

      );



    if(!sale) {


      throw new Error(

        "Sale not found.",

      );


    }



    const items = [


      ...sale.items,


      item,


    ];



    return saleRepository.update(

      saleId,

      {


        items,


        ...this.calculateTotals(

          items,

        ),


      },

    );

  }





  completeSale(

    saleId: string,

  ) {


    const sale =

      saleRepository.findById(

        saleId,

      );



    if(!sale) {


      throw new Error(

        "Sale not found.",

      );


    }



    sale.items.forEach(

      item => {


        inventoryTransactionService

          .createTransaction({

            tenantId:

              sale.tenantId,


            storeId:

              sale.storeId,


            productId:

              item.productId,


            warehouseId:

              sale.warehouseId,


            movementType:

              "SALE",


            quantity:

              item.quantity,


            unitCost:

              0,


            referenceType:

              "SALE",


            referenceId:

              sale.id,


          });


      },

    );



    return saleRepository.update(

      saleId,

      {


        status:

          "COMPLETED",


        paymentStatus:

          "PAID",


      },

    );

  }





  voidSale(

    saleId: string,

  ) {


    return saleRepository.update(

      saleId,

      {


        status:

          "VOIDED",


      },

    );

  }





  private calculateTotals(

    items: SaleItem[],

  ) {



    const subtotal =

      items.reduce(

        (

          total,

          item,

        ) =>


          total +

          item.lineTotal,


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

              item.taxRate / 100

            )

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





  getSales() {


    return saleRepository.findAll();

  }





  getSaleById(

    id: string,

  ) {


    return saleRepository.findById(

      id,

    );

  }


}



export const saleService =

  new SaleService();