import {
  ProductStatus,
  type ProductFilters,
} from "../types/product.types";


interface ProductFiltersProps {

  filters:
    ProductFilters;

  onChange:
    (
      filters: ProductFilters,
    ) => void;

}



export function ProductFilters({

  filters,

  onChange,

}: ProductFiltersProps) {


  return (

    <select

      value={
        filters.status ?? "ALL"
      }

      onChange={
        (event)=>{

          onChange({

            ...filters,

            status:
              event.target.value === "ALL"
                ? undefined
                : event.target.value as ProductStatus,

          });

        }
      }

      className="
      h-10
      rounded-lg
      border
      px-3
      "

    >

      <option value="ALL">
        All
      </option>


      <option value={ProductStatus.ACTIVE}>
        Active
      </option>


      <option value={ProductStatus.INACTIVE}>
        Inactive
      </option>


    </select>

  );

}