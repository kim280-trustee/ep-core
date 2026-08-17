import {
  useProductsStore,
} from "@/features/products";

import type {
  InventoryRecord,
} from "../types/inventory-record.types";

interface InventoryTableProps {

  records: InventoryRecord[];

}

export function InventoryTable({
  records,
}: InventoryTableProps) {

  const products =
    useProductsStore(
      (state) =>
        state.products,
    );

  return (

    <table className="w-full border border-collapse">

      <thead>

        <tr>

          <th className="border p-2 text-left">
            Product
          </th>

          <th className="border p-2 text-left">
            Warehouse
          </th>

          <th className="border p-2 text-right">
            On Hand
          </th>

          <th className="border p-2 text-right">
            Available
          </th>

          <th className="border p-2 text-right">
            Average Cost
          </th>

        </tr>

      </thead>

      <tbody>

        {records.map(

          (record) => {

            const product =
              products.find(
                (item) =>
                  item.id ===
                  record.productId,
              );

            return (

              <tr key={record.id}>

                <td className="border p-2">

                  {product
                    ? `${product.name} (${product.identifiers.sku})`
                    : record.productId}

                </td>

                <td className="border p-2">

                  {record.warehouseId}

                </td>

                <td className="border p-2 text-right">

                  {record.quantityOnHand}

                </td>

                <td className="border p-2 text-right">

                  {record.availableQuantity}

                </td>

                <td className="border p-2 text-right">

                  {record.averageCost}

                </td>

              </tr>

            );

          },

        )}

      </tbody>

    </table>

  );

}
