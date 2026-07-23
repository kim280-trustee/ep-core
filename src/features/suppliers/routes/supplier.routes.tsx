import type {
  RouteObject,
} from "react-router-dom";


import {
  AppLayout,
} from "../../../app/layout";


import {
  SuppliersPage,
} from "../pages/SuppliersPage";


import {
  CreateSupplierPage,
} from "../pages/CreateSupplierPage";


import {
  EditSupplierPage,
} from "../pages/EditSupplierPage";



export const supplierRoutes: RouteObject[] = [


  {

    path: "/suppliers",

    element: (

      <AppLayout>

        <SuppliersPage />

      </AppLayout>

    ),

  },


  {

    path: "/suppliers/create",

    element: (

      <AppLayout>

        <CreateSupplierPage />

      </AppLayout>

    ),

  },


  {

    path: "/suppliers/edit/:id",

    element: (

      <AppLayout>

        <EditSupplierPage />

      </AppLayout>

    ),

  },


];