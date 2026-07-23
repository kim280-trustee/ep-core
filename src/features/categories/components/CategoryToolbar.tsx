import {
  Link,
} from "react-router-dom";


interface CategoryToolbarProps {

  search: string;

  onSearchChange: (
    value: string,
  ) => void;

}



export function CategoryToolbar({

  search,

  onSearchChange,

}: CategoryToolbarProps) {


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

        placeholder="Search categories..."

        className="
          border
          rounded
          p-2
          flex-1
        "

      />


      <Link

        to="/categories/create"

        className="
          bg-black
          text-white
          px-4
          py-2
          rounded
        "

      >

        Add Category

      </Link>


    </div>

  );

}