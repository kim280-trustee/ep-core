import {
  Link,
} from "react-router-dom";


import type {
  Tax,
} from "../types/tax.types";


interface TaxTableProps {

  taxes: Tax[];

  onDelete: (
    id: string,
  ) => void;

}



export function TaxTable({

  taxes,

  onDelete,

}: TaxTableProps) {


  if (taxes.length === 0) {

    return (

      <div
        className="
          border
          rounded
          p-8
          text-center
        "
      >

        No taxes found.

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
            Rate %
          </th>


          <th className="text-left p-3">
            Country
          </th>


          <th className="text-left p-3">
            Actions
          </th>


        </tr>

      </thead>



      <tbody>

        {taxes.map(

          (tax) => (

            <tr

              key={tax.id}

              className="border-b"

            >

              <td className="p-3">

                {tax.name}

              </td>


              <td className="p-3">

                {tax.rate}%

              </td>


              <td className="p-3">

                {tax.country}

              </td>


              <td
                className="
                  p-3
                  flex
                  gap-3
                "
              >

                <Link

                  to={`/taxes/edit/${tax.id}`}

                  className="underline"

                >

                  Edit

                </Link>



                <button

                  onClick={() =>
                    onDelete(tax.id)
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