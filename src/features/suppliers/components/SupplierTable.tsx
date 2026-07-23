import {
  Link,
} from "react-router-dom";


import type {
  Supplier,
} from "../types/supplier.types";


interface SupplierTableProps {

  suppliers: Supplier[];

  onDelete: (
    id: string,
  ) => void;

}



export function SupplierTable({

  suppliers,

  onDelete,

}: SupplierTableProps) {


  if (suppliers.length === 0) {

    return (

      <div
        className="
          border
          rounded
          p-8
          text-center
        "
      >

        No suppliers found.

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
            Contact
          </th>


          <th className="text-left p-3">
            Phone
          </th>


          <th className="text-left p-3">
            Actions
          </th>


        </tr>

      </thead>



      <tbody>

        {suppliers.map(

          (supplier) => (

            <tr

              key={supplier.id}

              className="border-b"

            >

              <td className="p-3">

                {supplier.name}

              </td>


              <td className="p-3">

                {supplier.contactPerson || "-"}

              </td>


              <td className="p-3">

                {supplier.phone || "-"}

              </td>


              <td
                className="
                  p-3
                  flex
                  gap-3
                "
              >

                <Link

                  to={`/suppliers/edit/${supplier.id}`}

                  className="underline"

                >

                  Edit

                </Link>



                <button

                  onClick={() =>
                    onDelete(supplier.id)
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