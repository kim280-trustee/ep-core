import type {
  InventoryRecord,
} from "../types/inventory-record.types";


interface Props {

  inventory: InventoryRecord[];

}


export function InventorySummaryCards({
  inventory,
}: Props) {


  const totalItems =
    inventory.reduce(
      (total, item) =>
        total + item.quantityOnHand,
      0,
    );


  const inventoryValue =
    inventory.reduce(
      (total, item) =>
        total +
        (
          item.quantityOnHand *
          item.averageCost
        ),
      0,
    );


  return (

    <div className="grid gap-4 md:grid-cols-2">

      <div className="rounded border p-4">

        <h3>
          Total Quantity
        </h3>

        <p className="text-xl">

          {totalItems}

        </p>

      </div>


      <div className="rounded border p-4">

        <h3>
          Inventory Value
        </h3>

        <p className="text-xl">

          {inventoryValue}

        </p>

      </div>

    </div>

  );

}