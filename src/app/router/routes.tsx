import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

import { authRoutes } from "../../features/auth/routes/auth.routes";
import { learningDashboardRoutes } from "../../features/learning-dashboard";
import { learningTeacherRoutes } from "../../features/learning-teacher";
import { learningParentRoutes } from "../../features/learning-parent";
import { learningSchoolAdminRoutes } from "../../features/learning-school-admin";
import { learningMarketplaceRoutes } from "../../features/learning-marketplace";
import { learningNotificationsRoutes } from "../../features/learning-notifications";
import { learningSchoolCalendarRoutes } from "../../features/learning-school-calendar";

export const routes: RouteObject[] = [
  ...authRoutes,
  ...learningDashboardRoutes,
  ...learningTeacherRoutes,
  ...learningParentRoutes,
  ...learningSchoolAdminRoutes,
  ...learningMarketplaceRoutes,
  ...learningNotificationsRoutes,
  ...learningSchoolCalendarRoutes,
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "*",
    element: <div>Page Not Found</div>,
  },
];
