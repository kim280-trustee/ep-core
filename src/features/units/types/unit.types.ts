/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Units Module
 * ------------------------------------------------------------
 * Unit Type Definitions
 * ============================================================
 */


export enum UnitStatus {

  ACTIVE = "active",

  INACTIVE = "inactive",

}



export interface Unit {


  id: string;


  tenantId: string;


  storeId: string;


  name: string;


  symbol: string;


  description: string | null;


  status: UnitStatus;


  createdAt: string;


  updatedAt: string;


}



export interface CreateUnitDto {


  name: string;


  symbol: string;


  description?: string | null;


}



export interface UpdateUnitDto {


  name?: string;


  symbol?: string;


  description?: string | null;


  status?: UnitStatus;


}