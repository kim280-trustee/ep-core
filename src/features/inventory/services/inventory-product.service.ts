import {
  inventoryService,
} from "./inventory.service";


import {
  productService,
} from "../../products";



class InventoryProductService {



  getInventoryWithProducts() {


    return inventoryService

      .getInventory()

      .map(

        (record) => {


          const product =

            productService

              .getProductById(

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



    const inventory =

      inventoryService

        .getProductStock(

          productId,

        );



    const product =

      productService

        .getProductById(

          productId,

        );



    return {


      product,


      inventory,


    };


  }


}



export const inventoryProductService =

  new InventoryProductService();