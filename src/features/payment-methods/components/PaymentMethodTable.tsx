import {
  Link,
} from "react-router-dom";

import type {
  PaymentMethod,
} from "../types/payment-method.types";

interface PaymentMethodTableProps {

  paymentMethods: PaymentMethod[];

  onDelete: (
    id: string,
  ) => void;

}

export function PaymentMethodTable({

  paymentMethods,

  onDelete,

}: PaymentMethodTableProps) {

  if (paymentMethods.length === 0) {

    return (

      <div
        className="
          border
          rounded
          p-8
          text-center
        "
      >

        No payment methods found.

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

        <tr className="border-b">

          <th className="text-left p-3">
            Name
          </th>

          <th className="text-left p-3">
            Type
          </th>

          <th className="text-left p-3">
            Default
          </th>

          <th className="text-left p-3">
            Active
          </th>

          <th className="text-left p-3">
            Actions
          </th>

        </tr>

      </thead>

      <tbody>

        {paymentMethods.map(

          (paymentMethod) => (

            <tr
              key={paymentMethod.id}
              className="border-b"
            >

              <td className="p-3">
                {paymentMethod.name}
              </td>

              <td className="p-3">
                {paymentMethod.type}
              </td>

              <td className="p-3">
                {paymentMethod.isDefault ? "Yes" : "No"}
              </td>

              <td className="p-3">
                {paymentMethod.isActive ? "Yes" : "No"}
              </td>

              <td
                className="
                  p-3
                  flex
                  gap-3
                "
              >

                <Link
                  to={`/payment-methods/edit/${paymentMethod.id}`}
                  className="underline"
                >

                  Edit

                </Link>

                <button
                  onClick={() =>
                    onDelete(paymentMethod.id)
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