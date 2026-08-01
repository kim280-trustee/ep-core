import {

  useParams,

} from "react-router-dom";


import {

  warehouseService,

} from "../services/warehouse.service";



export function WarehouseDetailsPage(){


  const {

    id,

  } = useParams();



  const warehouse =

    id

      ? warehouseService.getWarehouseById(id)

      : undefined;



  if(!warehouse){

    return (

      <div>

        Warehouse not found

      </div>

    );

  }



  return (

    <div>


      <h1>

        {warehouse.name}

      </h1>


      <p>

        {warehouse.address}

      </p>


    </div>

  );

}