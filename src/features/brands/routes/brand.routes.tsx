import type {
  RouteObject,
} from "react-router-dom";


import {
  AppLayout,
} from "../../../app/layout";


import {
  BrandsPage,
} from "../pages/BrandsPage";


import {
  CreateBrandPage,
} from "../pages/CreateBrandPage";


import {
  EditBrandPage,
} from "../pages/EditBrandPage";



export const brandRoutes: RouteObject[] = [


  {

    path: "/brands",

    element: (

      <AppLayout>

        <BrandsPage />

      </AppLayout>

    ),

  },


  {

    path: "/brands/create",

    element: (

      <AppLayout>

        <CreateBrandPage />

      </AppLayout>

    ),

  },


  {

    path: "/brands/edit/:id",

    element: (

      <AppLayout>

        <EditBrandPage />

      </AppLayout>

    ),

  },


];