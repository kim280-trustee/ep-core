import {
  useState,
} from "react";

import {
  inventoryService,
} from "../services/inventory.service";

export function useInventory() {

  const [
    inventory,
    setInventory,
  ] = useState(
    inventoryService.getInventory(),
  );

  function refresh() {

    setInventory(
      inventoryService.getInventory(),
    );

  }

  return {

    inventory,

    refresh,

  };

}