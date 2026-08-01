import {
  create,
} from "zustand";


import {
  authorizationEngine,
} from "../engine";


import type {
  Permission,
} from "../types";



interface AuthorizationState {


  can: (

    userId: string,

    permission: Permission,

  ) => boolean;



}



export const useAuthorizationStore =

create<AuthorizationState>(() => ({


  can:

    (

      userId,

      permission,

    ) => {


      return authorizationEngine.can(

        userId,

        permission,

      );


    },



}));