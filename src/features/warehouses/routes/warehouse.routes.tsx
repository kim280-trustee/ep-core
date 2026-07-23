import type {
  RouteObject,
} from "react-router-dom";


import {
  AppLayout,
} from "../../../app/layout";


import {
  WarehousesPage,
} from "../pages/WarehousesPage";


import {
  CreateWarehousePage,
} from "../pages/CreateWarehousePage";


import {
  EditWarehousePage,
} from "../pages/EditWarehousePage";



export const warehouseRoutes: RouteObject[] = [


  {

    path: "/warehouses",

    element: (

      <AppLayout>

        <WarehousesPage />

      </AppLayout>

    ),

  },


  {

    path: "/warehouses/create",

    element: (

      <AppLayout>

        <CreateWarehousePage />

      </AppLayout>

    ),

  },


  {

    path: "/warehouses/edit/:id",

    element: (

      <AppLayout>

        <EditWarehousePage />

      </AppLayout>

    ),

  },


];