import {
  Link,
} from "react-router-dom";


import type {
  Brand,
} from "../types/brand.types";


interface BrandTableProps {

  brands: Brand[];

  onDelete: (
    id: string,
  ) => void;

}



export function BrandTable({

  brands,

  onDelete,

}: BrandTableProps) {


  if (brands.length === 0) {

    return (

      <div
        className="
          border
          rounded
          p-8
          text-center
        "
      >

        No brands found.

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
          className="
            border-b
          "
        >

          <th className="text-left p-3">
            Name
          </th>


          <th className="text-left p-3">
            Description
          </th>


          <th className="text-left p-3">
            Status
          </th>


          <th className="text-left p-3">
            Actions
          </th>


        </tr>

      </thead>



      <tbody>

        {brands.map(

          (brand) => (

            <tr

              key={brand.id}

              className="
                border-b
              "

            >

              <td className="p-3">

                {brand.name}

              </td>


              <td className="p-3">

                {brand.description || "-"}

              </td>


              <td className="p-3">

                {brand.status}

              </td>


              <td
                className="
                  p-3
                  flex
                  gap-3
                "
              >

                <Link

                  to={`/brands/edit/${brand.id}`}

                  className="underline"

                >

                  Edit

                </Link>



                <button

                  onClick={() =>
                    onDelete(brand.id)
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