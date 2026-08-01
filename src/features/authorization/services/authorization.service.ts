import {
  authorizationRepository,
} from "../repositories";


import type {
  Permission,
  Role,
} from "../types";



class AuthorizationService {



  createRole(

    role: Role,

  ) {


    return authorizationRepository.createRole(

      role,

    );


  }





  hasPermission(

    userId: string,

    permission: Permission,

  ) {


    const userPermission =

      authorizationRepository.findUserPermission(

        userId,

      );



    if (!userPermission) {


      return false;


    }



    const role =

      authorizationRepository.findRoleById(

        userPermission.roleId,

      );



    if (!role) {


      return false;


    }



    return role.permissions.includes(

      permission,

    );


  }



}



export const authorizationService =

  new AuthorizationService();