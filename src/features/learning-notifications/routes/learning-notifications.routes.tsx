import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/core/auth";

import { lazy } from "react";

const LearningNotificationsPage = lazy(() => import("../pages/LearningNotificationsPage"));

export const learningNotificationsRoutes: RouteObject[] = [
  {
    path: "notifications",
    element: (
      <ProtectedRoute>
        <LearningNotificationsPage />
      </ProtectedRoute>
    ),
  },
];
