import type { RouteObject } from "react-router-dom";
import LearningDashboardPage from "../pages/LearningDashboardPage";

export const learningDashboardRoutes: RouteObject[] = [
  { path: "learning", element: <LearningDashboardPage /> },
];
