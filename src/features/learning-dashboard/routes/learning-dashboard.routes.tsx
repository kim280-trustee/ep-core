import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/core/auth";
import LearningDashboardPage from "../pages/LearningDashboardPage";
import LearningDailyHubPage from "../pages/LearningDailyHubPage";
import LearningAssignmentsPage from "../pages/LearningAssignmentsPage";
import LearningAssignmentDetailPage from "../pages/LearningAssignmentDetailPage";
import LearningAssessmentRuntimePage from "../pages/LearningAssessmentRuntimePage";
import LearningProgressPage from "../pages/LearningProgressPage";
import LearningRecommendationsPage from "../pages/LearningRecommendationsPage";
import LearningRewardsPage from "../pages/LearningRewardsPage";
import { LearningVocabularyPage } from "@/features/learning-vocabulary";
import LearningContentRuntimePage from "../pages/LearningContentRuntimePage";
import StudentLayout from "../layouts/StudentLayout";

export const learningDashboardRoutes: RouteObject[] = [
  {
    path: "learning",
    element: (
      <ProtectedRoute>
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <LearningDashboardPage /> },
      { path: "today", element: <LearningDailyHubPage /> },
      { path: "assignments", element: <LearningAssignmentsPage /> },
      { path: "assignments/:assignmentId", element: <LearningAssignmentDetailPage /> },
      { path: "assignments/:assignmentId/assessments/:assessmentId", element: <LearningAssessmentRuntimePage /> },
      { path: "assignments/:assignmentId/content/:contentId", element: <LearningContentRuntimePage /> },
      { path: "progress", element: <LearningProgressPage /> },
      { path: "recommendations", element: <LearningRecommendationsPage /> },
      { path: "rewards", element: <LearningRewardsPage /> },
      { path: "vocabulary", element: <LearningVocabularyPage audience="student" /> },
    ],
  },
  { path: "student", element: <Navigate to="/learning" replace /> },
];
