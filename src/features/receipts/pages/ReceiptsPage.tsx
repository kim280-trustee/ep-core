import {
  useReceipts,
} from "../hooks/useReceipts";

export default function ReceiptsPage() {

  const {

    receipts,

  } = useReceipts();

  return (

    <div>

      <h1>

        Receipts

      </h1>

      {

        receipts.length === 0

          ? (

            <p>

              No receipts found.

            </p>

          )

          : (

            receipts.map((receipt) => (

              <div
                key={receipt.id}
              >

                <p>

                  {receipt.receiptNumber}

                </p>

                <p>

                  {receipt.totalAmount}

                </p>

                <p>

                  {receipt.status}

                </p>

              </div>

            ))

          )

      }

    </div>

  );

}