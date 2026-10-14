import type { RouteObject } from "react-router-dom";
import SchoolAdministrationPage from "../pages/SchoolAdministrationPage";

export const learningSchoolAdminRoutes: RouteObject[] = [
  { path: "school-admin", element: <SchoolAdministrationPage /> },
];
