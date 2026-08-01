import {
  useParams,
} from "react-router-dom";

import {
  usePurchaseOrders,
} from "../hooks/usePurchaseOrders";

export default function PurchaseOrderDetailsPage() {

  const {
    id,
  } = useParams();

  const {

    orders,

    receiveOrder,

  } = usePurchaseOrders();

  const order =
    orders.find(
      (item) =>
        item.id === id,
    );

  if (!order) {

    return (

      <div>

        Purchase Order Not Found

      </div>

    );

  }

  return (

    <div>

      <h1>

        Purchase Order

      </h1>

      <p>

        Order:

        {" "}

        {order.orderNumber}

      </p>

      <p>

        Status:

        {" "}

        {order.status}

      </p>

      <p>

        Supplier:

        {" "}

        {order.supplierId}

      </p>

      <p>

        Warehouse:

        {" "}

        {order.warehouseId}

      </p>

      <h2>

        Items

      </h2>

      {order.items.length === 0 ? (

        <p>

          No Items

        </p>

      ) : (

        order.items.map(

          (item) => (

            <div
              key={item.id}
            >

              <p>

                Product:

                {" "}

                {item.productId}

              </p>

              <p>

                Ordered:

                {" "}

                {item.quantityOrdered}

              </p>

              <p>

                Received:

                {" "}

                {item.quantityReceived}

              </p>

              <p>

                Cost:

                {" "}

                {item.unitCost}

              </p>

            </div>

          ),

        )

      )}

      <hr />

      <p>

        Subtotal:

        {" "}

        {order.subtotal}

      </p>

      <p>

        Tax:

        {" "}

        {order.taxAmount}

      </p>

      <p>

        Total:

        {" "}

        {order.totalAmount}

      </p>

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