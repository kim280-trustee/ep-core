import type {

  Warehouse,

} from "../types/warehouse.types";



interface Props {

  warehouse:Warehouse;

}



export function WarehouseCard({

  warehouse,

}:Props){


  return (

    <div>

      <h3>

        {warehouse.name}

      </h3>


      <p>

        {warehouse.code}

      </p>


      <p>

        {warehouse.city}

      </p>


    </div>

  );

}