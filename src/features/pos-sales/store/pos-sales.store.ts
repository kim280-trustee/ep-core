import { create } from "zustand";

import type {
  SaleItem,
} from "../types/sale-item.types";


interface PosSalesState {


  tenantId: string;

  storeId: string;

  warehouseId?: string;


  items: SaleItem[];


  customerId?: string;



  setTenant(
    tenantId: string,
  ): void;



  setStore(
    storeId: string,
  ): void;



  setWarehouse(
    warehouseId: string,
  ): void;



  setCustomer(
    customerId?: string,
  ): void;



  addItem(
    item: SaleItem,
  ): void;



  removeItem(
    productId: string,
  ): void;



  clearCart(): void;



  getSubtotal(): number;



  getTaxAmount(): number;



  getTotal(): number;


}



export const usePosSalesStore =
  create<PosSalesState>((set, get) => ({


    tenantId:
      "DEFAULT-TENANT",


    storeId:
      "DEFAULT-STORE",



    warehouseId:
      undefined,



    items: [],



    customerId:
      undefined,




    setTenant(
      tenantId,
    ) {

      set({

        tenantId,

      });

    },




    setStore(
      storeId,
    ) {

      set({

        storeId,

      });

    },




    setWarehouse(
      warehouseId,
    ) {

      set({

        warehouseId,

      });

    },




    setCustomer(
      customerId,
    ) {

      set({

        customerId,

      });

    },




    addItem(
      item,
    ) {

      set((state) => ({

        items: [

          ...state.items,

          item,

        ],

      }));

    },




    removeItem(
      productId,
    ) {

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