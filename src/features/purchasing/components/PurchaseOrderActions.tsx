import {
  useNavigate,
} from "react-router-dom";

import type {
  PurchaseOrder,
} from "../types/purchase-order.types";

import {
  usePurchaseOrderStore,
} from "../store/purchase-order.store";


interface PurchaseOrderActionsProps {

  order: PurchaseOrder;

}


export function PurchaseOrderActions({

  order,

}: PurchaseOrderActionsProps) {

  const navigate =
    useNavigate();


  const {

    submitOrder,

    approveOrder,

    cancelOrder,

  } =
    usePurchaseOrderStore();


  return (

    <div>

      {order.status === "DRAFT" && (

        <button
          onClick={() =>
            submitOrder(
              order.id,
            )
          }
        >
          Submit Order
        </button>

      )}


      {order.status === "SUBMITTED" && (

        <>

          <button
            onClick={() =>
              approveOrder(
                order.id,
              )
            }
          >
            Approve Order
          </button>


          <button
            onClick={() =>
              cancelOrder(
                order.id,
              )
            }
          >
            Cancel Order
          </button>

        </>

      )}


      {(
        order.status === "APPROVED" ||
        order.status === "PARTIALLY_RECEIVED"
      ) && (

        <button
          onClick={() =>
            navigate(
              `/purchase-receiving/create?purchaseOrderId=${order.id}`,
            )
          }
        >
          Receive Goods
        </button>

      )}

      {(order.status === "RECEIVED" ||
        order.status === "PARTIALLY_RECEIVED") && (
        <button
          onClick={() =>
            navigate(
              `/purchasing/returns/create?purchaseOrderId=${order.id}`,
            )
          }
        >
          Purchase Return
        </button>
      )}

    </div>

  );

}



