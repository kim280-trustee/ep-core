/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Taxes Module
 * ------------------------------------------------------------
 * Tax Type Definitions
 * ============================================================
 */


export enum TaxStatus {

  ACTIVE = "active",

  INACTIVE = "inactive",

}







export interface Tax {


  id:string;


  tenantId:string;


  storeId:string;


  code:string | null;


  name:string;


  rate:number;


  country:string;


  currency:string;


  status:TaxStatus;


  createdAt:string;


  updatedAt:string;


}








export interface CreateTaxDto {


  code?:string | null;


  name:string;


  rate:number;


  country:string;


  currency:string;


}








export interface UpdateTaxDto {


  code?:string | null;


  name?:string;


  rate?:number;


  country?:string;


  currency?:string;


  status?:TaxStatus;


  updatedAt?:string;


}