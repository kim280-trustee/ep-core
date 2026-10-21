import type { RouteObject } from "react-router-dom";
import TeacherLayout from "../layouts/TeacherLayout";
import TeacherDashboardPage from "../pages/TeacherDashboardPage";
import TeacherClassPage from "../pages/TeacherClassPage";
import TeacherStudentProfilePage from "../pages/TeacherStudentProfilePage";
import CreateTeacherAssignmentPage from "../pages/CreateTeacherAssignmentPage";
import TeacherAuthoringPage from "../pages/TeacherAuthoringPage";
import TeacherAIAssistantPage from "../pages/TeacherAIAssistantPage";
import QuestionBankPage from "../../learning-assessment/pages/QuestionBankPage";
import TeacherAssessmentBuilderPage from "../../learning-assessment/pages/TeacherAssessmentBuilderPage";
import TeacherGradebookPage from "../../learning-gradebook/pages/TeacherGradebookPage";
import TeacherStudentPerformancePage from "../../learning-gradebook/pages/TeacherStudentPerformancePage";
import TeacherGradebookSettingsPage from "../../learning-gradebook/pages/TeacherGradebookSettingsPage";
import TeacherGradebookReportsPage from "../../learning-gradebook/pages/TeacherGradebookReportsPage";
import TeacherLearningAnalyticsPage from "../../learning-gradebook/pages/TeacherLearningAnalyticsPage";
import TeacherDiagnosticReportPage from "../../learning-gradebook/pages/TeacherDiagnosticReportPage";
import TeacherAssignmentHistoryPage from "../pages/TeacherAssignmentHistoryPage";
import TeacherParentLinksPage from "../pages/TeacherParentLinksPage";
import TeacherContentLibraryPage from "../../learning-content/pages/TeacherContentLibraryPage";
import TeacherContentCreatePage from "../../learning-content/pages/TeacherContentCreatePage";
import TeacherContentDetailPage from "../../learning-content/pages/TeacherContentDetailPage";
import TeacherContentResponsesPage from "../../learning-content/pages/TeacherContentResponsesPage";
import TeacherClassGamificationPage from "../pages/TeacherClassGamificationPage";
import TeacherInterventionsPage from "../pages/TeacherInterventionsPage";
import { LearningVocabularyPage } from "@/features/learning-vocabulary";
import TeacherVocabularyAssignmentPage from "@/features/learning-vocabulary/pages/TeacherVocabularyAssignmentPage";

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
