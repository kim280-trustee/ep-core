import {
  SupabaseAuthRepository,
} from "../repositories";


import type {
  Tenant,
  User,
} from "../types";



class AuthService {


  private repository =
    new SupabaseAuthRepository();



  async createTenant(
    tenant: Tenant,
  ) {

    return this.repository.createTenant(
      tenant,
    );

  }



  async createUser(
    user: User,
  ) {

    return this.repository.createUser(
      user,
    );

  }



  async login(
    email: string,
    password: string,
  ) {


    const {
      data,
      error,
    } =
      await this.repository.login(
        email,
        password,
      );



    if (error || !data) {

      return undefined;

    }



    return data;

  }


}



export const authService =
  new AuthService();