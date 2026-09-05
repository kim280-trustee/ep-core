import {
  useEffect,
  useState,
} from "react";


import {
  useNavigate,
} from "react-router-dom";


import type {
  PurchaseOrder,
} from "../types/purchase-order.types";


import {
  PurchaseOrderStatusBadge,
} from "./PurchaseOrderStatusBadge";


import {
  supplierService,
} from "@/features/suppliers/services/supplier.service";



interface PurchaseOrderTableProps {

  orders: PurchaseOrder[];

}



export function PurchaseOrderTable({

  orders,

}: PurchaseOrderTableProps) {


  const navigate = useNavigate();


  const [
    supplierNames,
    setSupplierNames,
  ] = useState<Record<string, string>>({});


  useEffect(() => {

    let cancelled = false;


    async function loadSupplierNames() {

      if (orders.length === 0) {

        setSupplierNames({});

        return;

      }


      const tenantId =
        orders[0].tenantId;


      try {

        const suppliers =
          await supplierService.getSuppliers(
            tenantId,
          );


        if (cancelled) {

          return;

        }


        const names:
          Record<string, string> = {};


        for (
          const supplier of suppliers
        ) {

          names[supplier.id] =
            supplier.name;

        }


        setSupplierNames(names);

      } catch (error) {

        console.error(
          "Failed to load purchase order suppliers:",
          error,
        );

      }

    }


    void loadSupplierNames();


    return () => {

      cancelled = true;

    };

  }, [orders]);


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

                    {supplierNames[
                      order.supplierId
                    ] ??
                      order.supplierId}

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

