import {
  useSalesOrders,
} from "../hooks/useSalesOrders";



export default function SalesOrderList() {


  const {

    orders,

    confirmOrder,

    processOrder,

    cancelOrder,

  } = useSalesOrders();





  return (

    <div>


      <h2>

        Sales Orders List

      </h2>



      {

        orders.map((order) => (


          <div

            key={order.id}

          >


            <p>

              {order.orderNumber}

            </p>



            <p>

              Status:

              {" "}

              {order.status}

            </p>



            <p>

              Total:

              {" "}

              {order.totalAmount}

            </p>



            <button

              onClick={() =>

                confirmOrder(order.id)

              }

            >

              Confirm

            </button>



            <button

              onClick={() =>

                processOrder(order.id)

              }

            >

              Process Sale

            </button>



            <button

              onClick={() =>

                cancelOrder(order.id)

              }

            >

              Cancel

            </button>


          </div>


        ))

      }


    </div>

  );

}