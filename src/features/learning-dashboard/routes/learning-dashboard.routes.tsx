import type { RouteObject } from "react-router-dom";
import LearningDashboardPage from "../pages/LearningDashboardPage";
import LearningAssignmentsPage from "../pages/LearningAssignmentsPage";
import LearningAssignmentDetailPage from "../pages/LearningAssignmentDetailPage";
import LearningProgressPage from "../pages/LearningProgressPage";
import LearningRecommendationsPage from "../pages/LearningRecommendationsPage";

export const learningDashboardRoutes: RouteObject[] = [
  { path: "learning", element: <LearningDashboardPage /> },
  { path: "learning/assignments", element: <LearningAssignmentsPage /> },
  { path: "learning/assignments/:assignmentId", element: <LearningAssignmentDetailPage /> },
  { path: "learning/progress", element: <LearningProgressPage /> },
  { path: "learning/recommendations", element: <LearningRecommendationsPage /> },
];
