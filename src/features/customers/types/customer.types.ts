export interface Customer {

  id: string;

  tenantId: string;

  storeId: string;


  name: string;


  phone?: string;


  email?: string;


  address?: string;


  customerType:
    | "regular"
    | "wholesale";


  creditLimit?: number;


  status:
    | "active"
    | "inactive";


  createdAt: string;

  updatedAt: string;

}