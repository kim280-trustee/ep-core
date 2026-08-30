import {
  Link,
} from "react-router-dom";


import type {
  Warehouse,
} from "../types/warehouse.types";


interface WarehouseCardProps {

  warehouse: Warehouse;

  onDelete?: (
    id: string,
  ) => void;

}


export function WarehouseCard({
  warehouse,
  onDelete,
}: WarehouseCardProps) {

  return (

    <article>

      <h2>
        {warehouse.name}
      </h2>


      <p>
        Code: {warehouse.code}
      </p>


      <p>
        Country: {warehouse.country}
      </p>


      <p>
        Status: {warehouse.status}
      </p>


      <Link
        to={`/warehouses/${warehouse.id}`}
      >
        View warehouse
      </Link>


      {" "}


      <Link
        to={`/warehouses/${warehouse.id}/edit`}
      >
        Edit
      </Link>


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

    </article>

  );

}
