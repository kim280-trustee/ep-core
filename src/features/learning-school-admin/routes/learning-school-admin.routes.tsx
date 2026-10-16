import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/core/auth";
import SchoolAdministrationPage from "../pages/SchoolAdministrationPage";
import SchoolTimetablePage from "../pages/SchoolTimetablePage";

export const learningSchoolAdminRoutes: RouteObject[] = [
  { path: "school-admin", element: <ProtectedRoute><SchoolAdministrationPage /></ProtectedRoute> },
  { path: "school-admin/timetable", element: <ProtectedRoute><SchoolTimetablePage /></ProtectedRoute> },
];
