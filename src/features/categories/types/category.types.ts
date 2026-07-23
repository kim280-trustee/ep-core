export interface Category {

  id: string;

  tenantId: string;

  storeId: string;


  name: string;

  description?: string;


  status: "active" | "inactive";


  createdAt: string;

  updatedAt: string;

}