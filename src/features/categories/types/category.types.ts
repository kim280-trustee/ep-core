/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Categories Module
 * ------------------------------------------------------------
 * Category Type Definitions
 * ============================================================
 */


export enum CategoryStatus {

  ACTIVE = "active",

  INACTIVE = "inactive",

}




export interface Category {


  id: string;


  tenantId: string;


  storeId: string;



  name: string;


  description: string | null;


  parentId: string | null;



  status: CategoryStatus;



  createdAt: string;


  updatedAt: string;


}







export interface CreateCategoryDto {


  name: string;


  description?: string | null;


  parentId?: string | null;


}







export interface UpdateCategoryDto {


  name?: string;


  description?: string | null;


  parentId?: string | null;


  status?: CategoryStatus;


}