import type {
  AuthorizationRepository,
} from "./authorization.repository";


import type {
  Role,
  UserPermission,
} from "../types";



class InMemoryAuthorizationRepository

implements AuthorizationRepository {



  private roles: Role[] = [];


  private userPermissions: UserPermission[] = [];





  findRoleById(

    id: string,

  ) {


    return this.roles.find(

      (role) =>

        role.id === id,

    );


  }





  findUserPermission(

    userId: string,

  ) {


    return this.userPermissions.find(

      (permission) =>

        permission.userId === userId,

    );


  }





  createRole(

    role: Role,

  ) {


    this.roles.push(

      role,

    );


    return role;


  }



}



export const inMemoryAuthorizationRepository =

  new InMemoryAuthorizationRepository();