import {
  v4 as uuid,
} from "uuid";


import {
  supabase,
} from "@/core/database";


import type {
  Tenant,
  User,
  RegisterOwnerRequest,
} from "../types";


import {
  SupabaseRegisterOwnerRepository,
} from "../repositories";



class RegisterOwnerService {



  private repository =
    new SupabaseRegisterOwnerRepository();




  async execute(
    request: RegisterOwnerRequest,
  ) {



    const {
      data: authData,
      error: authError,
    } =
      await supabase.auth.signUp({

        email:
          request.email,

        password:
          request.password,

      });





    if (authError) {

      throw authError;

    }





    if (!authData.user) {

      throw new Error(
        "Unable to create authentication user",
      );

    }

const {
  data: sessionData,
} =
await supabase.auth.getSession();


console.log(
  "SIGNUP USER:",
  authData.user.id,
);


console.log(
  "SESSION AFTER SIGNUP:",
  sessionData.session,
);



    console.log(
      "AUTH USER:",
      authData.user,
    );


    console.log(
      "SESSION:",
      authData.session,
    );





    const tenant: Tenant = {


      id:
        uuid(),


      name:
        request.businessName,


      country:
        request.country,


      currency:
        request.currency,


      createdAt:
        new Date().toISOString(),

    };





    await this.repository.createTenant(
      tenant,
    );





    await this.repository.createCompanySettings({

      tenantId:
        tenant.id,


      businessName:
        request.businessName,

    });





    const user: User = {


      id:
        uuid(),


      authUserId:
        authData.user.id,


      tenantId:
        tenant.id,


      name:
        request.ownerName,


      email:
        request.email,


      role:
        "OWNER",


      createdAt:
        new Date().toISOString(),

    };





    const createdUser =

      await this.repository.createUser(
        user,
      );





    const roleId =

      await this.repository.createOwnerRole(
        tenant.id,
      );





    await this.repository.assignUserRole(

      createdUser.id,

      roleId,

    );





    return {


      tenant,


      user:
        createdUser,


    };


  }


}




export const registerOwnerService =

  new RegisterOwnerService();