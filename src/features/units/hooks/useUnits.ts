import {
  useState,
} from "react";


import {
  unitService,
} from "../services/unit.service";



export function useUnits() {


  const [
    units,
    setUnits,
  ] = useState(
    unitService.getUnits(),
  );



  function refresh() {

    setUnits(
      unitService.getUnits(),
    );

  }



  function removeUnit(
    id: string,
  ) {


    unitService.deleteUnit(
      id,
    );


    refresh();

  }



  return {

    units,

    refresh,

    removeUnit,

  };

}