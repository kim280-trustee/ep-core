/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Tenant Context
 * ============================================================
 */


import {
  createContext,
} from "react";

import type {
  Tenant,
} from "./types/tenant.types";



export interface TenantContextValue {


  tenant:
    Tenant | null;


  setTenant(
    tenant: Tenant | null,
  ): void;


}



export const TenantContext =
createContext<TenantContextValue | undefined>(
  undefined,
);