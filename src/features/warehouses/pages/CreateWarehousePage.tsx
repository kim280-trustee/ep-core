import {
  useNavigate,
} from "react-router-dom";


import {
  WarehouseForm,
} from "../components/WarehouseForm";


import {
  warehouseService,
} from "../services/warehouse.service";



export function CreateWarehousePage() {


  const navigate =
    useNavigate();



  function handleSubmit(

    data: Parameters<
      typeof warehouseService.createWarehouse
    >[0],

  ) {


    warehouseService.createWarehouse(

      data,

      "default-tenant",

      "default-store",

    );


    navigate("/warehouses");

  }



  return (

    <div
      className="p-6"
    >

      <h1
        className="
          text-2xl
          font-bold
          mb-6
        "
      >

        Create Warehouse

      </h1>



      <WarehouseForm

        onSubmit={handleSubmit}

      />


    </div>

  );

}