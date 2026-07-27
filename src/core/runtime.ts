import {
  tenantContext,
} from "./tenant/tenant.context";


import {
  storeContext,
} from "./store/store.context";


import {
  authContext,
} from "./auth/auth.context";


import {
  permissionContext,
} from "./permissions/permission.context";



export function initializeRuntime() {


  tenantContext.setTenant({

    tenantId: "demo-tenant",

    name: "Demo Company",

    country: "Thailand",

    currency: "THB",

  });



  storeContext.setStore({

    storeId: "demo-store",

    tenantId: "demo-tenant",

    name: "Main Store",

  });



  authContext.setAuth({

    userId: "demo-user",

    tenantId: "demo-tenant",

    storeId: "demo-store",

    role: "admin",

    permissions: [

      "manage_products",

      "manage_sales",

      "view_reports",

    ],

  });



  permissionContext.setPermissions({

    role: "admin",

    permissions: [

      "manage_products",

      "manage_sales",

      "view_reports",

    ],

  });


}