import type { RouteObject } from "react-router-dom";
import TeacherLayout from "../layouts/TeacherLayout";

import { lazy } from "react";

const TeacherDashboardPage = lazy(() => import("../pages/TeacherDashboardPage"));
const TeacherClassPage = lazy(() => import("../pages/TeacherClassPage"));
const TeacherStudentProfilePage = lazy(() => import("../pages/TeacherStudentProfilePage"));
const CreateTeacherAssignmentPage = lazy(() => import("../pages/CreateTeacherAssignmentPage"));
const TeacherAuthoringPage = lazy(() => import("../pages/TeacherAuthoringPage"));
const TeacherLessonPlanningPage = lazy(() => import("../pages/TeacherLessonPlanningPage"));
const TeacherInterventionsPage = lazy(() => import("../pages/TeacherInterventionsPage"));
const TeacherAIAssistantPage = lazy(() => import("../pages/TeacherAIAssistantPage"));
const QuestionBankPage = lazy(() => import("../../learning-assessment/pages/QuestionBankPage"));
const TeacherAssessmentBuilderPage = lazy(() => import("../../learning-assessment/pages/TeacherAssessmentBuilderPage"));
const TeacherGradebookPage = lazy(() => import("../../learning-gradebook/pages/TeacherGradebookPage"));
const TeacherStudentPerformancePage = lazy(() => import("../../learning-gradebook/pages/TeacherStudentPerformancePage"));
const TeacherGradebookSettingsPage = lazy(() => import("../../learning-gradebook/pages/TeacherGradebookSettingsPage"));
const TeacherGradebookReportsPage = lazy(() => import("../../learning-gradebook/pages/TeacherGradebookReportsPage"));
const TeacherLearningAnalyticsPage = lazy(() => import("../../learning-gradebook/pages/TeacherLearningAnalyticsPage"));
const TeacherDiagnosticReportPage = lazy(() => import("../../learning-gradebook/pages/TeacherDiagnosticReportPage"));
const TeacherAssignmentHistoryPage = lazy(() => import("../pages/TeacherAssignmentHistoryPage"));
const TeacherParentLinksPage = lazy(() => import("../pages/TeacherParentLinksPage"));
const TeacherContentLibraryPage = lazy(() => import("../../learning-content/pages/TeacherContentLibraryPage"));
const TeacherContentCreatePage = lazy(() => import("../../learning-content/pages/TeacherContentCreatePage"));
const TeacherContentDetailPage = lazy(() => import("../../learning-content/pages/TeacherContentDetailPage"));
const TeacherContentResponsesPage = lazy(() => import("../../learning-content/pages/TeacherContentResponsesPage"));
const TeacherClassGamificationPage = lazy(() => import("../pages/TeacherClassGamificationPage"));
const LearningVocabularyPage = lazy(() => import("@/features/learning-vocabulary").then(({ LearningVocabularyPage }) => ({ default: LearningVocabularyPage })));
const TeacherVocabularyAssignmentPage = lazy(() => import("@/features/learning-vocabulary/pages/TeacherVocabularyAssignmentPage"));

export const learningTeacherRoutes: RouteObject[] = [
  {
    path: "teacher",
    element: <TeacherLayout />,
    children: [
      { index: true, element: <TeacherDashboardPage /> },
      { path: "classes/:classGroupId", element: <TeacherClassPage /> },
      { path: "classes/:classGroupId/students/:studentUserId", element: <TeacherStudentProfilePage /> },
      { path: "assignments/new", element: <CreateTeacherAssignmentPage /> },
      { path: "authoring", element: <TeacherAuthoringPage /> },
      { path: "lesson-plans", element: <TeacherLessonPlanningPage /> },
      { path: "ai-assistant", element: <TeacherAIAssistantPage /> },
      { path: "interventions", element: <TeacherInterventionsPage /> },
      { path: "content", element: <TeacherContentLibraryPage /> },
      { path: "vocabulary", element: <LearningVocabularyPage audience="teacher" /> },
      { path: "vocabulary/assignments/new", element: <TeacherVocabularyAssignmentPage /> },
      { path: "content/new", element: <TeacherContentCreatePage /> },
      { path: "content/:id", element: <TeacherContentDetailPage /> },
      { path: "question-bank", element: <QuestionBankPage /> },
      { path: "assessments", element: <TeacherAssessmentBuilderPage /> },
      { path: "classes/:classGroupId/assignments/history", element: <TeacherAssignmentHistoryPage /> },
      { path: "classes/:classGroupId/parents", element: <TeacherParentLinksPage /> },
      { path: "classes/:classGroupId/gradebook", element: <TeacherGradebookPage /> },
      { path: "classes/:classGroupId/gradebook/settings", element: <TeacherGradebookSettingsPage /> },
      { path: "classes/:classGroupId/gradebook/reports", element: <TeacherGradebookReportsPage /> },
      { path: "classes/:classGroupId/analytics", element: <TeacherLearningAnalyticsPage /> },
      { path: "classes/:classGroupId/diagnostics", element: <TeacherDiagnosticReportPage /> },
      { path: "classes/:classGroupId/gamification", element: <TeacherClassGamificationPage /> },
      { path: "classes/:classGroupId/gradebook/:studentUserId", element: <TeacherStudentPerformancePage /> },
      { path: "assignments/:assignmentId/responses", element: <TeacherContentResponsesPage /> },
    ],
  },
];
