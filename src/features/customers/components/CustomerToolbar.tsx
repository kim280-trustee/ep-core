import {
  Link,
} from "react-router-dom";


interface CustomerToolbarProps {

  search: string;

  onSearchChange: (
    value: string,
  ) => void;

}



export function CustomerToolbar({

  search,

  onSearchChange,

}: CustomerToolbarProps) {


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

        placeholder="Search customers..."

        className="
          border
          rounded
          p-2
          flex-1
        "

      />



      <Link

        to="/customers/create"

        className="
          bg-black
          text-white
          px-4
          py-2
          rounded
        "

      >

        Add Customer

      </Link>


    </div>

  );

}