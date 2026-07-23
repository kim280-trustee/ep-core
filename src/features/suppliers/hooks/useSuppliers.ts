import {
  useState,
} from "react";


import {
  supplierService,
} from "../services/supplier.service";



export function useSuppliers() {


  const [
    suppliers,
    setSuppliers,
  ] = useState(
    supplierService.getSuppliers(),
  );



  function refresh() {

    setSuppliers(
      supplierService.getSuppliers(),
    );

  }



  function removeSupplier(
    id: string,
  ) {


    supplierService.deleteSupplier(
      id,
    );


    refresh();

  }



  return {

    suppliers,

    refresh,

    removeSupplier,

  };

}