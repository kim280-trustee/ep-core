import {

  create,

} from "zustand";


import type {

  Warehouse,

} from "../types/warehouse.types";



interface WarehouseState {


  warehouses: Warehouse[];


  setWarehouses(

    warehouses:Warehouse[],

  ):void;


}



export const useWarehouseStore =

create<WarehouseState>((set)=>({


  warehouses:[],


  setWarehouses(

    warehouses,

  ){

    set({

      warehouses,

    });

  },


}));