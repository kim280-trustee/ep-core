import {
  authorizationService,
} from "../services";


import type {
  Permission,
} from "../types";



class AuthorizationEngine {



  can(

    userId: string,

    permission: Permission,

  ) {


    return authorizationService.hasPermission(

      userId,

      permission,

    );


  }



}



export const authorizationEngine =

  new AuthorizationEngine();