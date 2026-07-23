import type {
  RouteObject,
} from "react-router-dom";


import {
  AppLayout,
} from "../../../app/layout";


import {
  CustomersPage,
} from "../pages/CustomersPage";


import {
  CreateCustomerPage,
} from "../pages/CreateCustomerPage";


import {
  EditCustomerPage,
} from "../pages/EditCustomerPage";



export const customerRoutes: RouteObject[] = [


  {

    path: "/customers",

    element: (

      <AppLayout>

        <CustomersPage />

      </AppLayout>

    ),

  },


  {

    path: "/customers/create",

    element: (

      <AppLayout>

        <CreateCustomerPage />

      </AppLayout>

    ),

  },


  {

    path: "/customers/edit/:id",

    element: (

      <AppLayout>

        <EditCustomerPage />

      </AppLayout>

    ),

  },


];