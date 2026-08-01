export type TaxStatus =
  | "ACTIVE"
  | "INACTIVE";


export interface Tax {


  id:string;


  tenantId:string;


  storeId:string;


  code?:string;


  name:string;


  rate:number;


  country:string;


  currency:string;


  status:TaxStatus;


  createdAt:Date;


  updatedAt:Date;


}



export type CreateTaxDto = {


  name:string;


  rate:number;


  country:string;


  currency:string;


  code?:string;


};



export type UpdateTaxDto =

Partial<CreateTaxDto>;