import type { RouteObject } from "react-router-dom";
import LearningDashboardPage from "../pages/LearningDashboardPage";
import LearningAssignmentsPage from "../pages/LearningAssignmentsPage";
import LearningAssignmentDetailPage from "../pages/LearningAssignmentDetailPage";
import LearningAssessmentRuntimePage from "../pages/LearningAssessmentRuntimePage";
import LearningProgressPage from "../pages/LearningProgressPage";
import LearningRecommendationsPage from "../pages/LearningRecommendationsPage";
import LearningContentRuntimePage from "../pages/LearningContentRuntimePage";

export const learningDashboardRoutes: RouteObject[] = [
  { path: "learning", element: <LearningDashboardPage /> },
  { path: "learning/assignments", element: <LearningAssignmentsPage /> },
  {
    path: "learning/assignments/:assignmentId",
    element: <LearningAssignmentDetailPage />,
  },
  {
    path: "learning/assignments/:assignmentId/assessments/:assessmentId",
    element: <LearningAssessmentRuntimePage />,
  },
  { path: "learning/assignments/:assignmentId/content/:contentId", element: <LearningContentRuntimePage /> },
  { path: "learning/progress", element: <LearningProgressPage /> },
  { path: "learning/recommendations", element: <LearningRecommendationsPage /> },
];
