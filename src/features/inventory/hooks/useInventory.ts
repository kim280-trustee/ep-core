import {
  useCallback,
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

  const refresh = useCallback(() => {

    setInventory(
      inventoryService.getInventory(),
    );

  }, []);

  return {

    inventory,

    refresh,

  };

}