import {
  supabase,
} from "@/core/database";

import type {
  RegisterOwnerRepository,
} from "./register-owner.repository";

import type {
  Tenant,
  User,
} from "../types";


export class SupabaseRegisterOwnerRepository
implements RegisterOwnerRepository {



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
        "OWNER",

      createdAt:
        data.created_at,

    };

  }





  async createCompanySettings(
    data: {
      tenantId: string;

      businessName: string;
    },
  ): Promise<void> {


    const {
      error,
    } =
      await supabase
        .from("company_settings")
        .insert({

          tenant_id:
            data.tenantId,

          business_name:
            data.businessName,

        });



    if (error) {

      throw error;

    }

  }





  async createOwnerRole(
    tenantId: string,
  ): Promise<string> {


    const {
      data,
      error,
    } =
      await supabase
        .from("roles")
        .insert({

          tenant_id:
            tenantId,

          name:
            "OWNER",

        })
        .select("id")
        .single();



    if (error) {

      throw error;

    }



    return data.id;

  }





  async assignUserRole(
    userId: string,

    roleId: string,
  ): Promise<void> {


    const {
      error,
    } =
      await supabase
        .from("user_roles")
        .insert({

          user_id:
            userId,

          role_id:
            roleId,

        });



    if (error) {

      throw error;

    }

  }


}