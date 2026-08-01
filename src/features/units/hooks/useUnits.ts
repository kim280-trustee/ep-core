/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Units Module
 * ------------------------------------------------------------
 * Units Hook
 * ============================================================
 */


import {

  useEffect,

} from "react";


import {

  useUnitsStore,

} from "../store/units.store";


import type {

  CreateUnitDto,

  UpdateUnitDto,

} from "../types/unit.types";







export function useUnits(){





  const {


    units,


    loadUnits,


    createUnit: createUnitStore,


    updateUnit: updateUnitStore,


    deleteUnit: deleteUnitStore,



  } = useUnitsStore();









  useEffect(()=>{


    loadUnits();


  },[loadUnits]);









  function createUnit(

    input:CreateUnitDto,

  ){


    createUnitStore(

      input,

      "default-tenant",

      "default-store",

    );


  }









  function updateUnitById(

    id:string,

    updates:UpdateUnitDto,

  ){



    updateUnitStore(

      id,

      updates,

    );



  }









  function deleteUnit(

    id:string,

  ){


    deleteUnitStore(

      id,

    );


  }









  return {


    units,


    createUnit,


    updateUnitById,


    deleteUnit,


  };



}