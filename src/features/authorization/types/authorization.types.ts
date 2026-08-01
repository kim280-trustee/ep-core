export type Permission =

  | "CREATE_PRODUCT"

  | "EDIT_PRODUCT"

  | "DELETE_PRODUCT"

  | "VIEW_REPORTS"

  | "PROCESS_SALE"

  | "RECEIVE_STOCK"

  | "MANAGE_USERS";



export type RoleName =

  | "OWNER"

  | "MANAGER"

  | "STAFF";



export interface Role {


  id: string;


  name: RoleName;


  permissions: Permission[];


}



export interface UserPermission {


  userId: string;


  roleId: string;


}