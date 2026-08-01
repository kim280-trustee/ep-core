import {
  useSuppliersStore,
} from "../store/supplier.store";


import {
  supplierService,
} from "../services/supplier.service";



export function useSuppliers() {



  const {

    suppliers,

    setSuppliers,

    removeSupplier,

  } = useSuppliersStore();





  function refresh() {


    setSuppliers(

      supplierService.getSuppliers(),

    );


  }





  function removeSupplierHandler(

    id:string,

  ){


    supplierService.deleteSupplier(

      id,

    );


    removeSupplier(

      id,

    );


  }





  return {


    suppliers,


    refresh,


    removeSupplier:
      removeSupplierHandler,


    deleteSupplier:
      removeSupplierHandler,


  };


}