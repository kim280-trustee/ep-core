import {
  useEffect,
} from "react";

import {
  useInventory,
} from "../hooks/useInventory";

import {
  useInventoryStore,
} from "../store/inventory.store";

import {
  InventoryToolbar,
} from "../components/InventoryToolbar";

import {
  InventoryTable,
} from "../components/InventoryTable";


export function InventoryPage() {

  const {

    inventory,

    refresh,

  } = useInventory();


  const {

    records,

    setRecords,

  } = useInventoryStore();


  useEffect(

    () => {

      refresh();

    },

    [],

  );


  useEffect(

    () => {

      setRecords(

        inventory,

      );

    },

    [

      inventory,

      setRecords,

    ],

  );


  return (

    <div className="p-6">

      <InventoryToolbar

        onRefresh={refresh}

      />

      <InventoryTable

        records={records}

      />

    </div>

  );

}