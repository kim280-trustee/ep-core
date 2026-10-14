import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/core/auth";
import SchoolAdministrationPage from "../pages/SchoolAdministrationPage";

export const learningSchoolAdminRoutes: RouteObject[] = [
  { path: "school-admin", element: <ProtectedRoute><SchoolAdministrationPage /></ProtectedRoute> },
];
