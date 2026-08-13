import {
  supabase,
} from "../../infrastructure/supabase/client";


export async function seedCore() {

  const tenantId =
    crypto.randomUUID();


  const userId =
    crypto.randomUUID();


  const roleId =
    crypto.randomUUID();


  const permissionIds = [

    crypto.randomUUID(),

    crypto.randomUUID(),

    crypto.randomUUID(),

    crypto.randomUUID(),

  ];


  const {
    error: tenantError,

  } = await supabase

    .from("tenants")

    .insert({

      id: tenantId,

      name: "EP Technologies",

      country: "Thailand",

      currency: "THB",

    });


  if (tenantError) {

    throw tenantError;

  }


  const {
    error: roleError,

  } = await supabase

    .from("roles")

    .insert({

      id: roleId,

      tenant_id: tenantId,

      name: "OWNER",

    });


  if (roleError) {

    throw roleError;

  }


  const permissions = [

    {

      id:
        permissionIds[0],

      code:
        "MANAGE_USERS",

      description:
        "Manage system users",

    },

    {

      id:
        permissionIds[1],

      code:
        "MANAGE_PRODUCTS",

      description:
        "Manage products",

    },

    {

      id:
        permissionIds[2],

      code:
        "PROCESS_SALES",

      description:
        "Process sales",

    },

    {

      id:
        permissionIds[3],

      code:
        "VIEW_REPORTS",

      description:
        "View reports",

    },

  ];


  const {
    error: permissionError,

  } = await supabase

    .from("permissions")

    .insert(

      permissions,

    );


  if (permissionError) {

    throw permissionError;

  }


  const {
    error: userError,

  } = await supabase

    .from("users")

    .insert({

      id: userId,

      tenant_id: tenantId,

      name:
        "Paul",

      email:
        "paul@example.com",

      password_hash:
        "password",

    });


  if (userError) {

    throw userError;

  }


  const {
    error: userRoleError,

  } = await supabase

    .from("user_roles")

    .insert({

      user_id:
        userId,

      role_id:
        roleId,

    });


  if (userRoleError) {

    throw userRoleError;

  }


  const rolePermissions =

    permissionIds.map(

      (permissionId) => ({

        role_id:
          roleId,

        permission_id:
          permissionId,

      }),

    );


  const {
    error: rolePermissionError,

  } = await supabase

    .from("role_permissions")

    .insert(

      rolePermissions,

    );


  if (rolePermissionError) {

    throw rolePermissionError;

  }


  console.log(

    "EP Core seed completed",

  );

}
