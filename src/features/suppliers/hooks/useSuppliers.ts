/**
 * ============================================================
 * E&P Technologies
 * Smart POS
 * Supplier Hook
 * ============================================================
 */


import {
  useEffect,
} from "react";


import {
  supplierService,
} from "../services/supplier.service";


import {
  useSupplierStore,
} from "../store/supplier.store";



export function useSuppliers() {


  const suppliers =
    useSupplierStore(

      state =>
        state.suppliers,

    );



  const setSuppliers =
    useSupplierStore(

      state =>
        state.setSuppliers,

    );



  const addSupplier =
    useSupplierStore(

      state =>
        state.addSupplier,

    );



  const updateSupplier =
    useSupplierStore(

      state =>
        state.updateSupplier,

    );



  const removeSupplier =
    useSupplierStore(

      state =>
        state.removeSupplier,

    );



  useEffect(

    () => {

      setSuppliers(

        supplierService.getSuppliers(),

      );

    },

    [
      setSuppliers,
    ],

  );



  return {

    suppliers,

    addSupplier,

    updateSupplier,

    removeSupplier,

  };

}