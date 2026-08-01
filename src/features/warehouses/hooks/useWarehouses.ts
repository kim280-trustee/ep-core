import {

  useEffect,

} from "react";


import {

  warehouseService,

} from "../services/warehouse.service";


import {

  useWarehouseStore,

} from "../store/warehouse.store";



export function useWarehouses(){


  const {

    warehouses,

    setWarehouses,

  } =
    useWarehouseStore();



  useEffect(()=>{


    setWarehouses(

      warehouseService.getWarehouses(),

    );


  },[setWarehouses]);



  return {


    warehouses,


  };


}