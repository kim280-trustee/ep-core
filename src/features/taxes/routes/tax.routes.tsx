import type {
  RouteObject,
} from "react-router-dom";


import {
  AppLayout,
} from "../../../app/layout";


import {
  TaxesPage,
} from "../pages/TaxesPage";


import {
  CreateTaxPage,
} from "../pages/CreateTaxPage";


import {
  EditTaxPage,
} from "../pages/EditTaxPage";



export const taxRoutes: RouteObject[] = [


  {

    path: "/taxes",

    element: (

      <AppLayout>

        <TaxesPage />

      </AppLayout>

    ),

  },


  {

    path: "/taxes/create",

    element: (

      <AppLayout>

        <CreateTaxPage />

      </AppLayout>

    ),

  },


  {

    path: "/taxes/edit/:id",

    element: (

      <AppLayout>

        <EditTaxPage />

      </AppLayout>

    ),

  },


];