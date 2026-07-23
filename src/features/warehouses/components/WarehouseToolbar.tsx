import {
  Link,
} from "react-router-dom";


interface WarehouseToolbarProps {

  search: string;

  onSearchChange: (
    value: string,
  ) => void;

}



export function WarehouseToolbar({

  search,

  onSearchChange,

}: WarehouseToolbarProps) {


  return (

    <div
      className="
        flex
        gap-4
        mb-6
      "
    >

      <input

        value={search}

        onChange={(event) =>
          onSearchChange(
            event.target.value,
          )
        }

        placeholder="Search warehouses..."

        className="
          border
          rounded
          p-2
          flex-1
        "

      />



      <Link

        to="/warehouses/create"

        className="
          bg-black
          text-white
          px-4
          py-2
          rounded
        "

      >

        Add Warehouse

      </Link>


    </div>

  );

}