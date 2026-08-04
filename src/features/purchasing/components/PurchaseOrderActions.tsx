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


  const {

    submitOrder,

    approveOrder,

    cancelOrder,

    receiveOrder,

  } = usePurchaseOrderStore();



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




      {order.status === "APPROVED" && (

        <button

          onClick={() =>

            receiveOrder(

              order.id,

            )

          }

        >

          Receive Goods

        </button>

      )}



    </div>

  );

}