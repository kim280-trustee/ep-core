import type {
  InventoryFilter,
} from "../types/inventory-filter.types";


interface Props {

  filters: InventoryFilter;

  onChange: (
    filters: InventoryFilter,
  ) => void;

}



export function InventoryFilters({

  filters,

  onChange,

}: Props) {


  return (

    <div className="flex flex-wrap gap-3 rounded border p-4">


      <input

        placeholder="Search"

        value={filters.search ?? ""}

        onChange={(e) =>
          onChange({

            ...filters,

            search:
              e.target.value,

          })
        }

        className="border p-2"

      />



      <input

        placeholder="Product ID"

        value={filters.productId ?? ""}

        onChange={(e) =>
          onChange({

            ...filters,

            productId:
              e.target.value,

          })
        }

        className="border p-2"

      />



      <input

        placeholder="Warehouse ID"

        value={filters.warehouseId ?? ""}

        onChange={(e) =>
          onChange({

            ...filters,

            warehouseId:
              e.target.value,

          })
        }

        className="border p-2"

      />



      <select

        value={filters.status ?? ""}

        onChange={(e) =>
          onChange({

            ...filters,

            status:
              e.target.value
                ? e.target.value as InventoryFilter["status"]
                : undefined,

          })
        }

        className="border p-2"

      >

        <option value="">
          All Status
        </option>

        <option value="IN_STOCK">
          In Stock
        </option>

        <option value="LOW_STOCK">
          Low Stock
        </option>

        <option value="OUT_OF_STOCK">
          Out Of Stock
        </option>

        <option value="OVERSTOCKED">
          Overstocked
        </option>


      </select>



      <label className="flex items-center gap-2">


        <input

          type="checkbox"

          checked={
            filters.includeZeroStock ?? false
          }

          onChange={(e) =>
            onChange({

              ...filters,

              includeZeroStock:
                e.target.checked,

            })
          }

        />


        Include zero stock


      </label>


    </div>

  );

}