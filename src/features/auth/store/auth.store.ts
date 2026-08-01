import {
  create,
} from "zustand";


import {
  authService,
} from "../services";


import type {
  User,
} from "../types";



interface AuthState {


  user?: User;


  login: (

    email: string,

    password: string,

  ) => Promise<void>;



  logout: () => void;


}



export const useAuthStore =

create<AuthState>((set) => ({



  user: undefined,



  login:

    async (

      email,

      password,

    ) => {


      const user =

        await authService.login(

          email,

          password,

        );



      set({

        user,

      });


    },



  logout:

    () => {


      set({

        user: undefined,

      });


    },



}));