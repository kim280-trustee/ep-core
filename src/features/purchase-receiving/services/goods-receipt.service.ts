/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Purchase Receiving Module
 * ------------------------------------------------------------
 * Goods Receipt Service
 * ============================================================
 */


import {
  goodsReceiptRepository,
} from "../repositories";


import {
  inventoryTransactionService,
} from "../../inventory-transactions/services/inventory-transaction.service";


import {
  eventBus,
} from "@/core/events";


import type {
  GoodsReceipt,
} from "../types/goods-receipt.types";


import type {
  GoodsReceiptItem,
} from "../types/goods-receipt-item.types";



interface CreateGoodsReceiptInput {

  tenantId: string;

  storeId: string;

  purchaseOrderId: string;

  supplierId: string;

  warehouseId: string;

  items: GoodsReceiptItem[];

  receivedBy?: string;

  notes?: string;

}




class GoodsReceiptService {



  createReceipt(

    input: CreateGoodsReceiptInput,

  ) {


    this.validateItems(

      input.items,

    );



    const receipt: GoodsReceipt = {


      id:

        crypto.randomUUID(),


      tenantId:

        input.tenantId,


      storeId:

        input.storeId,


      purchaseOrderId:

        input.purchaseOrderId,


      supplierId:

        input.supplierId,


      warehouseId:

        input.warehouseId,


      items:

        input.items,


      receivedDate:

        new Date().toISOString(),


      receivedBy:

        input.receivedBy,


      notes:

        input.notes,


      createdAt:

        new Date().toISOString(),


    };



    const savedReceipt =

      goodsReceiptRepository.create(

        receipt,

      );



    this.createInventoryTransactions(

      savedReceipt,

    );



    eventBus.publish(

      "GOODS_RECEIPT_CREATED",

      savedReceipt,

    );



    return savedReceipt;


  }







  private validateItems(

    items: GoodsReceiptItem[],

  ) {


    if (

      items.length === 0

    ) {

      throw new Error(

        "Goods receipt requires at least one item.",

      );

    }



    items.forEach(

      (item) => {


        if (

          item.quantityReceived <= 0

        ) {

          throw new Error(

            "Received quantity must be greater than zero.",

          );

        }


      },

    );


  }







  private createInventoryTransactions(

    receipt: GoodsReceipt,

  ) {


    receipt.items.forEach(

      (item) => {


        inventoryTransactionService.createTransaction({


          tenantId:

            receipt.tenantId,


          storeId:

            receipt.storeId,


          productId:

            item.productId,


          warehouseId:

            receipt.warehouseId,


          movementType:

            "PURCHASE_RECEIPT",


          quantity:

            item.quantityReceived,


          unitCost:

            item.unitCost,


          referenceType:

            "GOODS_RECEIPT",


          referenceId:

            receipt.id,


        });


      },

    );


  }







  getReceipts() {

    return goodsReceiptRepository.findAll();

  }







  getReceiptById(

    id: string,

  ) {

    return goodsReceiptRepository.findById(

      id,

    );

  }







  getReceiptsByPurchaseOrder(

    purchaseOrderId: string,

  ) {

    return goodsReceiptRepository.findByPurchaseOrder(

      purchaseOrderId,

    );

  }







  updateReceipt(

    id: string,

    updates: Partial<GoodsReceipt>,

  ) {


    const receipt =

      this.getReceiptById(

        id,

      );



    if (!receipt) {

      throw new Error(

        "Goods receipt not found.",

      );

    }



    return goodsReceiptRepository.update(

      id,

      {

        ...receipt,

        ...updates,

      },

    );


  }







  deleteReceipt(

    id: string,

  ) {


    const receipt =

      this.getReceiptById(

        id,

      );



    if (!receipt) {

      throw new Error(

        "Goods receipt not found.",

      );

    }



    goodsReceiptRepository.delete(

      id,

    );


  }


}





export const goodsReceiptService =

  new GoodsReceiptService();