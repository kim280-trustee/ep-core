import type {
  Role,
  UserPermission,
} from "../types";



export interface AuthorizationRepository {


  findRoleById(

    id: string,

  ): Role | undefined;



  findUserPermission(

    userId: string,

  ): UserPermission | undefined;



  createRole(

    role: Role,

  ): Role;



}