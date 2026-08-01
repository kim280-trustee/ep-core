/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Units Module
 * ------------------------------------------------------------
 * Units Zustand Store
 * ============================================================
 */


import {
  create,
} from "zustand";


import type {
  Unit,
} from "../types/unit.types";



interface UnitsStore {


  units: Unit[];


  setUnits(
    units: Unit[],
  ): void;



  addUnit(
    unit: Unit,
  ): void;



  updateUnit(
    unit: Unit,
  ): void;



  removeUnit(
    id: string,
  ): void;


}




export const useUnitsStore =

create<UnitsStore>((set)=>({



  units: [],




  setUnits(
    units,
  ){

    set({

      units,

    });

  },





  addUnit(
    unit,
  ){

    set(

      (state)=>({

        units:[

          ...state.units,

          unit,

        ],

      }),

    );

  },





  updateUnit(
    unit,
  ){

    set(

      (state)=>({


        units:

          state.units.map(

            (item)=>

              item.id === unit.id

                ? unit

                : item,

          ),


      }),

    );

  },





  removeUnit(
    id,
  ){

    set(

      (state)=>({


        units:

          state.units.filter(

            (item)=>

              item.id !== id,

          ),


      }),

    );

  },


}));