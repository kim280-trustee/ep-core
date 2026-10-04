import type { RouteObject } from "react-router-dom";
import TeacherLayout from "../layouts/TeacherLayout";
import TeacherDashboardPage from "../pages/TeacherDashboardPage";
import TeacherClassPage from "../pages/TeacherClassPage";
import TeacherStudentProfilePage from "../pages/TeacherStudentProfilePage";
import CreateTeacherAssignmentPage from "../pages/CreateTeacherAssignmentPage";
import TeacherAuthoringPage from "../pages/TeacherAuthoringPage";
import QuestionBankPage from "../../learning-assessment/pages/QuestionBankPage";
import TeacherGradebookPage from "../../learning-gradebook/pages/TeacherGradebookPage";
import TeacherStudentPerformancePage from "../../learning-gradebook/pages/TeacherStudentPerformancePage";
import TeacherGradebookSettingsPage from "../../learning-gradebook/pages/TeacherGradebookSettingsPage";
import TeacherGradebookReportsPage from "../../learning-gradebook/pages/TeacherGradebookReportsPage";
import TeacherAssignmentHistoryPage from "../pages/TeacherAssignmentHistoryPage";

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
      { path: "question-bank", element: <QuestionBankPage /> },
      { path: "classes/:classGroupId/assignments/history", element: <TeacherAssignmentHistoryPage /> },
      { path: "classes/:classGroupId/gradebook", element: <TeacherGradebookPage /> },
      { path: "classes/:classGroupId/gradebook/settings", element: <TeacherGradebookSettingsPage /> },
      { path: "classes/:classGroupId/gradebook/reports", element: <TeacherGradebookReportsPage /> },
      { path: "classes/:classGroupId/gradebook/:studentUserId", element: <TeacherStudentPerformancePage /> },
    ],
  },
];
