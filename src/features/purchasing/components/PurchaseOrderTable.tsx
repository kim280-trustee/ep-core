import {
  useNavigate,
} from "react-router-dom";


import type {
  PurchaseOrder,
} from "../types/purchase-order.types";


import {
  PurchaseOrderStatusBadge,
} from "./PurchaseOrderStatusBadge";


interface PurchaseOrderTableProps {

  orders: PurchaseOrder[];

}



export function PurchaseOrderTable({

  orders,

}: PurchaseOrderTableProps) {


  const navigate = useNavigate();



  return (

    <div>


      <h2>

        Purchase Orders

      </h2>



      {orders.length === 0 ? (

        <p>

          No purchase orders found.

        </p>

      ) : (


        <table>


          <thead>

            <tr>

              <th>
                Order Number
              </th>


              <th>
                Supplier
              </th>


              <th>
                Status
              </th>


              <th>
                Total
              </th>


              <th>
                Created
              </th>


            </tr>

          </thead>



          <tbody>


            {orders.map(

              (order) => (


                <tr

                  key={order.id}

                  onClick={() =>

                    navigate(

                      `/purchasing/${order.id}`,

                    )

                  }

                >


                  <td>

                    {order.orderNumber}

                  </td>



                  <td>

                    {order.supplierId}

                  </td>



                  <td>

                    <PurchaseOrderStatusBadge

                      status={order.status}

                    />

                  </td>



                  <td>

                    {order.totalAmount}

                  </td>



                  <td>

                    {order.createdAt}

                  </td>



                </tr>


              ),

            )}



          </tbody>


        </table>


      )}


    </div>

  );

}