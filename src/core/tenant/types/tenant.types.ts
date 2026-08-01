/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Tenant Core
 * ------------------------------------------------------------
 * Tenant Domain Types
 * ============================================================
 */


export type TenantStatus =
  | "active"
  | "inactive"
  | "suspended";



export interface Tenant {


  id: string;


  name: string;


  code: string;


  country: string;


  currency: string;


  status: TenantStatus;


  createdAt: string;


  updatedAt: string;


}