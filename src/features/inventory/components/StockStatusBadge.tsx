import type {
  InventoryStatus,
} from "../types/inventory-status.types";


interface Props {
  status: InventoryStatus;
}


export function StockStatusBadge({
  status,
}: Props) {

  return (

    <span>

      {status}

    </span>

  );

}