import {
  Link,
} from "react-router-dom";


interface SupplierToolbarProps {

  search: string;

  onSearchChange: (
    value: string,
  ) => void;

}



export function SupplierToolbar({

  search,

  onSearchChange,

}: SupplierToolbarProps) {


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

        placeholder="Search suppliers..."

        className="
          border
          rounded
          p-2
          flex-1
        "

      />



      <Link

        to="/suppliers/create"

        className="
          bg-black
          text-white
          px-4
          py-2
          rounded
        "

      >

        Add Supplier

      </Link>


    </div>

  );

}