import {
  Link,
} from "react-router-dom";


interface TaxToolbarProps {

  search: string;

  onSearchChange: (
    value: string,
  ) => void;

}



export function TaxToolbar({

  search,

  onSearchChange,

}: TaxToolbarProps) {


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

        placeholder="Search taxes..."

        className="
          border
          rounded
          p-2
          flex-1
        "

      />



      <Link

        to="/taxes/create"

        className="
          bg-black
          text-white
          px-4
          py-2
          rounded
        "

      >

        Add Tax

      </Link>


    </div>

  );

}