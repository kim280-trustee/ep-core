import {
  Link,
} from "react-router-dom";


import type {
  Warehouse,
} from "../types/warehouse.types";


interface WarehouseTableProps {

  warehouses: Warehouse[];

  onDelete?: (
    id: string,
  ) => void;

}


export function WarehouseTable({
  warehouses,
  onDelete,
}: WarehouseTableProps) {

  return (

    <table>

      <thead>

        <tr>

          <th>
            Code
          </th>

          <th>
            Name
          </th>

          <th>
            Status
          </th>

          <th>
            Actions
          </th>

        </tr>

      </thead>


      <tbody>

        {warehouses.map(
          warehouse => (

            <tr
              key={
                warehouse.id
              }
            >

              <td>
                {warehouse.code}
              </td>

              <td>
                {warehouse.name}
              </td>

              <td>
                {warehouse.status}
              </td>

              <td>

                <Link
                  to={`/warehouses/${warehouse.id}`}
                >
                  View
                </Link>


                {" "}


                <Link
                  to={`/warehouses/${warehouse.id}/edit`}
                >
                  Edit
                </Link>


                {" "}


                {onDelete && (

                  <button
                    type="button"
                    onClick={() =>
                      onDelete(
                        warehouse.id,
                      )
                    }
                  >
                    Delete
                  </button>

                )}

              </td>

            </tr>

          ),
        )}

      </tbody>

    </table>

  );

}
