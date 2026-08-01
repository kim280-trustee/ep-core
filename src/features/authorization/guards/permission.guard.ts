import type {
  Permission,
} from "../types";


import {
  authorizationEngine,
} from "../engine";



export function permissionGuard(

  userId: string,

  permission: Permission,

) {


  return authorizationEngine.can(

    userId,

    permission,

  );


}