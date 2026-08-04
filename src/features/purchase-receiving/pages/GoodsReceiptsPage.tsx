import {
  useEffect,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useGoodsReceipts,
} from "../hooks/useGoodsReceipts";


export default function GoodsReceiptsPage() {

  const navigate = useNavigate();

  const {

    receipts,

    loadReceipts,

  } = useGoodsReceipts();


  useEffect(() => {

    loadReceipts();

  }, [loadReceipts]);


  return (

    <div>

      <h1>

        Goods Receipts

      </h1>


      <button

        onClick={() =>

          navigate(

            "/purchase-receiving/create",

          )

        }

      >

        Create Goods Receipt

      </button>


      {receipts.length === 0 ? (

        <p>

          No goods receipts found.

        </p>

      ) : (

        <table>

          <thead>

            <tr>

              <th>

                Receipt

              </th>

              <th>

                Purchase Order

              </th>

              <th>

                Supplier

              </th>

              <th>

                Warehouse

              </th>

              <th>

                Date

              </th>

            </tr>

          </thead>

          <tbody>

            {receipts.map((receipt) => (

              <tr

                key={receipt.id}

                onClick={() =>

                  navigate(

                    `/purchase-receiving/${receipt.id}`,

                  )

                }

                style={{

                  cursor: "pointer",

                }}

              >

                <td>

                  {receipt.id}

                </td>

                <td>

                  {receipt.purchaseOrderId}

                </td>

                <td>

                  {receipt.supplierId}

                </td>

                <td>

                  {receipt.warehouseId}

                </td>

                <td>

                  {receipt.receivedDate}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </div>

  );

}