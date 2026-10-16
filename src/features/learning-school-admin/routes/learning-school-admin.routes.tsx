import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/core/auth";
import SchoolAdministrationPage from "../pages/SchoolAdministrationPage";
import SchoolParentLinksPage from "../pages/SchoolParentLinksPage";
import SchoolTimetablePage from "../pages/SchoolTimetablePage";

export const learningSchoolAdminRoutes: RouteObject[] = [
  { path: "school-admin", element: <ProtectedRoute><SchoolAdministrationPage /></ProtectedRoute> },
  { path: "school-admin/parents", element: <ProtectedRoute><SchoolParentLinksPage /></ProtectedRoute> },
  { path: "school-admin/timetable", element: <ProtectedRoute><SchoolTimetablePage /></ProtectedRoute> },
];
