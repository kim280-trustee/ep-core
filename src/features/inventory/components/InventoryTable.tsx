import type {
  InventoryRecord,
} from "../types/inventory-record.types";


interface Props {

  inventory: InventoryRecord[];

}


export function InventoryTable({
  inventory,
}: Props) {


  return (

    <div>

      <table className="w-full border-collapse">

        <thead>

          <tr>

            <th className="border p-2">
              Product
            </th>

            <th className="border p-2">
              Warehouse
            </th>

            <th className="border p-2">
              On Hand
            </th>

            <th className="border p-2">
              Reserved
            </th>

            <th className="border p-2">
              Available
            </th>

            <th className="border p-2">
              Cost
            </th>

          </tr>

        </thead>


        <tbody>

          {inventory.map((record) => (

            <tr key={record.id}>

              <td className="border p-2">
                {record.productId}
              </td>

              <td className="border p-2">
                {record.warehouseId}
              </td>

              <td className="border p-2">
                {record.quantityOnHand}
              </td>

              <td className="border p-2">
                {record.reservedQuantity}
              </td>

              <td className="border p-2">
                {record.availableQuantity}
              </td>

              <td className="border p-2">
                {record.averageCost}
              </td>

            </tr>

          ))}

        </tbody>


      </table>

    </div>

  );

}