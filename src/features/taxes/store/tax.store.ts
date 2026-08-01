import {

  create,

} from "zustand";


import type {

  Tax,

} from "../types/tax.types";



interface TaxState {


  taxes:Tax[];


  setTaxes(

    taxes:Tax[],

  ):void;


}



export const useTaxStore =

create<TaxState>((set)=>({


  taxes:[],


  setTaxes(

    taxes,

  ){

    set({

      taxes,

    });

  },


}));