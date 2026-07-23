import {
  Link,
} from "react-router-dom";


interface BrandToolbarProps {

  search: string;

  onSearchChange: (
    value: string,
  ) => void;

}



export function BrandToolbar({

  search,

  onSearchChange,

}: BrandToolbarProps) {


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

        placeholder="Search brands..."

        className="
          border
          rounded
          p-2
          flex-1
        "

      />


      <Link

        to="/brands/create"

        className="
          bg-black
          text-white
          px-4
          py-2
          rounded
        "

      >

        Add Brand

      </Link>


    </div>

  );

}