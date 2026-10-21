/* eslint-disable react-refresh/only-export-components -- Route config modules intentionally define lazy page components and export route objects. */
import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/core/auth";
import StudentLayout from "../layouts/StudentLayout";

const LearningDashboardPage = lazy(() => import("../pages/LearningDashboardPage"));
const LearningDailyHubPage = lazy(() => import("../pages/LearningDailyHubPage"));
const LearningAICoachPage = lazy(() => import("../pages/LearningAICoachPage"));
const LearningAssignmentsPage = lazy(() => import("../pages/LearningAssignmentsPage"));
const LearningAssignmentDetailPage = lazy(() => import("../pages/LearningAssignmentDetailPage"));
const LearningAssessmentRuntimePage = lazy(() => import("../pages/LearningAssessmentRuntimePage"));
const LearningProgressPage = lazy(() => import("../pages/LearningProgressPage"));
const LearningRecommendationsPage = lazy(() => import("../pages/LearningRecommendationsPage"));
const LearningRewardsPage = lazy(() => import("../pages/LearningRewardsPage"));
const LearningVocabularyPage = lazy(() => import("@/features/learning-vocabulary").then(({ LearningVocabularyPage }) => ({ default: LearningVocabularyPage })));
const LearningContentRuntimePage = lazy(() => import("../pages/LearningContentRuntimePage"));

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
      { path: "coach", element: <LearningAICoachPage /> },
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
