import {
  inventoryService,
} from "./inventory.service";


import {
  productService,
} from "../../products";



class InventoryProductService {


  getInventoryWithProducts() {


    const inventory =

      inventoryService.getInventory();



    return inventory.map(

      (record) => {


        const product =

          productService.getProductById(

            record.productId,

          );


        return {


          ...record,


          product,

        };


      },

    );

  }





  getProductInventory(

    productId: string,

  ) {


    const records =

      inventoryService.getProductStock(

        productId,

      );



    const product =

      productService.getProductById(

        productId,

      );



    return {


      product,


      inventory: records,


    };

  }



}


export const inventoryProductService =

  new InventoryProductService();