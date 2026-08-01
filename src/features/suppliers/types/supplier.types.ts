/**
 * ============================================================
 * E&P Technologies
 * Smart POS
 * Supplier Types
 * ============================================================
 */


export type SupplierStatus =
  | "ACTIVE"
  | "INACTIVE";



export interface Supplier {


  id: string;


  tenantId: string;


  storeId: string;


  code: string;


  name: string;


  contactPerson: string;


  email: string;


  phone: string;


  taxId?: string;


  address: string;


  city: string;


  province: string;


  postalCode: string;


  country: string;


  notes?: string;


  status: SupplierStatus;


  createdAt: Date;


  updatedAt: Date;


}



export type CreateSupplierDto = {


  tenantId: string;


  storeId: string;


  code: string;


  name: string;


  contactPerson: string;


  email: string;


  phone: string;


  taxId?: string;


  address: string;


  city: string;


  province: string;


  postalCode: string;


  country: string;


  notes?: string;


};



export type UpdateSupplierDto = Partial<

  Omit<

    CreateSupplierDto,

    "tenantId"

    | "storeId"

  >

>;