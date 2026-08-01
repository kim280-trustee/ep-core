import type {
  Tenant,
  User,
} from "../types";



export interface AuthRepository {



  createTenant(

    tenant: Tenant,

  ): Promise<Tenant>;




  createUser(

    user: User,

  ): Promise<User>;




  findUserByEmail(

    email: string,

  ): Promise<User | undefined>;




  login(

    email: string,

    password: string,

  ): Promise<{

    data: User | undefined;

    error?: unknown;

  }>;


}