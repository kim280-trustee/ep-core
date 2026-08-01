import {
  useEffect,
} from "react";


import {
  usePurchaseOrders,
} from "../hooks/usePurchaseOrders";



export default function PurchaseOrdersPage() {


  const {

    orders,

    loadOrders,

  } = usePurchaseOrders();



  useEffect(() => {

    loadOrders();

  }, [loadOrders]);



  return (

    <div>

      <h1>
        Purchase Orders
      </h1>


      {orders.length === 0 ? (

        <p>
          No purchase orders found.
        </p>

      ) : (

        <div>

          {orders.map((order) => (

            <div
              key={order.id}
            >

              <p>
                {order.orderNumber}
              </p>

              <p>
                Status: {order.status}
              </p>

              <p>
                Total: {order.totalAmount}
              </p>


            </div>

          ))}

        </div>

      )}

    </div>

  );

}