import type { RouteObject } from "react-router-dom";
import { ReportsPage } from "../pages";

export const reportsRoutes: RouteObject[] = [
  {
    path: "reports",
    element: <ReportsPage />,
  },
];
