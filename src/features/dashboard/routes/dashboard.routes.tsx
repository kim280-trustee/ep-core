/**
 * ============================================================
 * E&P Technologies
 * E&P Smart POS
 * Dashboard Routes
 * ============================================================
 */

import type {
  RouteObject,
} from "react-router-dom";

import DashboardPage from "../pages/DashboardPage";


export const dashboardRoutes: RouteObject[] = [

  {
    index: true,

    element: <DashboardPage />,
  },

  {
    path: "dashboard",

    element: <DashboardPage />,
  },

];