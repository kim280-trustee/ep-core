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
  useCallback,
  useEffect,
} from "react";

import {
  useSuppliersStore,
} from "../store/supplier.store";

import {
  supplierRepository,
} from "../repositories";

import { SupplierStatus } from "../types/supplier.types";

import type {
  CreateSupplierDto,
  UpdateSupplierDto,
} from "../types/supplier.types";

import {
  storeContext,
} from "@/core/store/store.context";


export function useSuppliers() {

  const suppliers =
    useSuppliersStore(
      (state) =>
        state.suppliers,
    );


  const setSuppliers =
    useSuppliersStore(
      (state) =>
        state.setSuppliers,
    );


  const addSupplier =
    useSuppliersStore(
      (state) =>
        state.addSupplier,
    );


  const updateSupplier =
    useSuppliersStore(
      (state) =>
        state.updateSupplier,
    );


  const removeSupplier =
    useSuppliersStore(
      (state) =>
        state.removeSupplier,
    );


  const refresh =
    useCallback(
      async () => {

        const context =
          storeContext.getStore();


        if (!context?.tenantId) {

          setSuppliers([]);

          return;

        }


        const loaded =
          await supplierRepository.findAll(
            context.tenantId,
            context.storeId,
          );


        setSuppliers(
          loaded,
        );

      },
      [
        setSuppliers,
      ],
    );


  useEffect(
    () => {

      void refresh();

    },
    [
      refresh,
    ],
  );


  async function createSupplier(
    input: CreateSupplierDto,
  ) {

    const context =
      storeContext.getStore();


    if (!context) {

      throw new Error(
        "Store context is not initialized.",
      );

    }


    const supplier =
      await supplierRepository.create({

        id:
          crypto.randomUUID(),

        tenantId:
          context.tenantId,

        storeId:
          context.storeId,

        name:
          input.name,

        contactPerson:
          input.contactPerson ?? null,

        phone:
          input.phone ?? null,

        email:
          input.email ?? null,

        address:
          input.address ?? null,

        taxId:
          input.taxId ?? null,

        paymentTerms:
          input.paymentTerms ?? null,

        status: SupplierStatus.ACTIVE,

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),

      });


    addSupplier(
      supplier,
    );


    return supplier;

  }


  async function updateSupplierById(
    id: string,
    updates: UpdateSupplierDto,
  ) {

    const context =
      storeContext.getStore();


    if (!context) {

      throw new Error(
        "Store context is not initialized.",
      );

    }


    const updated =
      await supplierRepository.update(
        context.tenantId,
        id,
        updates,
      );


    if (updated) {

      updateSupplier(
        updated,
      );

    }


    return updated;

  }


  async function deleteSupplier(
    id: string,
  ) {

    const context =
      storeContext.getStore();


    if (!context) {

      throw new Error(
        "Store context is not initialized.",
      );

    }


    const deleted =
      await supplierRepository.delete(
        context.tenantId,
        id,
      );


    if (deleted) {

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

    removeSupplier:
      deleteSupplier,

  };

}


