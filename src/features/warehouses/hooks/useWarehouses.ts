import {
  useState,
} from "react";


import {
  warehouseService,
} from "../services/warehouse.service";



export function useWarehouses() {


  const [
    warehouses,
    setWarehouses,
  ] = useState(
    warehouseService.getWarehouses(),
  );



  function refresh() {

    setWarehouses(
      warehouseService.getWarehouses(),
    );

  }



  function removeWarehouse(
    id: string,
  ) {


    warehouseService.deleteWarehouse(
      id,
    );


    refresh();

  }



  return {

    warehouses,

    refresh,

    removeWarehouse,

  };

}