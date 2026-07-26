import {
  create,
} from "zustand";

import type {
  InventoryRecord,
} from "../types/inventory-record.types";

import {
  inventoryService,
} from "../services/inventory.service";


interface InventoryStore {

  inventory: InventoryRecord[];

  loadInventory: () => void;

  increaseStock: (
    record: InventoryRecord,
    quantity: number,
    incomingCost: number,
  ) => void;


  decreaseStock: (
    record: InventoryRecord,
    quantity: number,
  ) => void;


  reserveStock: (
    record: InventoryRecord,
    quantity: number,
  ) => void;


  releaseReservedStock: (
    record: InventoryRecord,
    quantity: number,
  ) => void;

}



export const useInventoryStore =
  create<InventoryStore>((set) => ({

    inventory: [],



    loadInventory: () => {

      set({

        inventory:
          inventoryService.getInventory(),

      });

    },



    increaseStock: (
      record,
      quantity,
      incomingCost,
    ) => {

      inventoryService.increaseStock(
        record,
        quantity,
        incomingCost,
      );


      set({

        inventory:
          inventoryService.getInventory(),

      });

    },



    decreaseStock: (
      record,
      quantity,
    ) => {

      inventoryService.decreaseStock(
        record,
        quantity,
      );


      set({

        inventory:
          inventoryService.getInventory(),

      });

    },



    reserveStock: (
      record,
      quantity,
    ) => {

      inventoryService.reserveStock(
        record,
        quantity,
      );


      set({

        inventory:
          inventoryService.getInventory(),

      });

    },



    releaseReservedStock: (
      record,
      quantity,
    ) => {

      inventoryService.releaseReservedStock(
        record,
        quantity,
      );


      set({

        inventory:
          inventoryService.getInventory(),

      });

    },

  }));