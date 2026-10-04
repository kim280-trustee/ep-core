import type { RouteObject } from "react-router-dom";
import TeacherLayout from "../layouts/TeacherLayout";
import TeacherDashboardPage from "../pages/TeacherDashboardPage";
import TeacherClassPage from "../pages/TeacherClassPage";
import TeacherGradebookPage from "../pages/TeacherGradebookPage";
import CreateTeacherAssignmentPage from "../pages/CreateTeacherAssignmentPage";
import TeacherAuthoringPage from "../pages/TeacherAuthoringPage";
import TeacherContentLibraryPage from "@/features/learning-content/pages/TeacherContentLibraryPage";
import TeacherContentCreatePage from "@/features/learning-content/pages/TeacherContentCreatePage";
import TeacherContentDetailPage from "@/features/learning-content/pages/TeacherContentDetailPage";

export const learningTeacherRoutes: RouteObject[] = [
  {
    path: "teacher",
    element: <TeacherLayout />,
    children: [
      { index: true, element: <TeacherDashboardPage /> },
      { path: "content", element: <TeacherContentLibraryPage /> },
      { path: "content/new", element: <TeacherContentCreatePage /> },
      { path: "content/:id", element: <TeacherContentDetailPage /> },
      { path: "classes/:classGroupId", element: <TeacherClassPage /> },
      { path: "classes/:classGroupId/gradebook", element: <TeacherGradebookPage /> },
      { path: "assignments/new", element: <CreateTeacherAssignmentPage /> },
      { path: "authoring", element: <TeacherAuthoringPage /> },
    ],
  },
];
