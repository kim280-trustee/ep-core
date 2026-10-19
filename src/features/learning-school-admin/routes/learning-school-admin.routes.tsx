import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/core/auth";
import SchoolAdministrationPage from "../pages/SchoolAdministrationPage";
import SchoolAnalyticsPage from "../pages/SchoolAnalyticsPage";

export const learningSchoolAdminRoutes: RouteObject[] = [
  { path: "school-admin", element: <ProtectedRoute><SchoolAdministrationPage /></ProtectedRoute> },
  { path: "school-admin/analytics", element: <ProtectedRoute><SchoolAnalyticsPage /></ProtectedRoute> },
];
