import {
  Link,
} from "react-router-dom";


interface WarehouseToolbarProps {

  onReload?: () => void;

}


export function WarehouseToolbar({
  onReload,
}: WarehouseToolbarProps) {

  return (

    <div>

      <Link
        to="/warehouses/create"
      >
        Create Warehouse
      </Link>


      {onReload && (

        <button
          type="button"
          onClick={onReload}
        >
          Refresh
        </button>

      )}

    </div>

  );

}
