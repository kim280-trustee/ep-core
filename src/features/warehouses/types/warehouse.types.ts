export interface Warehouse {

  id: string;

  tenantId: string;

  storeId: string;


  name: string;


  code: string;


  address?: string;


  phone?: string;


  status:
    | "active"
    | "inactive";


  createdAt: string;

  updatedAt: string;

}