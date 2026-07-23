import {
  useState,
} from "react";


import {
  SupplierToolbar,
} from "../components/SupplierToolbar";


import {
  SupplierTable,
} from "../components/SupplierTable";


import {
  useSuppliers,
} from "../hooks/useSuppliers";



export function SuppliersPage() {


  const {
    suppliers,
    removeSupplier,
  } = useSuppliers();



  const [
    search,
    setSearch,
  ] = useState("");



  const filteredSuppliers =
    suppliers.filter(
      (supplier) =>
        supplier.name
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
    );



  return (

    <div
      className="p-6"
    >

      <h1
        className="
          text-2xl
          font-bold
          mb-6
        "
      >

        Suppliers

      </h1>



      <SupplierToolbar

        search={search}

        onSearchChange={setSearch}

      />



      <SupplierTable

        suppliers={filteredSuppliers}

        onDelete={removeSupplier}

      />


    </div>

  );

}