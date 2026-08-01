import type {
  User,
} from "../types/auth.types";


export class AuthService {

  async login(

    email: string,

    password: string,

  ): Promise<{

    user: User;

    token: string;

  }> {


    void password;


    return {

      user: {

        id: "1",

        name: email,

        email,

        role: "owner",

      },


      token: "demo-token",

    };

  }



  async logout(): Promise<void> {

    return;

  }

}