/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Tenant Store
 * ============================================================
 */


import {
  create,
} from "zustand";

import type {
  Tenant,
} from "../types/tenant.types";



interface TenantStore {


  tenants: Tenant[];


  setTenants(
    tenants: Tenant[],
  ): void;


  addTenant(
    tenant: Tenant,
  ): void;


  updateTenant(
    tenant: Tenant,
  ): void;


  removeTenant(
    id: string,
  ): void;


}



export const useTenantStore =
create<TenantStore>(
(set) => ({


  tenants: [],



  setTenants(
    tenants,
  ) {

    set({
      tenants,
    });

  },



  addTenant(
    tenant,
  ) {

    set(
      (state) => ({
        tenants: [
          ...state.tenants,
          tenant,
        ],
      }),
    );

  },



  updateTenant(
    tenant,
  ) {

    set(
      (state) => ({
        tenants:
          state.tenants.map(
            (item) =>
              item.id === tenant.id
                ? tenant
                : item,
          ),
      }),
    );

  },



  removeTenant(
    id,
  ) {

    set(
      (state) => ({
        tenants:
          state.tenants.filter(
            (tenant) =>
              tenant.id !== id,
          ),
      }),
    );

  },


}),
);