export interface Unit {

  id: string;

  tenantId: string;

  storeId: string;


  name: string;


  symbol: string;


  description?: string;


  status: "active" | "inactive";


  createdAt: string;

  updatedAt: string;

}