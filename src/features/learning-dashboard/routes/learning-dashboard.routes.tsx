import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import LearningDashboardPage from "../pages/LearningDashboardPage";
import LearningAssignmentsPage from "../pages/LearningAssignmentsPage";
import LearningAssignmentDetailPage from "../pages/LearningAssignmentDetailPage";
import LearningAssessmentRuntimePage from "../pages/LearningAssessmentRuntimePage";
import LearningProgressPage from "../pages/LearningProgressPage";
import LearningRecommendationsPage from "../pages/LearningRecommendationsPage";
import LearningContentRuntimePage from "../pages/LearningContentRuntimePage";
import StudentLayout from "../layouts/StudentLayout";

export const learningDashboardRoutes: RouteObject[] = [
  {
    path: "learning",
    element: <StudentLayout />,
    children: [
      { index: true, element: <LearningDashboardPage /> },
      { path: "assignments", element: <LearningAssignmentsPage /> },
      { path: "assignments/:assignmentId", element: <LearningAssignmentDetailPage /> },
      { path: "assignments/:assignmentId/assessments/:assessmentId", element: <LearningAssessmentRuntimePage /> },
      { path: "assignments/:assignmentId/content/:contentId", element: <LearningContentRuntimePage /> },
      { path: "progress", element: <LearningProgressPage /> },
      { path: "recommendations", element: <LearningRecommendationsPage /> },
    ],
  },
  { path: "student", element: <Navigate to="/learning" replace /> },
];
