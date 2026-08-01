import type {
  RouteObject,
} from "react-router-dom";


import SalesOrdersPage from "../pages/SalesOrdersPage";



export const salesRoutes: RouteObject[] = [

  {

    path: "/sales",

    element:

      <SalesOrdersPage />,

  },

];