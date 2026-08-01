import {

  warehouseService,

} from "../services/warehouse.service";


export function useWarehouseActions(){


  function removeWarehouse(

    id:string,

  ){


    return warehouseService.deleteWarehouse(

      id,

    );


  }



  return {


    removeWarehouse,


  };


}