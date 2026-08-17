/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Inventory Product Service
 * ============================================================
 */

import {
  inventoryService,
} from "./inventory.service";

import {
  productService,
} from "../../products";

import {
  storeContext,
} from "@/core/store/store.context";


class InventoryProductService {


  async getInventoryWithProducts() {

    const context =
      storeContext.getStore();


    if (!context?.tenantId) {

      return [];

    }


    const inventory =
      await inventoryService.getInventory(
        context.tenantId,
      );


    return Promise.all(

      inventory.map(
        async (record) => {

          const product =
            await productService.getProduct(
              context.tenantId,
              record.productId,
            );


          return {

            ...record,

            product,

          };

        },
      ),

    );

  }


  async getProductInventory(
    productId: string,
  ) {

    const context =
      storeContext.getStore();


    if (!context?.tenantId) {

      return {

        product: null,

        inventory: [],

      };

    }


    const inventory =
      await inventoryService.getInventoryByProduct(

        context.tenantId,

        productId,

      );


    const product =
      await productService.getProduct(

        context.tenantId,

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
