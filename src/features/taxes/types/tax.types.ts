export interface Tax {

  id: string;

  tenantId: string;

  storeId: string;


  name: string;


  rate: number;


  country: string;


  currency: string;


  status:
    | "active"
    | "inactive";


  createdAt: string;

  updatedAt: string;

}