import {
  Link,
} from "react-router-dom";


import {
  ProductSearch,
} from "./ProductSearch";


import {
  ProductFilters,
} from "./ProductFilters";


interface ProductToolbarProps {

  search: string;

  onSearchChange: (
    value: string,
  ) => void;


  status: string;

  onStatusChange: (
    value: string,
  ) => void;

}


export function ProductToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,

}: ProductToolbarProps) {


  return (

    <div
      className="
        flex
        gap-4
        items-center
        mb-6
      "
    >

      <ProductSearch
        value={search}
        onChange={onSearchChange}
      />


      <ProductFilters
        status={status}
        onChange={onStatusChange}
      />


      <Link
        to="/products/create"
        className="
          bg-black
          text-white
          px-4
          py-2
          rounded
          whitespace-nowrap
        "
      >
        Add Product
      </Link>

    </div>

  );

}