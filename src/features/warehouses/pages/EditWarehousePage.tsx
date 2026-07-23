import {
  useNavigate,
  useParams,
} from "react-router-dom";


import {
  WarehouseForm,
} from "../components/WarehouseForm";


import {
  warehouseService,
} from "../services/warehouse.service";



export function EditWarehousePage() {


  const navigate =
    useNavigate();


  const {
    id,
  } = useParams();



  const foundWarehouse =
    id
      ? warehouseService.getWarehouseById(id)
      : undefined;



  if (!foundWarehouse) {

    return (

      <div
        className="p-6"
      >

        Warehouse not found

      </div>

    );

  }



  const warehouse =
    foundWarehouse;



  function handleSubmit(

    data: Parameters<
      typeof warehouseService.createWarehouse
    >[0],

  ) {


    warehouseService.updateWarehouse(

      warehouse.id,

      {

        name:
          data.name,


        code:
          data.code,


        address:
          data.address,


        phone:
          data.phone,

      },

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

        Edit Warehouse

      </h1>



      <WarehouseForm

        defaultValues={{

          name:
            warehouse.name,


          code:
            warehouse.code,


          address:
            warehouse.address,


          phone:
            warehouse.phone,

        }}


        onSubmit={handleSubmit}

      />


    </div>

  );

}