import {
  Link,
} from "react-router-dom";


import type {
  Unit,
} from "../types/unit.types";


interface UnitTableProps {

  units: Unit[];

  onDelete: (
    id: string,
  ) => void;

}



export function UnitTable({

  units,

  onDelete,

}: UnitTableProps) {


  if (units.length === 0) {

    return (

      <div
        className="
          border
          rounded
          p-8
          text-center
        "
      >

        No units found.

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
            Symbol
          </th>


          <th className="text-left p-3">
            Description
          </th>


          <th className="text-left p-3">
            Actions
          </th>


        </tr>

      </thead>



      <tbody>

        {units.map(

          (unit) => (

            <tr

              key={unit.id}

              className="border-b"

            >

              <td className="p-3">

                {unit.name}

              </td>


              <td className="p-3">

                {unit.symbol}

              </td>


              <td className="p-3">

                {unit.description || "-"}

              </td>


              <td
                className="
                  p-3
                  flex
                  gap-3
                "
              >

                <Link

                  to={`/units/edit/${unit.id}`}

                  className="underline"

                >

                  Edit

                </Link>



                <button

                  onClick={() =>
                    onDelete(unit.id)
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