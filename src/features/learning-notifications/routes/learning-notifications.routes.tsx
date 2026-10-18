import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/core/auth";
import LearningNotificationsPage from "../pages/LearningNotificationsPage";

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
