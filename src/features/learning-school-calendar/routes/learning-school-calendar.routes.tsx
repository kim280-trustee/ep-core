import type { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/core/auth";
import LearningSchoolCalendarPage from "../pages/LearningSchoolCalendarPage";

export const learningSchoolCalendarRoutes: RouteObject[] = [
  { path: "calendar", element: <ProtectedRoute><LearningSchoolCalendarPage /></ProtectedRoute> },
];
