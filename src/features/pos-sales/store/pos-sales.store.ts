import { create } from "zustand";

import type {
  SaleItem,
} from "../types/sale-item.types";


interface PosSalesState {

  items: SaleItem[];

  customerId?: string;

  warehouseId?: string;


  addItem(
    item: SaleItem,
  ): void;


  removeItem(
    productId: string,
  ): void;


  clearCart(): void;


  setCustomer(
    customerId?: string,
  ): void;


  setWarehouse(
    warehouseId: string,
  ): void;


  getSubtotal(): number;


  getTaxAmount(): number;


  getTotal(): number;

}



export const usePosSalesStore =
  create<PosSalesState>((set, get) => ({


    items: [],


    customerId: undefined,


    warehouseId: undefined,



    addItem(item) {


      set((state) => ({


        items: [

          ...state.items,

          item,

        ],


      }));

    },



    removeItem(productId) {


      set((state) => ({


        items:

          state.items.filter(

            (item) =>

              item.productId !== productId,

          ),


      }));

    },



    clearCart() {


      set({

        items: [],

        customerId: undefined,

      });


    },



    setCustomer(customerId) {


      set({

        customerId,

      });


    },



    setWarehouse(warehouseId) {


      set({

        warehouseId,

      });


    },



    getSubtotal() {


      return get()

        .items

        .reduce(

          (total, item) =>

            total + item.lineTotal,

          0,

        );


    },



    getTaxAmount() {


      return get()

        .items

        .reduce(

          (total, item) =>

            total +

            (

              item.lineTotal *

              (item.taxRate / 100)

            ),

          0,

        );


    },



    getTotal() {


      return (

        get().getSubtotal()

        +

        get().getTaxAmount()

      );


    },


  }));