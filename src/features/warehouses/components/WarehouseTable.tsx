import type {
  Warehouse,
} from "../types/warehouse.types";


interface Props {

  warehouses:Warehouse[];

  onDelete(
    id:string
  ):void;

}


export function WarehouseTable({

  warehouses,

  onDelete,

}:Props){


  return (

    <div>

      {
        warehouses.map(

          warehouse => (

            <div

              key={
                warehouse.id
              }

            >

              <span>

                {warehouse.name}

              </span>


              <button

                onClick={()=>


                  onDelete(
                    warehouse.id
                  )

                }

              >

                Delete

              </button>


            </div>

          )

        )

      }

    </div>

  );

}