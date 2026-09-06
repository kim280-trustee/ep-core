import {
  Link,
} from "react-router-dom";


import type {
  Customer,
} from "../types/customer.types";


interface CustomerTableProps {

  customers: Customer[];

  onDelete: (
    id: string,
  ) => void;

}



export function CustomerTable({

  customers,

  onDelete,

}: CustomerTableProps) {


  if (customers.length === 0) {

    return (

      <div
        className="
          border
          rounded
          p-8
          text-center
        "
      >

        No customers found.

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
            Phone
          </th>


          <th className="text-left p-3">
            Type
          </th>


          <th className="text-left p-3">
            Actions
          </th>


        </tr>

      </thead>



      <tbody>

        {customers.map(

          (customer) => (

            <tr

              key={customer.id}

              className="border-b"

            >

              <td className="p-3">

                {customer.name}

              </td>


              <td className="p-3">

                {customer.phone || "-"}

              </td>


              <td className="p-3">

                {customer.customerType}

              </td>


              <td
                className="
                  p-3
                  flex
                  gap-3
                "
              >

                <Link

                  to={`/customers/${customer.id}/edit`}

                  className="underline"

                >

                  Edit

                </Link>



                <button

                  onClick={() =>
                    onDelete(customer.id)
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
