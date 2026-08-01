/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Suppliers Module
 * ------------------------------------------------------------
 * Supplier Type Definitions
 * ============================================================
 */


export enum SupplierStatus {

  ACTIVE = "active",

  INACTIVE = "inactive",

}




export interface Supplier {


  id: string;


  tenantId: string;


  storeId: string;



  name: string;


  contactPerson: string | null;



  phone: string | null;


  email: string | null;



  address: string | null;



  taxId: string | null;



  paymentTerms: string | null;



  status: SupplierStatus;



  createdAt: string;


  updatedAt: string;


}





export interface CreateSupplierDto {


  name: string;


  contactPerson?: string | null;


  phone?: string | null;


  email?: string | null;


  address?: string | null;


  taxId?: string | null;


  paymentTerms?: string | null;


}





export interface UpdateSupplierDto {


  name?: string;


  contactPerson?: string | null;


  phone?: string | null;


  email?: string | null;


  address?: string | null;


  taxId?: string | null;


  paymentTerms?: string | null;


  status?: SupplierStatus;


}