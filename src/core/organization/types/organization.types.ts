/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Organization Types
 * ============================================================
 */


export type OrganizationStatus =
  | "active"
  | "inactive";



export interface Organization {


  id: string;


  tenantId: string;


  name: string;


  code: string;


  country: string;


  currency: string;


  timezone: string;


  status: OrganizationStatus;


  createdAt: string;


  updatedAt: string;

}