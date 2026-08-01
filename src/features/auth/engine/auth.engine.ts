import {
  authService,
} from "../services";


export class AuthEngine {


  login(

    email: string,

    password: string,

  ) {


    return authService.login(

      email,

      password,

    );

  }



}



export const authEngine =

  new AuthEngine();