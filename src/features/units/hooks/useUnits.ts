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
  unitService,
} from "../services/unit.service";


import {
  useUnitsStore,
} from "../store/units.store";



export function useUnits() {


  const {

    units,

    setUnits,

    addUnit,

    updateUnit,

    removeUnit,

  } =
  useUnitsStore();




  useEffect(() => {

    setUnits(
      unitService.getUnits(),
    );

  }, [setUnits]);





  function createUnit(

    input: Parameters<
      typeof unitService.createUnit
    >[0],

  ) {


    const unit =

      unitService.createUnit(

        input,

        "default-tenant",

        "default-store",

      );



    addUnit(unit);



    return unit;

  }





  function updateUnitById(

    id: string,

    updates: Parameters<
      typeof unitService.updateUnit
    >[1],

  ) {


    const updated =

      unitService.updateUnit(

        id,

        updates,

      );



    if (updated) {

      updateUnit(updated);

    }



    return updated;

  }





  function deleteUnit(

    id: string,

  ) {


    const deleted =

      unitService.deleteUnit(
        id,
      );



    if (deleted) {

      removeUnit(id);

    }



    return deleted;

  }





  return {

    units,

    createUnit,

    updateUnitById,

    deleteUnit,

  };


}