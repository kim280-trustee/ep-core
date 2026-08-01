import type {
  RouteObject,
} from "react-router-dom";


import PaymentsPage from "../pages/PaymentsPage";


export const paymentRoutes: RouteObject[] = [

  {

    path: "/payments",

    element:

      <PaymentsPage />,

  },

];