import type { RouteObject } from "react-router-dom";
import TeacherLayout from "../layouts/TeacherLayout";
import TeacherDashboardPage from "../pages/TeacherDashboardPage";
import TeacherClassPage from "../pages/TeacherClassPage";
import CreateTeacherAssignmentPage from "../pages/CreateTeacherAssignmentPage";
import TeacherAuthoringPage from "../pages/TeacherAuthoringPage";
import TeacherContentLibraryPage from "@/features/learning-content/pages/TeacherContentLibraryPage";
import TeacherContentCreatePage from "@/features/learning-content/pages/TeacherContentCreatePage";

export const learningTeacherRoutes: RouteObject[] = [
  {
    path: "teacher",
    element: <TeacherLayout />,
    children: [
      { index: true, element: <TeacherDashboardPage /> },
      {
        path: "content",
        element: <TeacherContentLibraryPage />,
      },
      {
        path: "content/new",
        element: <TeacherContentCreatePage />,
      },
      {
        path: "classes/:classGroupId",
        element: <TeacherClassPage />,
      },
      {
        path: "assignments/new",
        element: <CreateTeacherAssignmentPage />,
      },
      {
        path: "authoring",
        element: <TeacherAuthoringPage />,
      },
    ],
  },
];
