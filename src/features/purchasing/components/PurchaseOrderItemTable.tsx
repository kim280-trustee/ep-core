import type {
  PurchaseOrderItem,
} from "../types/purchase-order-item.types";


interface PurchaseOrderItemTableProps {

  items: PurchaseOrderItem[];

}


export function PurchaseOrderItemTable({

  items,

}: PurchaseOrderItemTableProps) {


  if (items.length === 0) {

    return (

      <p>
        No purchase order items.
      </p>

    );

  }


  return (

    <table>

      <thead>

        <tr>

          <th>
            Product
          </th>

          <th>
            Ordered
          </th>

          <th>
            Received
          </th>

          <th>
            Unit Cost
          </th>

          <th>
            Tax %
          </th>

          <th>
            Line Total
          </th>

        </tr>

      </thead>


      <tbody>

        {items.map((item) => (

          <tr
            key={item.id}
          >

            <td>
              {item.productId}
            </td>

            <td>
              {item.quantity}
            </td>

            <td>
              {item.receivedQuantity}
            </td>

            <td>
              {item.unitCost}
            </td>

            <td>
              {item.taxRate}
            </td>

            <td>
              {item.lineTotal}
            </td>

          </tr>

        ))}

      </tbody>

    </table>

  );

}