import {
  useEffect,
} from "react";

import {
  usePaymentStore,
} from "../store/payment.store";

import {
  storeContext,
} from "@/core/store/store.context";

export default function PaymentsPage() {

  const payments =
    usePaymentStore(
      (state) =>
        state.payments,
    );

  const loading =
    usePaymentStore(
      (state) =>
        state.loading,
    );

  const error =
    usePaymentStore(
      (state) =>
        state.error,
    );

  const loadPayments =
    usePaymentStore(
      (state) =>
        state.loadPayments,
    );

  useEffect(() => {

    const context =
      storeContext.getStore();

    if (!context?.tenantId) {
      return;
    }

    void loadPayments(
      context.tenantId,
    );

  }, [loadPayments]);

  return (

    <div className="p-6">

      <h1 className="text-xl font-bold">
        Payments
      </h1>

      {loading && (
        <p className="mt-4">
          Loading payments...
        </p>
      )}

      {error && (
        <p className="mt-4 text-red-600">
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        payments.length === 0 && (
          <p className="mt-4">
            No payments found.
          </p>
        )}

      {!loading &&
        payments.length > 0 && (

          <div className="mt-6 overflow-x-auto">

            <table className="w-full border-collapse border">

              <thead>

                <tr className="border">

                  <th className="border p-2 text-left">
                    Method
                  </th>

                  <th className="border p-2 text-left">
                    Amount
                  </th>

                  <th className="border p-2 text-left">
                    Status
                  </th>

                  <th className="border p-2 text-left">
                    Order
                  </th>

                  <th className="border p-2 text-left">
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {payments.map(
                  (payment) => (

                    <tr
                      key={
                        payment.id
                      }
                      className="border"
                    >

                      <td className="border p-2">
                        {payment.method}
                      </td>

                      <td className="border p-2">
                        {payment.amount}
                      </td>

                      <td className="border p-2">
                        {payment.status}
                      </td>

                      <td className="border p-2">
                        {payment.salesOrderId}
                      </td>

                      <td className="border p-2">
                        {new Date(
                          payment.createdAt,
                        ).toLocaleString()}
                      </td>

                    </tr>

                  ),
                )}

              </tbody>

            </table>

          </div>

        )}

    </div>

  );
}
