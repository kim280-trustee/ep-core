import {
  supabase,
} from "../../../core/database";


import type {
  AuthRepository,
} from "./auth.repository";


import type {
  Tenant,
  User,
} from "../types";



export class SupabaseAuthRepository

implements AuthRepository {



  async createTenant(

    tenant: Tenant,

  ): Promise<Tenant> {


    const {
      data,
      error,
    } =
      await supabase

        .from("tenants")

        .insert({

          id: tenant.id,

          name: tenant.name,

          country: tenant.country,

          currency: tenant.currency,

        })

        .select()

        .single();




    if (error) {

      throw error;

    }




    return {

      id: data.id,

      name: data.name,

      country: data.country,

      currency: data.currency,

      createdAt:
        data.created_at,

    };

  }





  async createUser(

    user: User,

  ): Promise<User> {


    const {
      data,
      error,
    } =
      await supabase

        .from("users")

        .insert({

          id: user.id,

          auth_user_id:
            user.authUserId,

          tenant_id:
            user.tenantId,

          name:
            user.name,

          email:
            user.email,

        })

        .select()

        .single();




    if (error) {

      throw error;

    }




    return {

      id:
        data.id,

      authUserId:
        data.auth_user_id,

      tenantId:
        data.tenant_id,

      name:
        data.name,

      email:
        data.email,

      role:
        "STAFF",

      createdAt:
        data.created_at,

    };

  }





  async findUserByEmail(

    email: string,

  ): Promise<User | undefined> {


    const {
      data,
      error,
    } =
      await supabase

        .from("users")

        .select("*")

        .eq(

          "email",

          email,

        )

        .single();




    if (error || !data) {

      return undefined;

    }




    return {

      id:
        data.id,

      authUserId:
        data.auth_user_id,

      tenantId:
        data.tenant_id,

      name:
        data.name,

      email:
        data.email,

      role:
        "STAFF",

      createdAt:
        data.created_at,

    };

  }





  async login(

    email: string,

    password: string,

  ) {


    const {
      data: authData,
      error,
    } =
      await supabase.auth.signInWithPassword({

        email,

        password,

      });




    if (
      error ||
      !authData.user
    ) {


      return {

        data: undefined,

        error,

      };

    }




    const user =

      await this.findUserByEmail(

        email,

      );




    return {

      data: user,

    };

  }


}