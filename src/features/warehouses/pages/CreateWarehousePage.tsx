import {

  useNavigate,

} from "react-router-dom";


import {

  WarehouseForm,

} from "../components/WarehouseForm";


import {

  warehouseService,

} from "../services/warehouse.service";


import type {

  WarehouseFormInput,

} from "../validators/warehouse.schema";



export function CreateWarehousePage(){


  const navigate =
    useNavigate();



  function handleSubmit(

    data: WarehouseFormInput,

  ){



    warehouseService.createWarehouse(

      "default-tenant",

      "default-store",

      data,

    );



    navigate(

      "/warehouses",

    );


  }



  return (

    <WarehouseForm

      onSubmit={
        handleSubmit
      }

    />

  );

}