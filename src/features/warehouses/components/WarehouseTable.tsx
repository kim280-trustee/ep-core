import {
  Link,
} from "react-router-dom";


import type {
  Warehouse,
} from "../types/warehouse.types";


interface WarehouseTableProps {

  warehouses: Warehouse[];

  onDelete: (
    id: string,
  ) => void;

}



export function WarehouseTable({

  warehouses,

  onDelete,

}: WarehouseTableProps) {


  if (warehouses.length === 0) {

    return (

      <div
        className="
          border
          rounded
          p-8
          text-center
        "
      >

        No warehouses found.

      </div>

    );

  }



  return (

    <table
      className="
        w-full
        border-collapse
      "
    >

      <thead>

        <tr
          className="border-b"
        >

          <th className="text-left p-3">
            Name
          </th>


          <th className="text-left p-3">
            Code
          </th>


          <th className="text-left p-3">
            Phone
          </th>


          <th className="text-left p-3">
            Actions
          </th>


        </tr>

      </thead>



      <tbody>

        {warehouses.map(

          (warehouse) => (

            <tr

              key={warehouse.id}

              className="border-b"

            >

              <td className="p-3">

                {warehouse.name}

              </td>


              <td className="p-3">

                {warehouse.code}

              </td>


              <td className="p-3">

                {warehouse.phone || "-"}

              </td>


              <td
                className="
                  p-3
                  flex
                  gap-3
                "
              >

                <Link

                  to={`/warehouses/edit/${warehouse.id}`}

                  className="underline"

                >

                  Edit

                </Link>



                <button

                  onClick={() =>
                    onDelete(warehouse.id)
                  }

                  className="text-red-600"

                >

                  Delete

                </button>


              </td>


            </tr>

          ),

        )}

      </tbody>


    </table>

  );

}