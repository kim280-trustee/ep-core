import type {
  RouteObject,
} from "react-router-dom";


import PurchaseOrdersPage from "../pages/PurchaseOrdersPage";

import CreatePurchaseOrderPage from "../pages/CreatePurchaseOrderPage";

import PurchaseOrderDetailsPage from "../pages/PurchaseOrderDetailsPage";



export const purchasingRoutes: RouteObject[] = [

  {

    path: "/purchasing",

    element:

      <PurchaseOrdersPage />,

  },


  {

    path: "/purchasing/create",

    element:

      <CreatePurchaseOrderPage />,

  },


  {

    path: "/purchasing/:id",

    element:

      <PurchaseOrderDetailsPage />,

  },

];