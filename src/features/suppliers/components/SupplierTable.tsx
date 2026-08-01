/**
 * ============================================================
 * E&P Technologies
 * Smart POS
 * Supplier Table
 * ============================================================
 */

import type {
  Supplier,
} from "../types/supplier.types";



interface SupplierTableProps {

  suppliers: Supplier[];

  onDelete(
    id: string,
  ): void;

}



export function SupplierTable(
  {
    suppliers,
    onDelete,
  }: SupplierTableProps,
) {


  return (

    <table>

      <thead>

        <tr>

          <th>
            Name
          </th>

          <th>
            Phone
          </th>

          <th>
            Email
          </th>

          <th>
            Action
          </th>

        </tr>

      </thead>


      <tbody>

        {
          suppliers.map(

            (supplier) => (

              <tr
                key={
                  supplier.id
                }
              >

                <td>
                  {supplier.name}
                </td>


                <td>
                  {supplier.phone}
                </td>


                <td>
                  {supplier.email}
                </td>


                <td>

                  <button

                    onClick={
                      () =>
                        onDelete(
                          supplier.id,
                        )
                    }

                  >

                    Delete

                  </button>

                </td>


              </tr>

            ),

          )
        }

      </tbody>


    </table>

  );

}