import {
  useEffect,
} from "react";


import {
  usePaymentStore,
} from "../store/payment.store";


export default function PaymentsPage() {


  const {

    payments,

    loadPayments,

  } = usePaymentStore();



  useEffect(() => {

    loadPayments();

  }, [loadPayments]);



  return (

    <div>

      <h1>

        Payments

      </h1>


      {

        payments.length === 0 ? (

          <p>

            No payments found.

          </p>

        ) : (

          payments.map((payment) => (

            <div
              key={payment.id}
            >

              <p>

                {payment.method}

              </p>

              <p>

                {payment.amount}

              </p>

              <p>

                {payment.status}

              </p>

            </div>

          ))

        )

      }

    </div>

  );

}