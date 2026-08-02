/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Brands Module
 * ------------------------------------------------------------
 * Brand Type Definitions
 * ============================================================
 */


export enum BrandStatus {

  ACTIVE = "active",

  INACTIVE = "inactive",

}





export interface Brand {


  id: string;


  tenantId: string;


  storeId: string;



  name: string;


  code: string | null;


  description: string | null;


  logoUrl: string | null;



  status: BrandStatus;



  createdAt: string;


  updatedAt: string;


}







export interface CreateBrandDto {


  name: string;


  code?: string | null;


  description?: string | null;


  logoUrl?: string | null;


}







export interface UpdateBrandDto {


  name?: string;


  code?: string | null;


  description?: string | null;


  logoUrl?: string | null;


  status?: BrandStatus;


}