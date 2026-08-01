import type {
  AuthRepository,
} from "./auth.repository";


import type {
  Tenant,
  User,
} from "../types";



export class InMemoryAuthRepository

implements AuthRepository {


  private tenants: Tenant[] = [];


  private users: User[] = [];



  async createTenant(

    tenant: Tenant,

  ): Promise<Tenant> {


    this.tenants.push(
      tenant,
    );


    return tenant;

  }



  async createUser(

    user: User,

  ): Promise<User> {


    this.users.push(
      user,
    );


    return user;

  }



  async findUserByEmail(

    email: string,

  ): Promise<User | undefined> {


    return this.users.find(

      (user) =>

        user.email === email,

    );

  }



  async login(

    email: string,

    password: string,

  ): Promise<{

    data: User | undefined;

    error?: unknown;

  }> {


    void password;


    const user =

      await this.findUserByEmail(

        email,

      );



    if (!user) {

      return {

        data: undefined,

        error: "User not found",

      };

    }



    return {

      data: user,

    };

  }

}



export const inMemoryAuthRepository =

  new InMemoryAuthRepository();