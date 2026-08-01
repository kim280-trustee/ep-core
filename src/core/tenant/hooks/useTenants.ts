/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Tenant Hook
 * ============================================================
 */


import {
  useTenantStore,
} from "../store/tenant.store";



export function useTenants() {


  const tenants =
    useTenantStore(
      (state) =>
        state.tenants,
    );


  const setTenants =
    useTenantStore(
      (state) =>
        state.setTenants,
    );


  const addTenant =
    useTenantStore(
      (state) =>
        state.addTenant,
    );


  const updateTenant =
    useTenantStore(
      (state) =>
        state.updateTenant,
    );


  const removeTenant =
    useTenantStore(
      (state) =>
        state.removeTenant,
    );


  return {

    tenants,

    setTenants,

    addTenant,

    updateTenant,

    removeTenant,

  };

}