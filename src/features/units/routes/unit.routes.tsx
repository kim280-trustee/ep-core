import type {
  RouteObject,
} from "react-router-dom";


import {
  AppLayout,
} from "../../../app/layout";


import {
  UnitsPage,
} from "../pages/UnitsPage";


import {
  CreateUnitPage,
} from "../pages/CreateUnitPage";


import {
  EditUnitPage,
} from "../pages/EditUnitPage";



export const unitRoutes: RouteObject[] = [


  {

    path: "/units",

    element: (

      <AppLayout>

        <UnitsPage />

      </AppLayout>

    ),

  },


  {

    path: "/units/create",

    element: (

      <AppLayout>

        <CreateUnitPage />

      </AppLayout>

    ),

  },


  {

    path: "/units/edit/:id",

    element: (

      <AppLayout>

        <EditUnitPage />

      </AppLayout>

    ),

  },


];