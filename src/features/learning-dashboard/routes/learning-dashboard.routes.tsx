import type { RouteObject } from "react-router-dom";
import LearningLayout from "../layouts/LearningLayout";
import LearningDashboardPage from "../pages/LearningDashboardPage";
import LearningAssignmentsPage from "../pages/LearningAssignmentsPage";
import LearningAssignmentDetailPage from "../pages/LearningAssignmentDetailPage";
import LearningProgressPage from "../pages/LearningProgressPage";
import LearningRecommendationsPage from "../pages/LearningRecommendationsPage";
import LearningAssessmentPage from "../pages/LearningAssessmentPage";

export const learningDashboardRoutes: RouteObject[] = [
  {
    path: "learning",
    element: <LearningLayout />,
    children: [
      { index: true, element: <LearningDashboardPage /> },
      { path: "assignments", element: <LearningAssignmentsPage /> },
      {
        path: "assignments/:assignmentId",
        element: <LearningAssignmentDetailPage />,
      },
      { path: "progress", element: <LearningProgressPage /> },
      { path: "recommendations", element: <LearningRecommendationsPage /> },
      {
        path: "assessments/:assessmentId",
        element: <LearningAssessmentPage />,
      },
    ],
  },
];
