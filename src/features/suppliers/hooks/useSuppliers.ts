/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Suppliers Module
 * ------------------------------------------------------------
 * Suppliers Hook
 * ============================================================
 */


import {

  useSuppliersStore,

} from "../store/supplier.store";



import {

  supplierService,

} from "../services/supplier.service";



import type {

  CreateSupplierDto,

  UpdateSupplierDto,

} from "../types/supplier.types";







export function useSuppliers() {



  const {


    suppliers,


    setSuppliers,


    addSupplier,


    updateSupplier,


    removeSupplier,


  } = useSuppliersStore();









  function refresh(){


    setSuppliers(

      supplierService.getSuppliers(),

    );


  }









  function createSupplier(

    input:CreateSupplierDto,

  ){


    const supplier =


      supplierService.createSupplier(

        input,

        "default-tenant",

        "default-store",

      );




    addSupplier(

      supplier,

    );




    return supplier;


  }









  function updateSupplierById(

    id:string,

    updates:UpdateSupplierDto,

  ){


    const updated =


      supplierService.updateSupplier(

        id,

        updates,

      );




    if(updated){


      updateSupplier(

        updated,

      );


    }



    return updated;


  }









  function deleteSupplier(

    id:string,

  ){


    const deleted =


      supplierService.deleteSupplier(

        id,

      );




    if(deleted){


      removeSupplier(

        id,

      );

    }




    return deleted;


  }









  return {


    suppliers,


    refresh,


    createSupplier,


    updateSupplier:

      updateSupplierById,


    deleteSupplier,



    // backward compatibility

    removeSupplier:

      deleteSupplier,


  };


}