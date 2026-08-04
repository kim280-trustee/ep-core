import type {
  PurchaseOrder,
} from "../types/purchase-order.types";



interface PurchaseOrderSummaryProps {

  order: PurchaseOrder;

}



export function PurchaseOrderSummary({

  order,

}: PurchaseOrderSummaryProps) {


  return (

    <div>


      <h3>
        Purchase Summary
      </h3>



      <div>

        <p>

          Subtotal:

          {" "}

          {order.subtotal}

        </p>



        <p>

          Tax Amount:

          {" "}

          {order.taxAmount}

        </p>



        <p>

          Total Amount:

          {" "}

          {order.totalAmount}

        </p>


      </div>


    </div>

  );

}