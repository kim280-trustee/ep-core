export interface Supplier {

  id: string;

  tenantId: string;

  storeId: string;


  name: string;


  contactPerson?: string;


  phone?: string;


  email?: string;


  address?: string;


  taxId?: string;


  status: "active" | "inactive";


  createdAt: string;

  updatedAt: string;

}