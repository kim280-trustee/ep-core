import {
  useInventoryStore,
} from "../store/inventory.store";


import {
  InventoryTable,
  InventorySummaryCards,
} from "../components";


export function InventoryPage() {


  const {
    inventory,
    loadInventory,
  } = useInventoryStore();



  if (inventory.length === 0) {

    loadInventory();

  }



  return (

    <div className="p-6 space-y-6">


      <div>

        <h1 className="text-2xl font-semibold">

          Inventory

        </h1>


        <p className="mt-2 text-gray-600">

          Manage stock levels across warehouses.

        </p>

      </div>



      <InventorySummaryCards

        inventory={inventory}

      />



      <InventoryTable

        inventory={inventory}

      />


    </div>

  );

}