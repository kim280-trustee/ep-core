/**
 * ============================================================
 * E&P Technologies
 * Smart POS
 * Warehouse Types
 * ============================================================
 */


export type WarehouseStatus =
  | "ACTIVE"
  | "INACTIVE";



export interface Warehouse {


  id: string;


  tenantId: string;


  storeId: string;


  code: string;


  name: string;


  address: string;


  city: string;


  province: string;


  postalCode: string;


  country: string;


  phone?: string;


  managerName?: string;


  status: WarehouseStatus;


  createdAt: Date;


  updatedAt: Date;


}



export type CreateWarehouseDto = {


  code: string;


  name: string;


  address: string;


  city: string;


  province: string;


  postalCode: string;


  country: string;


  phone?: string;


  managerName?: string;


};



export type UpdateWarehouseDto =
  Partial<CreateWarehouseDto>;