export type UserRole =

  | "OWNER"

  | "MANAGER"

  | "STAFF";



export interface Tenant {


  id: string;


  name: string;


  country: string;


  currency: string;


  createdAt: string;


}




export interface User {


  id: string;



  authUserId: string;



  tenantId: string;



  name: string;



  email: string;



  role: UserRole;



  createdAt: string;


}