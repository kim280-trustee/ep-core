/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Tenant Provider
 * ============================================================
 */


import {
  useState,
  type ReactNode,
} from "react";


import {
  TenantContext,
} from "./tenant.context";


import type {
  Tenant,
} from "./types/tenant.types";



interface TenantProviderProps {

  children: ReactNode;

}



export function TenantProvider(
  {
    children,
  }: TenantProviderProps,
) {


  const [
    tenant,
    setTenant,
  ] =
  useState<Tenant | null>(
    null,
  );



  return (

    <TenantContext.Provider
      value={{
        tenant,
        setTenant,
      }}
    >

      {children}

    </TenantContext.Provider>

  );

}